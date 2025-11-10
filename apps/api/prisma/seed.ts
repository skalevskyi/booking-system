import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Check if services already exist
  const existingServices = await prisma.service.findMany();
  if (existingServices.length > 0) {
    console.log('✅ Services already exist, skipping seed');
    return;
  }

  // Create sample services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Haircut',
        description: 'Professional haircut service',
        durationMin: 30,
        priceCents: 2500, // $25.00
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Haircut & Styling',
        description: 'Haircut with professional styling',
        durationMin: 60,
        priceCents: 4000, // $40.00
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Beard Trim',
        description: 'Professional beard trimming',
        durationMin: 15,
        priceCents: 1500, // $15.00
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Full Service',
        description: 'Haircut, styling, and beard trim',
        durationMin: 90,
        priceCents: 5500, // $55.00
        active: true,
      },
    }),
  ]);

  console.log(`✅ Created ${services.length} services:`);
  services.forEach((service) => {
    console.log(`   - ${service.name} (${service.durationMin} min, $${(service.priceCents / 100).toFixed(2)})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

