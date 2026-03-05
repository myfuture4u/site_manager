const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@qsrvietnam.com' },
        update: {
            password: adminPassword,
            role: "ADMIN"
        },
        create: {
            email: 'admin@qsrvietnam.com',
            name: 'Admin User',
            password: adminPassword,
            role: 'ADMIN',
            isActive: true,
        },
    });

    console.log('Admin user upserted:', admin);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
