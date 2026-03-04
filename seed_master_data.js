const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const cities = [
        { type: 'CITY', value: 'Hồ Chí Minh', order: 1 },
        { type: 'CITY', value: 'Hà Nội', order: 2 },
        { type: 'CITY', value: 'Đà Nẵng', order: 3 },
    ];

    const siteTypes = [
        { type: 'SITE_TYPE', value: 'STREET', order: 1 },
        { type: 'SITE_TYPE', value: 'MALL', order: 2 },
        { type: 'SITE_TYPE', value: 'FOOD_COURT', order: 3 },
    ];

    const statuses = [
        { type: 'STATUS', value: 'NEW', order: 1 },
        { type: 'STATUS', value: 'PROPOSED', order: 2 },
        { type: 'STATUS', value: 'SURVEYING', order: 3 },
        { type: 'STATUS', value: 'APPROVED', order: 4 },
        { type: 'STATUS', value: 'REJECTED', order: 5 },
    ];

    const data = [...cities, ...siteTypes, ...statuses];

    for (const item of data) {
        await prisma.masterData.create({
            data: {
                type: item.type,
                value: item.value,
                order: item.order,
                isActive: true,
            }
        });
        console.log(`Created ${item.type}: ${item.value}`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
