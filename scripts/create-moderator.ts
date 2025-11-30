/**
 * Script to create a moderator account
 * Run with: npx tsx scripts/create-moderator.ts
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth/password';

const prisma = new PrismaClient();

// Moderator account credentials
// Using a valid university email format for the system
const MODERATOR_EMAIL = 'moderator@unsw.edu.au';
const MODERATOR_PASSWORD = 'Mod3r@t0r2024!';
const MODERATOR_NAME = 'RMA Moderator';

async function createModerator() {
  console.log('Creating moderator account...\n');

  try {
    // Check if moderator already exists
    const existingMod = await prisma.user.findUnique({
      where: { email: MODERATOR_EMAIL },
    });

    if (existingMod) {
      // Update existing user to moderator role if needed
      if (existingMod.role !== 'MODERATOR') {
        await prisma.user.update({
          where: { email: MODERATOR_EMAIL },
          data: { role: 'MODERATOR' },
        });
        console.log('Updated existing user to MODERATOR role');
      } else {
        console.log('Moderator account already exists');
      }
      console.log('\n=== Moderator Account ===');
      console.log(`Email: ${MODERATOR_EMAIL}`);
      console.log(`Password: ${MODERATOR_PASSWORD}`);
      console.log(`URL: http://localhost:3000/moderator`);
      console.log('========================\n');
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(MODERATOR_PASSWORD);

    // Create moderator user
    const moderator = await prisma.user.create({
      data: {
        email: MODERATOR_EMAIL,
        password: hashedPassword,
        name: MODERATOR_NAME,
        role: 'MODERATOR',
        verified: true, // Pre-verified
      },
    });

    console.log('Moderator account created successfully!\n');
    console.log('=== Moderator Account ===');
    console.log(`ID: ${moderator.id}`);
    console.log(`Email: ${MODERATOR_EMAIL}`);
    console.log(`Password: ${MODERATOR_PASSWORD}`);
    console.log(`Name: ${MODERATOR_NAME}`);
    console.log(`Role: ${moderator.role}`);
    console.log(`Verified: ${moderator.verified}`);
    console.log('========================\n');
    console.log('Login at: http://localhost:3000/login');
    console.log('Moderator dashboard: http://localhost:3000/moderator\n');
  } catch (error) {
    console.error('Error creating moderator:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createModerator().catch((error) => {
  console.error('Failed to create moderator:', error);
  process.exit(1);
});
