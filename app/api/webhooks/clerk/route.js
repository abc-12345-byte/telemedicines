import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { sendWelcomeEmail, sendSignInNotification } from '@/lib/email';

export async function POST(req) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', body);

  // Handle the webhook
  switch (eventType) {
    case 'user.created':
      try {
        const { id: userId, email_addresses, first_name, last_name } = evt.data;
        const email = email_addresses[0]?.email_address;

        if (email) {
          console.log(`Processing user.created event for: ${email} (clerkId: ${userId})`);
          
          // Check if user already exists by clerkId first
          const existingUserByClerkId = await prisma.user.findFirst({
            where: { clerkId: userId }
          });

          if (existingUserByClerkId) {
            console.log(`User already exists with clerkId: ${userId}`);
            return;
          }

          // Check if user exists by email
          const existingUserByEmail = await prisma.user.findFirst({
            where: { email: email }
          });

          if (existingUserByEmail) {
            console.log(`User with email ${email} already exists, updating clerkId`);
            // Update the existing user with the new clerkId
            await prisma.user.update({
              where: { id: existingUserByEmail.id },
              data: { clerkId: userId }
            });
            console.log(`Updated existing user with new clerkId: ${userId}`);
          } else {
            // Create new user in our database
            const newUser = await prisma.user.create({
              data: {
                clerkId: userId,
                email: email,
                role: 'PATIENT', // Default role
              }
            });

            // Send welcome email
            await sendWelcomeEmail(email, {
              firstName: first_name || 'User',
              lastName: last_name || '',
              email: email
            });

            console.log(`New user created: ${email} (ID: ${newUser.id})`);
          }
        }
      } catch (error) {
        console.error('Error creating user:', error);
      }
      break;

    case 'user.updated':
      try {
        const { id: userId, email_addresses, first_name, last_name } = evt.data;
        const email = email_addresses[0]?.email_address;

        if (email) {
          // Find the user first
          const existingUser = await prisma.user.findFirst({
            where: { clerkId: userId }
          });

          if (existingUser) {
            // Update user in our database
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                email: email,
              }
            });

            console.log(`User updated: ${email}`);
          } else {
            console.log(`User not found for update: ${userId}`);
          }
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
      break;

    case 'user.deleted':
      try {
        const { id: userId } = evt.data;
        
        // Find the user first
        const user = await prisma.user.findFirst({
          where: { clerkId: userId },
          include: {
            patients: true,
            doctors: true
          }
        });

        if (user) {
          // Delete related records first to avoid foreign key constraint issues
          if (user.patients.length > 0) {
            await prisma.patient.deleteMany({
              where: { userId: user.id }
            });
          }
          
          if (user.doctors.length > 0) {
            await prisma.doctor.deleteMany({
              where: { userId: user.id }
            });
          }

          // Now delete the user
          await prisma.user.delete({
            where: { id: user.id }
          });

          console.log(`User and related records deleted: ${userId}`);
        } else {
          console.log(`User not found for deletion: ${userId}`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
      break;

    case 'session.created':
      try {
        const { user } = evt.data;
        const email = user.email_addresses[0]?.email_address;
        const firstName = user.first_name;

        if (email) {
          // Send sign-in notification email
          await sendSignInNotification(email, {
            firstName: firstName || 'User',
            email: email,
            timestamp: new Date().toISOString()
          });

          console.log(`Sign-in notification sent to: ${email}`);
        }
      } catch (error) {
        console.error('Error sending sign-in notification:', error);
      }
      break;

    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  return new Response('', { status: 200 });
}
