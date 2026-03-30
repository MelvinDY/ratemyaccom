const { PrismaClient } = require('@prisma/client');

async function getAccommodationSlug() {
  const prisma = new PrismaClient();

  try {
    const accommodation = await prisma.accommodation.findFirst({
      select: { slug: true, name: true }
    });

    if (accommodation) {
      console.log(`Found: ${accommodation.name} - slug: ${accommodation.slug}`);
      return accommodation.slug;
    } else {
      console.log('No accommodations found in database');
      return null;
    }
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

getAccommodationSlug();
