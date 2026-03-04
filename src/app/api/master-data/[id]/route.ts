import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    // require ADMIN
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const { type, value, parentValue, isActive, order } = body;

    const item = await prisma.masterData.update({
        where: { id },
        data: {
            type,
            value,
            parentValue,
            isActive: isActive ?? true,
            order: order != null ? parseInt(order) : 0
        }
    });

    return NextResponse.json(item);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await prisma.masterData.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
