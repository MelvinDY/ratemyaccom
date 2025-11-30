/**
 * Create Test User Script
 * Creates a test user with a known password for testing purposes
 *
 * Run with: npx tsx scripts/create-test-user.ts
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test user...');

  const testEmail = 'testuser@student.usyd.edu.au';
  const testPassword = 'Test1234!';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  if (existingUser) {
    console.log('Test user already exists. Updating password...');
    const hashedPassword = await hashPassword(testPassword);
    await prisma.user.update({
      where: { email: testEmail },
      data: {
        password: hashedPassword,
        verified: true,
      },
    });
    console.log('Test user password updated!');
  } else {
    const hashedPassword = await hashPassword(testPassword);
    await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Test User',
        password: hashedPassword,
        university: 'University of Sydney',
        verified: true,
        role: 'USER',
      },
    });
    console.log('Test user created!');
  }

  console.log('\n========================================');
  console.log('TEST ACCOUNT CREDENTIALS:');
  console.log('========================================');
  console.log(`Email:    ${testEmail}`);
  console.log(`Password: ${testPassword}`);
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Error creating test user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
