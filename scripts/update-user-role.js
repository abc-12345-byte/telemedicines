import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    console.log('🔧 Updating user role to ADMIN...\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        role: true
      }
    });

    console.log('📋 Current Users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - ClerkID: ${user.clerkId}`);
    });

    // Find the first user and update to ADMIN
    if (users.length > 0) {
      const userToUpdate = users[0];
      console.log(`\n🔄 Updating user: ${userToUpdate.email} from ${userToUpdate.role} to ADMIN`);
      
      const updatedUser = await prisma.user.update({
        where: { id: userToUpdate.id },
        data: { role: 'ADMIN' }
      });

      console.log(`✅ Successfully updated user to ADMIN: ${updatedUser.email}`);
      console.log(`\n🎯 You can now access the admin dashboard with this user account.`);
    } else {
      console.log('❌ No users found in the database');
    }

  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateUserRole();


