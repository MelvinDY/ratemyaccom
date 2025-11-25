/**
 * Generate Scraping Report
 * Creates a detailed report of all scraped accommodations
 */

import { prisma } from '../lib/database/prisma';

interface AccommodationGroup {
  [university: string]: any[];
}

async function generateReport() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   SCRAPED ACCOMMODATION DATA REPORT');
  console.log('═══════════════════════════════════════════════════\n');

  const accommodations = await prisma.accommodation.findMany({
    include: {
      amenities: {
        include: {
          amenity: true,
        },
      },
    },
    orderBy: [{ university: 'asc' }, { name: 'asc' }],
  });

  const byUniversity: AccommodationGroup = accommodations.reduce((acc, accom) => {
    if (!acc[accom.university]) {
      acc[accom.university] = [];
    }
    acc[accom.university]!.push(accom);
    return acc;
  }, {} as AccommodationGroup);

  Object.entries(byUniversity).forEach(([uni, accoms]) => {
    console.log(`\n🏛️  ${uni}`);
    console.log('─'.repeat(50));

    accoms.forEach((accom) => {
      console.log(`\n  📍 ${accom.name}`);
      console.log(`     Type: ${accom.type}`);
      console.log(`     Address: ${accom.address}`);
      console.log(`     Suburb: ${accom.suburb}, ${accom.state} ${accom.postcode}`);
      console.log(`     Price: $${accom.priceMin}-$${accom.priceMax}/${accom.pricePeriod.toLowerCase()}`);
      console.log(`     Capacity: ${accom.capacity} students`);
      console.log(`     Room Types: ${accom.roomTypes.join(', ')}`);
      console.log(`     Amenities: ${accom.amenities.length} amenities`);
      if (accom.scrapedAt) {
        console.log(`     Scraped: ${new Date(accom.scrapedAt).toLocaleDateString()}`);
      }
    });
  });

  console.log('\n═══════════════════════════════════════════════════');
  console.log('   STATISTICS');
  console.log('═══════════════════════════════════════════════════\n');

  console.log(`Total Accommodations: ${accommodations.length}`);
  console.log(`Universities: ${Object.keys(byUniversity).length}`);

  const byType: Record<string, number> = accommodations.reduce((acc, accom) => {
    acc[accom.type] = (acc[accom.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\nBy Type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });

  const avgPrice =
    accommodations.reduce((sum, a) => sum + (a.priceMin + a.priceMax) / 2, 0) /
    accommodations.length;
  console.log(`\nAverage Price: $${avgPrice.toFixed(2)}/week`);

  const totalCapacity = accommodations.reduce((sum, a) => sum + a.capacity, 0);
  console.log(`Total Capacity: ${totalCapacity} students`);

  // Scraping job stats
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   SCRAPING JOB HISTORY');
  console.log('═══════════════════════════════════════════════════\n');

  const jobs = await prisma.scrapingJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  jobs.forEach((job) => {
    console.log(`\n${job.source}:`);
    console.log(`  Status: ${job.status}`);
    console.log(`  Found: ${job.itemsFound}`);
    console.log(`  Imported: ${job.itemsImported}`);
    console.log(`  Failed: ${job.itemsFailed}`);
    if (job.startedAt && job.completedAt) {
      const duration = (job.completedAt.getTime() - job.startedAt.getTime()) / 1000;
      console.log(`  Duration: ${duration.toFixed(1)}s`);
    }
    console.log(`  Date: ${job.createdAt.toLocaleString()}`);
  });

  console.log('\n═══════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

generateReport().catch((error) => {
  console.error('Error generating report:', error);
  process.exit(1);
});
