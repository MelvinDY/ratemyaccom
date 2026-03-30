/**
 * Accommodation Data Verification Script
 *
 * This script checks accommodation data against official sources and generates
 * a verification report. It tracks which accommodations need manual verification
 * and which have stale data (not verified in the last 90 days).
 *
 * Run with: npx tsx scripts/verify-accommodations.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const VERIFICATION_STALE_DAYS = 90; // Data is considered stale after 90 days
const VERIFICATION_WARNING_DAYS = 60; // Warn when data is older than 60 days

interface VerificationResult {
  id: string;
  name: string;
  slug: string;
  sourceUrl: string | null;
  lastVerified: Date | null;
  status: 'verified' | 'stale' | 'warning' | 'never_verified' | 'needs_manual';
  daysSinceVerification: number | null;
  priceRange: string;
  university: string;
}

interface VerificationReport {
  generatedAt: Date;
  summary: {
    total: number;
    verified: number;
    stale: number;
    warning: number;
    neverVerified: number;
    needsManual: number;
  };
  accommodations: VerificationResult[];
}

async function getVerificationStatus(
  lastVerified: Date | null,
  sourceUrl: string | null
): Promise<{ status: VerificationResult['status']; daysSinceVerification: number | null }> {
  if (!lastVerified) {
    // If there's a source URL but no verification date, it needs manual verification
    if (sourceUrl) {
      return { status: 'needs_manual', daysSinceVerification: null };
    }
    return { status: 'never_verified', daysSinceVerification: null };
  }

  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince > VERIFICATION_STALE_DAYS) {
    return { status: 'stale', daysSinceVerification: daysSince };
  }

  if (daysSince > VERIFICATION_WARNING_DAYS) {
    return { status: 'warning', daysSinceVerification: daysSince };
  }

  return { status: 'verified', daysSinceVerification: daysSince };
}

async function generateVerificationReport(): Promise<VerificationReport> {
  console.log('Fetching accommodations from database...');

  const accommodations = await prisma.accommodation.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      university: true,
      sourceUrl: true,
      lastVerified: true,
      priceMin: true,
      priceMax: true,
      currency: true,
      pricePeriod: true,
    },
    orderBy: [{ university: 'asc' }, { name: 'asc' }],
  });

  console.log(`Found ${accommodations.length} accommodations`);

  const results: VerificationResult[] = [];
  const summary = {
    total: accommodations.length,
    verified: 0,
    stale: 0,
    warning: 0,
    neverVerified: 0,
    needsManual: 0,
  };

  for (const accom of accommodations) {
    const { status, daysSinceVerification } = await getVerificationStatus(
      accom.lastVerified,
      accom.sourceUrl
    );

    // Update summary counts
    switch (status) {
      case 'verified':
        summary.verified++;
        break;
      case 'stale':
        summary.stale++;
        break;
      case 'warning':
        summary.warning++;
        break;
      case 'never_verified':
        summary.neverVerified++;
        break;
      case 'needs_manual':
        summary.needsManual++;
        break;
    }

    results.push({
      id: accom.id,
      name: accom.name,
      slug: accom.slug,
      sourceUrl: accom.sourceUrl,
      lastVerified: accom.lastVerified,
      status,
      daysSinceVerification,
      priceRange: `${accom.currency} ${accom.priceMin}-${accom.priceMax}/${accom.pricePeriod.toLowerCase()}`,
      university: accom.university,
    });
  }

  return {
    generatedAt: new Date(),
    summary,
    accommodations: results,
  };
}

function printReport(report: VerificationReport): void {
  console.log('\n' + '='.repeat(80));
  console.log('ACCOMMODATION DATA VERIFICATION REPORT');
  console.log('Generated:', report.generatedAt.toISOString());
  console.log('='.repeat(80) + '\n');

  // Summary
  console.log('SUMMARY');
  console.log('-'.repeat(40));
  console.log(`Total Accommodations:    ${report.summary.total}`);
  console.log(`Verified (< ${VERIFICATION_WARNING_DAYS} days):  ${report.summary.verified}`);
  console.log(
    `Warning (${VERIFICATION_WARNING_DAYS}-${VERIFICATION_STALE_DAYS} days):    ${report.summary.warning}`
  );
  console.log(`Stale (> ${VERIFICATION_STALE_DAYS} days):       ${report.summary.stale}`);
  console.log(`Never Verified:          ${report.summary.neverVerified}`);
  console.log(`Needs Manual Check:      ${report.summary.needsManual}`);
  console.log('');

  // Status emoji legend
  const statusEmoji: Record<VerificationResult['status'], string> = {
    verified: '[OK]',
    warning: '[WARN]',
    stale: '[STALE]',
    never_verified: '[NONE]',
    needs_manual: '[MANUAL]',
  };

  // Group by status for easy reading
  const groupedByStatus = report.accommodations.reduce(
    (acc, accom) => {
      if (!acc[accom.status]) {
        acc[accom.status] = [];
      }
      acc[accom.status]!.push(accom);
      return acc;
    },
    {} as Record<string, VerificationResult[]>
  );

  // Print accommodations needing attention first
  const priorityOrder: VerificationResult['status'][] = [
    'stale',
    'needs_manual',
    'never_verified',
    'warning',
    'verified',
  ];

  for (const status of priorityOrder) {
    const accoms = groupedByStatus[status];
    if (!accoms || accoms.length === 0) {
      continue;
    }

    console.log(`\n${status.toUpperCase().replace('_', ' ')} (${accoms.length})`);
    console.log('-'.repeat(60));

    for (const accom of accoms) {
      const daysText =
        accom.daysSinceVerification !== null ? `${accom.daysSinceVerification} days ago` : 'Never';

      console.log(`${statusEmoji[accom.status]} ${accom.name}`);
      console.log(`    University: ${accom.university}`);
      console.log(`    Price: ${accom.priceRange}`);
      console.log(`    Last Verified: ${daysText}`);
      if (accom.sourceUrl) {
        console.log(`    Source: ${accom.sourceUrl}`);
      }
      console.log('');
    }
  }

  // Recommendations
  console.log('\n' + '='.repeat(80));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(80) + '\n');

  if (report.summary.stale > 0) {
    console.log(
      `[!] ${report.summary.stale} accommodation(s) have stale data (> ${VERIFICATION_STALE_DAYS} days)`
    );
    console.log('    Run manual verification or use the scraper to update pricing.\n');
  }

  if (report.summary.needsManual > 0) {
    console.log(`[!] ${report.summary.needsManual} accommodation(s) need manual verification`);
    console.log('    These have source URLs but pricing could not be automatically verified.\n');
  }

  if (report.summary.neverVerified > 0) {
    console.log(`[!] ${report.summary.neverVerified} accommodation(s) have never been verified`);
    console.log('    Add source URLs and verify data manually.\n');
  }

  if (report.summary.warning > 0) {
    console.log(`[i] ${report.summary.warning} accommodation(s) will become stale soon`);
    console.log('    Consider scheduling verification before they expire.\n');
  }

  const healthPercentage = Math.round(
    ((report.summary.verified + report.summary.warning) / report.summary.total) * 100
  );
  console.log(`Data Health Score: ${healthPercentage}%`);
}

async function markAsVerified(slugOrId: string): Promise<void> {
  const accommodation = await prisma.accommodation.findFirst({
    where: {
      OR: [{ id: slugOrId }, { slug: slugOrId }],
    },
  });

  if (!accommodation) {
    console.error(`Accommodation not found: ${slugOrId}`);
    return;
  }

  await prisma.accommodation.update({
    where: { id: accommodation.id },
    data: { lastVerified: new Date() },
  });

  console.log(`Marked "${accommodation.name}" as verified at ${new Date().toISOString()}`);
}

async function listStaleAccommodations(): Promise<void> {
  const staleDate = new Date();
  staleDate.setDate(staleDate.getDate() - VERIFICATION_STALE_DAYS);

  const stale = await prisma.accommodation.findMany({
    where: {
      OR: [{ lastVerified: null }, { lastVerified: { lt: staleDate } }],
    },
    select: {
      name: true,
      slug: true,
      sourceUrl: true,
      lastVerified: true,
    },
    orderBy: { lastVerified: 'asc' },
  });

  if (stale.length === 0) {
    console.log('No stale accommodations found!');
    return;
  }

  console.log(`Found ${stale.length} stale/unverified accommodations:\n`);

  for (const accom of stale) {
    console.log(`- ${accom.name} (${accom.slug})`);
    if (accom.sourceUrl) {
      console.log(`  Source: ${accom.sourceUrl}`);
    }
    if (accom.lastVerified) {
      console.log(`  Last verified: ${accom.lastVerified.toISOString()}`);
    } else {
      console.log('  Never verified');
    }
    console.log('');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'report';

  try {
    switch (command) {
      case 'report':
        const report = await generateVerificationReport();
        printReport(report);
        break;

      case 'mark-verified':
        if (!args[1]) {
          console.error(
            'Usage: npx tsx scripts/verify-accommodations.ts mark-verified <slug-or-id>'
          );
          process.exit(1);
        }
        await markAsVerified(args[1]);
        break;

      case 'list-stale':
        await listStaleAccommodations();
        break;

      case 'json':
        const jsonReport = await generateVerificationReport();
        console.log(JSON.stringify(jsonReport, null, 2));
        break;

      default:
        console.log('Available commands:');
        console.log('  report        - Generate full verification report (default)');
        console.log('  list-stale    - List only stale/unverified accommodations');
        console.log('  mark-verified <slug-or-id> - Mark an accommodation as verified today');
        console.log('  json          - Output report as JSON');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
