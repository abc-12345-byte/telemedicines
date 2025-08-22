import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { sendAppointmentConfirmation } from '@/lib/email';

export async function PATCH(request, { params }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          include: { user: true }
        },
        patient: {
          include: { user: true }
        }
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check if user is authorized to update this appointment
    const user = await prisma.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only doctors can update appointment status
    if (user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const doctor = await prisma.doctor.findFirst({
      where: { userId: user.id },
    });

    if (!doctor || doctor.id !== appointment.doctorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        doctor: {
          include: { user: true }
        },
        patient: {
          include: { user: true }
        }
      }
    });

    // Send email notification if appointment is confirmed
    if (status === 'CONFIRMED') {
      try {
        await sendAppointmentConfirmation(
          appointment.patient.user.email,
          updatedAppointment
        );
      } catch (emailError) {
        console.error('Error sending appointment confirmation:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Find the appointment with related data
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                clerkId: true,
                email: true,
                role: true
              }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: {
                id: true,
                clerkId: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check if user is authorized to view this appointment
    const user = await prisma.user.findFirst({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAuthorized = 
      appointment.doctor?.user?.clerkId === userId || 
      appointment.patient?.user?.clerkId === userId ||
      user.role === 'ADMIN';

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized to view this appointment' }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

