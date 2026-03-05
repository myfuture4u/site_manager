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

        // expected body: { visibleToRoles: ["BOD", "BRAND_TEAM"], visibleToUsers: ["userId1", "userId2"] }
        const { visibleToRoles, visibleToUsers = [] } = body;

        if (!Array.isArray(visibleToRoles) || !Array.isArray(visibleToUsers)) {
            return NextResponse.json({ error: "Invalid payload: visibleToRoles and visibleToUsers must be arrays" }, { status: 400 });
        }

        const oldSite = await prisma.site.findUnique({ where: { id } });
        if (!oldSite) return NextResponse.json({ error: "Site not found" }, { status: 404 });

        const updatedSite = await prisma.site.update({
            where: { id },
            data: {
                isSubmitted: true,
                visibleToRoles: JSON.stringify(visibleToRoles),
                visibleToUsers: JSON.stringify(visibleToUsers),
                status: "REVIEWING", // Update status when submitting
            }
        });

        // Write audit log
        await prisma.auditLog.create({
            data: {
                siteId: id,
                userId: session.user.id,
                action: "SUBMIT",
                description: `Site đã được Submit cho các nhóm: ${visibleToRoles.join(", ")} và ${visibleToUsers.length} cá nhân.`,
            },
        });

        // Gather all users to notify
        let usersToNotify: any[] = [];

        if (visibleToRoles.length > 0) {
            const roleUsers = await prisma.user.findMany({
                where: {
                    role: { in: visibleToRoles },
                    isActive: true
                }
            });
            usersToNotify = [...roleUsers];
        }

        if (visibleToUsers.length > 0) {
            const specificUsers = await prisma.user.findMany({
                where: {
                    id: { in: visibleToUsers },
                    isActive: true
                }
            });

            // Add specific users, ensuring no duplicates
            for (const user of specificUsers) {
                if (!usersToNotify.find(u => u.id === user.id)) {
                    usersToNotify.push(user);
                }
            }
        }

        const notifications = usersToNotify.map(user => ({
            userId: user.id,
            siteId: id,
            title: "Mặt bằng mới cần đánh giá",
            message: `Mặt bằng "${updatedSite.name}" vừa được gửi cho bạn để xem qua.`
        }));

        if (notifications.length > 0) {
            await prisma.notification.createMany({
                data: notifications
            });
        }

        return NextResponse.json(updatedSite);
    } catch (error: any) {
        console.error("Error submitting site:", error);
        return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
    }
}
