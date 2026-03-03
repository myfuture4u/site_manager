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

    const { id: siteId } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
        return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
        data: { siteId, userId: session.user.id, content: content.trim() },
        include: { user: { select: { name: true, role: true } } },
    });

    return NextResponse.json(comment, { status: 201 });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: siteId } = await params;
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");
    if (!commentId) return NextResponse.json({ error: "Missing commentId" }, { status: 400 });

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.siteId !== siteId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only the comment owner or Admin can delete
    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return NextResponse.json({ success: true });
}
