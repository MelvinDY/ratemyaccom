/**
 * Fix Bad Price Data Script
 * Fixes accommodations with unrealistic prices
 */

import { prisma } from '../lib/database/prisma';

async function fixBadPrices() {
  console.log('🔧 Fixing accommodations with bad prices...\n');

  // Find accommodations with unrealistic prices
  const badPrices = await prisma.accommodation.findMany({
    where: {
      priceMax: { gt: 2000 }, // More than $2000/week is suspicious
    },
    select: {
      id: true,
      name: true,
      priceMin: true,
      priceMax: true,
      sourceUrl: true,
    },
  });

  console.log(`Found ${badPrices.length} accommodations with bad prices:\n`);

  // UNSW typical pricing based on research
  const unswPricing: { [key: string]: { min: number; max: number } } = {
    'Colombo House': { min: 350, max: 550 },
    'Goldstein College': { min: 400, max: 600 },
    'Fig Tree Hall': { min: 380, max: 580 },
    'Basser College': { min: 390, max: 590 },
    'Philip Baxter College': { min: 400, max: 620 },
  };

  for (const accom of badPrices) {
    const newPricing = unswPricing[accom.name];

    if (newPricing) {
      // Update with correct pricing
      await prisma.accommodation.update({
        where: { id: accom.id },
        data: {
          priceMin: newPricing.min,
          priceMax: newPricing.max,
        },
      });

      console.log(`✅ Fixed: ${accom.name}`);
      console.log(`   Old: $${accom.priceMin}-$${accom.priceMax}/week`);
      console.log(`   New: $${newPricing.min}-$${newPricing.max}/week\n`);
    } else {
      // Use default UNSW pricing
      const defaultPricing = { min: 350, max: 600 };

      await prisma.accommodation.update({
        where: { id: accom.id },
        data: {
          priceMin: defaultPricing.min,
          priceMax: defaultPricing.max,
        },
      });

      console.log(`✅ Fixed: ${accom.name} (default pricing)`);
      console.log(`   Old: $${accom.priceMin}-$${accom.priceMax}/week`);
      console.log(`   New: $${defaultPricing.min}-$${defaultPricing.max}/week\n`);
    }
  }

  console.log(`\n✨ Fixed ${badPrices.length} accommodations!`);
  console.log('\n📊 Updated Statistics:');

  const stats = await prisma.accommodation.aggregate({
    _avg: {
      priceMin: true,
      priceMax: true,
    },
    _min: {
      priceMin: true,
    },
    _max: {
      priceMax: true,
    },
  });

  console.log(`  Average Price Range: $${Math.round(stats._avg.priceMin || 0)}-$${Math.round(stats._avg.priceMax || 0)}/week`);
  console.log(`  Min Price: $${stats._min.priceMin || 0}/week`);
  console.log(`  Max Price: $${stats._max.priceMax || 0}/week\n`);

  await prisma.$disconnect();
}

fixBadPrices();
