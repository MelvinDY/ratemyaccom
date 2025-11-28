/**
 * Scraper Runner Script
 * Executes web scraping jobs to collect accommodation data
 *
 * Usage:
 *   npx tsx scripts/run-scraper.ts [scraper-name]
 *   npx tsx scripts/run-scraper.ts all
 *
 * Available scrapers:
 *   - unsw: UNSW Sydney accommodation
 *   - usyd: University of Sydney accommodation
 *   - unilodge: UniLodge properties across Australia
 *   - all: Run all scrapers sequentially
 */

import { UNSWScraper } from '../lib/scraping/scrapers/unsw-scraper';
import { USYDScraper } from '../lib/scraping/scrapers/usyd-scraper';
import { UniLodgeScraper } from '../lib/scraping/scrapers/unilodge-scraper';
import { prisma } from '../lib/database/prisma';

interface ScraperStats {
  name: string;
  found: number;
  imported: number;
  failed: number;
  duration: number;
}

async function runScraper() {
  const scraperName = process.argv[2] || 'all';

  console.log('\n═══════════════════════════════════════════════════');
  console.log('   RateMyAccom - Web Scraper');
  console.log('═══════════════════════════════════════════════════\n');

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection established\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Please ensure PostgreSQL is running and DATABASE_URL is correct');
    process.exit(1);
  }

  const stats: ScraperStats[] = [];

  try {
    if (scraperName === 'all') {
      console.log('Running all scrapers...\n');

      // Run UNSW
      console.log('───────────────────────────────────────────────────');
      const unswStats = await runIndividualScraper('UNSW Sydney', new UNSWScraper());
      stats.push(unswStats);

      // Run USYD
      console.log('\n───────────────────────────────────────────────────');
      const usydStats = await runIndividualScraper('University of Sydney', new USYDScraper());
      stats.push(usydStats);

      // Run UniLodge
      console.log('\n───────────────────────────────────────────────────');
      const unilodgeStats = await runIndividualScraper('UniLodge', new UniLodgeScraper());
      stats.push(unilodgeStats);
    } else {
      let scraper;
      let scraperDisplayName: string;

      switch (scraperName.toLowerCase()) {
        case 'unsw':
          scraper = new UNSWScraper();
          scraperDisplayName = 'UNSW Sydney';
          break;
        case 'usyd':
          scraper = new USYDScraper();
          scraperDisplayName = 'University of Sydney';
          break;
        case 'unilodge':
          scraper = new UniLodgeScraper();
          scraperDisplayName = 'UniLodge';
          break;
        default:
          console.error(`❌ Unknown scraper: ${scraperName}`);
          console.log('\nAvailable scrapers:');
          console.log('  - unsw        UNSW Sydney accommodation');
          console.log('  - usyd        University of Sydney accommodation');
          console.log('  - unilodge    UniLodge properties');
          console.log('  - all         Run all scrapers\n');
          process.exit(1);
      }

      console.log('───────────────────────────────────────────────────');
      const scraperStats = await runIndividualScraper(scraperDisplayName, scraper);
      stats.push(scraperStats);
    }

    // Print summary
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   SCRAPING SUMMARY');
    console.log('═══════════════════════════════════════════════════\n');

    let totalFound = 0;
    let totalImported = 0;
    let totalFailed = 0;

    stats.forEach((stat) => {
      console.log(`${stat.name}:`);
      console.log(`  Found: ${stat.found}`);
      console.log(`  Imported: ${stat.imported}`);
      console.log(`  Failed: ${stat.failed}`);
      console.log(`  Duration: ${stat.duration}s`);
      console.log(
        `  Success Rate: ${stat.found > 0 ? ((stat.imported / stat.found) * 100).toFixed(1) : 0}%`
      );
      console.log('');

      totalFound += stat.found;
      totalImported += stat.imported;
      totalFailed += stat.failed;
    });

    console.log('───────────────────────────────────────────────────');
    console.log('TOTALS:');
    console.log(`  Found: ${totalFound}`);
    console.log(`  Imported: ${totalImported}`);
    console.log(`  Failed: ${totalFailed}`);
    console.log(
      `  Overall Success Rate: ${totalFound > 0 ? ((totalImported / totalFound) * 100).toFixed(1) : 0}%`
    );
    console.log('═══════════════════════════════════════════════════\n');

    // Print database stats
    const accommodationCount = await prisma.accommodation.count();
    console.log(`📊 Total accommodations in database: ${accommodationCount}\n`);

    console.log('✅ Scraping completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Scraping failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function runIndividualScraper(name: string, scraper: any): Promise<ScraperStats> {
  console.log(`🔄 Starting ${name} scraper...\n`);

  const startTime = Date.now();

  try {
    await scraper.start();
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Get job stats from database
    const job = await prisma.scrapingJob.findFirst({
      where: { source: scraper.config.name },
      orderBy: { createdAt: 'desc' },
    });

    const stats: ScraperStats = {
      name,
      found: job?.itemsFound || 0,
      imported: job?.itemsImported || 0,
      failed: job?.itemsFailed || 0,
      duration,
    };

    console.log(`\n✅ ${name} scraper completed`);
    console.log(`   Found: ${stats.found} | Imported: ${stats.imported} | Failed: ${stats.failed}`);

    return stats;
  } catch (error) {
    console.error(`\n❌ ${name} scraper failed:`, error);

    return {
      name,
      found: 0,
      imported: 0,
      failed: 0,
      duration: Math.round((Date.now() - startTime) / 1000),
    };
  }
}

runScraper();
