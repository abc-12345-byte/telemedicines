import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get current counts
    const counts = {
      users: await prisma.user.count(),
      doctors: await prisma.doctor.count(),
      patients: await prisma.patient.count(),
      appointments: await prisma.appointment.count(),
      prescriptions: await prisma.prescription.count()
    };

    // Get sample records to verify data integrity
    const sampleData = {
      users: await prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      doctors: await prisma.doctor.findMany({ take: 5, include: { user: true } }),
      patients: await prisma.patient.findMany({ take: 5, include: { user: true } }),
      appointments: await prisma.appointment.findMany({ take: 5, include: { doctor: true, patient: true } }),
      prescriptions: await prisma.prescription.findMany({ take: 5, include: { doctor: true, patient: true } })
    };

    return NextResponse.json({
      success: true,
      message: 'Database verification completed',
      counts,
      sampleData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database verification error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const timestamp = Date.now();
    
    // Test data creation without affecting existing data
    console.log('Creating test data for verification...');
    
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        clerkId: `verify-user-${timestamp}`,
        email: `verify-user-${timestamp}@example.com`,
        role: 'PATIENT'
      }
    });

    // Create test patient
    const testPatient = await prisma.user.create({
      data: {
        clerkId: `verify-patient-${timestamp}`,
        email: `verify-patient-${timestamp}@example.com`,
        role: 'PATIENT'
      }
    });

    // Create test doctor
    const testDoctor = await prisma.user.create({
      data: {
        clerkId: `verify-doctor-${timestamp}`,
        email: `verify-doctor-${timestamp}@example.com`,
        role: 'DOCTOR'
      }
    });

    // Create patient profile
    const patientProfile = await prisma.patient.create({
      data: {
        userId: testPatient.id,
        phoneNumber: `555-${timestamp.toString().slice(-4)}`,
        address: '123 Verification Street',
        currentSymptoms: 'Test symptoms for verification',
        medicalHistory: JSON.stringify({
          conditions: ['Test condition'],
          allergies: ['Test allergy']
        })
      }
    });

    // Create doctor profile
    const doctorProfile = await prisma.doctor.create({
      data: {
        userId: testDoctor.id,
        specialization: 'Verification Specialist',
        availability: 'Mon-Fri 9 AM - 5 PM'
      }
    });

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        doctorId: doctorProfile.id,
        patientId: patientProfile.id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: 'PENDING'
      }
    });

    // Create prescription
    const prescription = await prisma.prescription.create({
      data: {
        doctorId: doctorProfile.id,
        patientId: patientProfile.id,
        appointmentId: appointment.id,
        diagnosis: 'Verification test diagnosis',
        notes: 'This is a test prescription for verification purposes',
        medications: JSON.stringify([
          {
            name: 'Test Medication',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '7 days'
          }
        ])
      }
    });

    // Verify all records were created
    const verificationCounts = {
      users: await prisma.user.count(),
      doctors: await prisma.doctor.count(),
      patients: await prisma.patient.count(),
      appointments: await prisma.appointment.count(),
      prescriptions: await prisma.prescription.count()
    };

    return NextResponse.json({
      success: true,
      message: 'Database operations verified successfully',
      createdRecords: {
        user: testUser,
        patient: testPatient,
        doctor: testDoctor,
        patientProfile,
        doctorProfile,
        appointment,
        prescription
      },
      verificationCounts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database verification test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

