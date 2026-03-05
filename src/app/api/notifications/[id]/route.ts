import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;

        if (id === "all") {
            await prisma.notification.updateMany({
                where: { userId: session.user.id, isRead: false },
                data: { isRead: true }
            });
            return NextResponse.json({ success: true });
        }

        const notification = await prisma.notification.findUnique({ where: { id } });

        if (!notification || notification.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden or not found" }, { status: 403 });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Error marking notification as read:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
