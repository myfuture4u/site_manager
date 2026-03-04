require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    log: ['error', 'warn'],
});

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 12);
    const commonPassword = await bcrypt.hash('123456', 12);

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@qsrvietnam.com' },
        update: {},
        create: {
            email: 'admin@qsrvietnam.com',
            name: 'Hoai Nam Le',
            password: adminPassword,
            role: 'ADMIN',
            isActive: true,
        },
    });

    // Create Site Manager
    await prisma.user.upsert({
        where: { email: 'huong.h.vo@qsrvietnam.com' },
        update: {},
        create: {
            email: 'huong.h.vo@qsrvietnam.com',
            name: 'Hương Võ',
            password: commonPassword,
            role: 'SITE_TEAM',
            isActive: true,
        },
    });

    // Create COO (Admin/Site Team equivalent)
    await prisma.user.upsert({
        where: { email: 'nam.h.le@qsrvietnam.com' },
        update: {},
        create: {
            email: 'nam.h.le@qsrvietnam.com',
            name: 'Nam Lê',
            password: commonPassword,
            role: 'ADMIN',
            isActive: true,
        },
    });

    // Create Brand Team
    await prisma.user.upsert({
        where: { email: 'thuong.t.pham@qsrvietnam.com' },
        update: {},
        create: {
            email: 'thuong.t.pham@qsrvietnam.com',
            name: 'Thương Phạm',
            password: commonPassword,
            role: 'BRAND_TEAM',
            isActive: true,
        },
    });

    // Create some sites
    const sites = [
        {
            name: 'QSR - Nguyễn Huệ',
            address: '100 Nguyễn Huệ, Phường Bến Nghé',
            city: 'Hồ Chí Minh',
            siteType: 'STREET',
            status: 'SIGNED',
            createdById: admin.id,
            rentPrice: 150000000,
            rentUnit: 'VND/tháng',
            floorArea: 120,
        },
        {
            name: 'QSR - Vincom Đồng Khởi',
            address: '72 Lê Thánh Tôn, Bến Nghé',
            city: 'Hồ Chí Minh',
            siteType: 'MALL',
            status: 'PENDING',
            createdById: admin.id,
            rentPrice: 200000000,
            rentUnit: 'VND/tháng',
            floorArea: 80,
        },
        {
            name: 'QSR - Phan Xích Long',
            address: '150 Phan Xích Long, Phường 2',
            city: 'Hồ Chí Minh',
            siteType: 'SHOPHOUSE',
            status: 'NEW',
            createdById: admin.id,
            rentPrice: 120000000,
            rentUnit: 'VND/tháng',
            floorArea: 200,
        },
    ];

    for (const siteData of sites) {
        await prisma.site.create({ data: siteData });
    }

    console.log('Seed data created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
