import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const site = await prisma.site.findUnique({
        where: { id },
        include: {
            createdBy: { select: { name: true, email: true } },
            attachments: { include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
            comments: {
                include: { user: { select: { name: true, role: true } } },
                orderBy: { createdAt: "desc" },
            },
            auditLogs: {
                include: { user: { select: { name: true } } },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
    return NextResponse.json(site);
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = session.user.role;
    if (role !== "ADMIN" && role !== "SITE_MANAGER" && role !== "SITE_DEVELOPER") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const oldSite = await prisma.site.findUnique({ where: { id } });
        if (!oldSite) return NextResponse.json({ error: "Site not found" }, { status: 404 });

        const { name, address, street, ward, district, city, siteType, description, rentPrice, rentUnit, rentType, floorArea, frontage, floors, mapsLink, status } = body;

        // Track changes for audit log
        const changes: Array<{ field: string; old: string; new: string }> = [];
        const fieldsToCheck: Array<[string, unknown, unknown]> = [
            ["name", oldSite.name, name],
            ["address", oldSite.address, address],
            ["street", oldSite.street, street],
            ["ward", oldSite.ward, ward],
            ["city", oldSite.city, city],
            ["status", oldSite.status, status],
            ["rentPrice", oldSite.rentPrice, rentPrice],
            ["rentType", oldSite.rentType, rentType],
        ];
        for (const [field, oldVal, newVal] of fieldsToCheck) {
            if (newVal !== undefined && String(oldVal) !== String(newVal)) {
                changes.push({ field, old: String(oldVal ?? ""), new: String(newVal ?? "") });
            }
        }

        const updated = await prisma.site.update({
            where: { id },
            data: {
                name, address, street, ward, district, city, siteType, description,
                rentPrice: rentPrice != null ? parseFloat(rentPrice) : null,
                rentUnit, rentType,
                floorArea: floorArea != null ? parseFloat(floorArea) : null,
                frontage: frontage != null ? parseFloat(frontage) : null,
                floors: floors != null ? parseInt(floors) : null,
                mapsLink, status,
            },
            include: { createdBy: { select: { name: true } } },
        });

        // Write audit log for each change
        for (const change of changes) {
            await prisma.auditLog.create({
                data: {
                    siteId: id,
                    userId: session.user.id,
                    action: change.field === "status" ? "STATUS_CHANGE" : "UPDATE",
                    fieldChanged: change.field,
                    oldValue: change.old,
                    newValue: change.new,
                    description: `Cập nhật "${change.field}": ${change.old} → ${change.new}`,
                },
            });
        }

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Error updating site:", error);
        return NextResponse.json({ error: "Lỗi server khi cập nhật mặt bằng: " + error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.site.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
