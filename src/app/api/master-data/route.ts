import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const where = type ? { type } : {};
    const data = await prisma.masterData.findMany({
        where,
        orderBy: [{ type: "asc" }, { order: "asc" }, { value: "asc" }]
    });

    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { type, value, parentValue, isActive, order } = body;

    if (!type || !value) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const item = await prisma.masterData.create({
        data: { type, value, parentValue, isActive: isActive ?? true, order: order ? parseInt(order) : 0 }
    });

    return NextResponse.json(item, { status: 201 });
}
