import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { sendPrescriptionNotification } from '@/lib/email';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let prescriptions;

    if (user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findFirst({
        where: { userId: user.id },
      });

      if (!doctor) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }

      prescriptions = await prisma.prescription.findMany({
        where: { doctorId: doctor.id },
        include: {
          patient: {
            include: { user: true }
          },
          appointment: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (user.role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({
        where: { userId: user.id },
      });

      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }

      prescriptions = await prisma.prescription.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: {
            include: { user: true }
          },
          appointment: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Doctor access required' }, { status: 403 });
    }

    const doctor = await prisma.doctor.findFirst({
      where: { userId: user.id },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const body = await request.json();
    const { appointmentId, patientId, diagnosis, notes, medications } = body;

    // Validate appointment exists and belongs to this doctor
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        doctorId: doctor.id,
        patientId: patientId
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Create prescription
    const prescription = await prisma.prescription.create({
      data: {
        doctorId: doctor.id,
        patientId,
        appointmentId,
        diagnosis,
        notes,
        medications: JSON.stringify(medications), // Store as JSON string
        pdfUrl: null // Will be updated when PDF is generated
      },
      include: {
        patient: {
          include: { user: true }
        },
        doctor: {
          include: { user: true }
        }
      }
    });

    // Send email notification to patient
    try {
      await sendPrescriptionNotification(
        prescription.patient.user.email,
        prescription
      );
    } catch (emailError) {
      console.error('Error sending prescription notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(prescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


