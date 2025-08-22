import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { specialization, availability } = body;

    // Find the user
    const user = await prisma.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'User is not a doctor' }, { status: 400 });
    }

    // Check if doctor profile already exists
    const existingDoctor = await prisma.doctor.findFirst({
      where: { userId: user.id },
    });

    if (existingDoctor) {
      // Update existing doctor profile
      const updatedDoctor = await prisma.doctor.update({
        where: { id: existingDoctor.id },
        data: {
          specialization,
          availability,
        },
      });

      return NextResponse.json(updatedDoctor);
    }

    // Create new doctor profile
    const newDoctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization,
        availability,
      },
    });

    return NextResponse.json(newDoctor);
  } catch (error) {
    console.error('Error saving doctor profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
