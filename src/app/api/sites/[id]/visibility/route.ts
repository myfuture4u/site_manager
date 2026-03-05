import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.role;
    if (role !== "ADMIN" && role !== "SITE_MANAGER") {
        return NextResponse.json({ error: "Forbidden: Only Admin or Site Manager can submit sites" }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await req.json();

        // expected body: { visibleToRoles: ["BOD", "BRAND_TEAM"] }
        const { visibleToRoles } = body;

        if (!Array.isArray(visibleToRoles)) {
            return NextResponse.json({ error: "Invalid payload: visibleToRoles must be an array" }, { status: 400 });
        }

        const oldSite = await prisma.site.findUnique({ where: { id } });
        if (!oldSite) return NextResponse.json({ error: "Site not found" }, { status: 404 });

        const updatedSite = await prisma.site.update({
            where: { id },
            data: {
                isSubmitted: true,
                visibleToRoles: JSON.stringify(visibleToRoles),
                status: "REVIEWING", // Update status when submitting
            }
        });

        // Write audit log
        await prisma.auditLog.create({
            data: {
                siteId: id,
                userId: session.user.id,
                action: "SUBMIT",
                description: `Site đã được Submit cho các nhóm: ${visibleToRoles.join(", ")}`,
            },
        });

        // Ensure users in these roles get a notification
        if (visibleToRoles.length > 0) {
            const usersToNotify = await prisma.user.findMany({
                where: {
                    role: { in: visibleToRoles },
                    isActive: true
                }
            });

            const notifications = usersToNotify.map(user => ({
                userId: user.id,
                siteId: id,
                title: "Mặt bằng mới cần đánh giá",
                message: `Mặt bằng "${updatedSite.name}" vừa được gửi cho bạn để xem qua.`,
            }));

            if (notifications.length > 0) {
                await prisma.notification.createMany({
                    data: notifications
                });
            }
        }

        return NextResponse.json(updatedSite);
    } catch (error: any) {
        console.error("Error submitting site:", error);
        return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
    }
}
