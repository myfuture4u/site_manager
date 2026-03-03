import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const city = searchParams.get("city") || "";
    const siteType = searchParams.get("siteType") || "";

    const where: Record<string, unknown> = {};
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { address: { contains: search } },
            { city: { contains: search } },
        ];
    }
    if (status) where.status = status;
    if (city) where.city = { contains: city };
    if (siteType) where.siteType = siteType;

    const [sites, total] = await Promise.all([
        prisma.site.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { updatedAt: "desc" },
            include: {
                createdBy: { select: { name: true, email: true } },
                _count: { select: { comments: true, attachments: true } },
            },
        }),
        prisma.site.count({ where }),
    ]);

    return NextResponse.json({ sites, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = session.user.role;
    if (role !== "ADMIN" && role !== "SITE_TEAM") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, address, ward, district, city, siteType, description, rentPrice, rentUnit, rentType, floorArea, frontage, floors, mapsLink } = body;

    if (!name || !address || !city || !siteType) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const site = await prisma.site.create({
        data: {
            name, address, ward, district, city, siteType, description,
            rentPrice: rentPrice ? parseFloat(rentPrice) : null,
            rentUnit, rentType,
            floorArea: floorArea ? parseFloat(floorArea) : null,
            frontage: frontage ? parseFloat(frontage) : null,
            floors: floors ? parseInt(floors) : null,
            mapsLink,
            createdById: session.user.id,
            status: "NEW",
        },
        include: { createdBy: { select: { name: true } } },
    });

    await prisma.auditLog.create({
        data: {
            siteId: site.id,
            userId: session.user.id,
            action: "CREATE",
            description: `Site "${site.name}" được tạo mới`,
        },
    });

    return NextResponse.json(site, { status: 201 });
}
