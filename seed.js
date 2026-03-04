const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Password for all these test accounts is 123456
    const hashedPassword = await bcrypt.hash('123456', 10);

    const siteTeamUser = await prisma.user.upsert({
        where: { email: 'huong.h.vo@qsrvietnam.com' },
        update: { password: hashedPassword, role: 'SITE_TEAM' },
        create: {
            email: 'huong.h.vo@qsrvietnam.com',
            name: 'Hương Võ (Site Manager)',
            password: hashedPassword,
            role: 'SITE_TEAM',
            isActive: true,
        },
    });
    console.log('Seed successful:', siteTeamUser.email);

    const brandTeamUser = await prisma.user.upsert({
        where: { email: 'thuong.t.pham@qsrvietnam.com' },
        update: { password: hashedPassword, role: 'BRAND_TEAM' },
        create: {
            email: 'thuong.t.pham@qsrvietnam.com',
            name: 'Thương Phạm (Brand Manager)',
            password: hashedPassword,
            role: 'BRAND_TEAM',
            isActive: true,
        },
    });
    console.log('Seed successful:', brandTeamUser.email);

    const cooUser = await prisma.user.upsert({
        where: { email: 'nam.h.le@qsrvietnam.com' },
        // Assuming COO needs full access, we set the role to ADMIN.
        update: { password: hashedPassword, role: 'ADMIN' },
        create: {
            email: 'nam.h.le@qsrvietnam.com',
            name: 'Nam Lê (COO)',
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
        },
    });
    console.log('Seed successful:', cooUser.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
