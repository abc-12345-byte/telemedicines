import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseOperations() {
  try {
    console.log('🧪 Testing Database Operations...\n');

    // 1. Check current state
    console.log('📊 Current Database State:');
    const currentPatients = await prisma.patient.findMany({
      include: { user: true }
    });
    const currentUsers = await prisma.user.findMany({
      include: { patients: true }
    });

    console.log(`- Total Users: ${currentUsers.length}`);
    console.log(`- Total Patients: ${currentPatients.length}`);
    console.log(`- Users with Patients: ${currentUsers.filter(u => u.patients.length > 0).length}\n`);

    // 2. Create test user and patient
    console.log('➕ Creating Test User and Patient...');
    const testUser = await prisma.user.create({
      data: {
        clerkId: `test_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        role: 'PATIENT'
      }
    });
    console.log(`✅ Created user: ${testUser.id} (${testUser.email})`);

    const testPatient = await prisma.patient.create({
      data: {
        userId: testUser.id,
        phoneNumber: '123-456-7890',
        address: 'Test Address',
        currentSymptoms: 'Test symptoms',
        medicalHistory: JSON.stringify({ conditions: 'Test condition' })
      }
    });
    console.log(`✅ Created patient: ${testPatient.id} for user: ${testUser.id}\n`);

    // 3. Verify the patient was created
    console.log('🔍 Verifying Patient Creation...');
    const verifyPatient = await prisma.patient.findUnique({
      where: { id: testPatient.id },
      include: { user: true }
    });
    
    if (verifyPatient) {
      console.log(`✅ Patient verified: ${verifyPatient.id} (${verifyPatient.user.email})`);
    } else {
      console.log('❌ Patient not found after creation!');
    }

    // 4. Check total counts again
    const updatedPatients = await prisma.patient.findMany();
    const updatedUsers = await prisma.user.findMany();
    
    console.log(`\n📊 Updated Database State:`);
    console.log(`- Total Users: ${updatedUsers.length} (was ${currentUsers.length})`);
    console.log(`- Total Patients: ${updatedPatients.length} (was ${currentPatients.length})`);

    if (updatedPatients.length > currentPatients.length) {
      console.log('✅ Patient count increased - no deletion detected');
    } else {
      console.log('❌ Patient count did not increase - possible deletion issue');
    }

    // 5. Create another patient to test persistence
    console.log('\n➕ Creating Second Test Patient...');
    const testUser2 = await prisma.user.create({
      data: {
        clerkId: `test2_${Date.now()}`,
        email: `test2_${Date.now()}@example.com`,
        role: 'PATIENT'
      }
    });

    const testPatient2 = await prisma.patient.create({
      data: {
        userId: testUser2.id,
        phoneNumber: '987-654-3210',
        address: 'Test Address 2',
        currentSymptoms: 'Test symptoms 2',
        medicalHistory: JSON.stringify({ conditions: 'Test condition 2' })
      }
    });
    console.log(`✅ Created second patient: ${testPatient2.id}`);

    // 6. Final verification
    const finalPatients = await prisma.patient.findMany({
      include: { user: true }
    });

    console.log('\n📋 Final Patient List:');
    finalPatients.forEach((patient, index) => {
      console.log(`${index + 1}. ${patient.id} - ${patient.user.email} - ${patient.address}`);
    });

    console.log(`\n🎯 Test Results:`);
    console.log(`- Initial patients: ${currentPatients.length}`);
    console.log(`- Final patients: ${finalPatients.length}`);
    console.log(`- Net change: ${finalPatients.length - currentPatients.length}`);

    if (finalPatients.length >= currentPatients.length + 2) {
      console.log('✅ SUCCESS: Multiple patients can be created without deletion');
    } else {
      console.log('❌ ISSUE: Patient deletion detected');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseOperations();
