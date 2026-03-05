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
    const timeRange = searchParams.get("timeRange") || "";

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

    if (timeRange) {
        const now = new Date();
        let fromDate = new Date();
        if (timeRange === "7d") fromDate.setDate(now.getDate() - 7);
        else if (timeRange === "14d") fromDate.setDate(now.getDate() - 14);
        else if (timeRange === "1m") fromDate.setMonth(now.getMonth() - 1);
        else if (timeRange === "3m") fromDate.setMonth(now.getMonth() - 3);
        else if (timeRange === "1y") fromDate.setFullYear(now.getFullYear() - 1);

        if (timeRange !== "all") {
            where.createdAt = { gte: fromDate };
        }
    }

    const role = session.user.role;
    const userId = session.user.id;

    if (role === "ADMIN" || role === "SITE_MANAGER") {
        // Can see all sites
    } else if (role === "SITE_DEVELOPER") {
        // Can see sites they created, OR sites that are submitted and visible to SITE_DEVELOPER
        where.OR = [
            ...(where.OR ? where.OR as any[] : []),
            { createdById: userId },
            {
                AND: [
                    { isSubmitted: true },
                    { visibleToRoles: { contains: `"SITE_DEVELOPER"` } }
                ]
            }
        ];
    } else {
        // Other roles can only see submitted sites where their role is in visibleToRoles
        where.isSubmitted = true;
        where.visibleToRoles = { contains: `"${role}"` };
    }


    const [sites, total] = await Promise.all([
        prisma.site.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { updatedAt: "desc" },
            include: {
                createdBy: { select: { name: true, email: true } },
                _count: { select: { comments: true, attachments: true } },
                attachments: {
                    where: { fileType: "image" },
                    take: 1,
                    select: { fileUrl: true }
                }
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
    if (role !== "ADMIN" && role !== "SITE_MANAGER" && role !== "SITE_DEVELOPER") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, address, street, ward, district, city, siteType, description, rentPrice, rentUnit, rentType, floorArea, frontage, floors, mapsLink } = body;

        if (!name || !address || !city || !siteType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const site = await prisma.site.create({
            data: {
                name, address, street, ward, district, city, siteType, description,
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
    } catch (error: any) {
        console.error("Error creating site:", error);
        return NextResponse.json({ error: "Lỗi server khi tạo mặt bằng: " + error.message }, { status: 500 });
    }
}
