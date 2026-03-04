import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = session.user.role;

    const { id: siteId } = await params;
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", siteId);
    await mkdir(uploadDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${siteId}/${safeName}`;
    const isImage = file.type.startsWith("image/");

    const attachment = await prisma.siteAttachment.create({
        data: {
            siteId,
            fileName: file.name,
            fileUrl,
            fileType: isImage ? "image" : "document",
            fileSize: file.size,
            uploadedById: session.user.id,
        },
        include: { uploadedBy: { select: { name: true } } },
    });

    await prisma.auditLog.create({
        data: {
            siteId,
            userId: session.user.id,
            action: "UPLOAD",
            description: `Upload file "${file.name}"`,
        },
    });

    return NextResponse.json(attachment, { status: 201 });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = session.user.role;

    const { id: siteId } = await params;
    const { searchParams } = new URL(req.url);
    const attachmentId = searchParams.get("attachmentId");
    if (!attachmentId) return NextResponse.json({ error: "Missing attachmentId" }, { status: 400 });

    const attachment = await prisma.siteAttachment.findUnique({ where: { id: attachmentId } });
    if (!attachment || attachment.siteId !== siteId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only Admin, Site Team, or the uploader themselves can delete
    if (role !== "ADMIN" && role !== "SITE_TEAM" && attachment.uploadedById !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.siteAttachment.delete({ where: { id: attachmentId } });

    await prisma.auditLog.create({
        data: {
            siteId,
            userId: session.user.id,
            action: "DELETE_ATTACHMENT",
            description: `Xóa file "${attachment.fileName}"`,
        },
    });

    return NextResponse.json({ success: true });
}
