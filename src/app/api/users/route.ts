import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "qsrvietnam.com";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SITE_MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true, email: true, name: true, role: true, isActive: true, createdAt: true
        },
    });
    return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email, name, password, role } = body;

    if (!email || !name || !password || !role) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailDomain = email.split("@")[1];
    if (emailDomain !== ALLOWED_DOMAIN) {
        return NextResponse.json({ error: `Email phải có đuôi @${ALLOWED_DOMAIN}` }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json({ error: "Email đã tồn tại" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: { email, name, password: hashed, role },
        select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
}
