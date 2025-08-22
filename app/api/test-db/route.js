import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get all users and their related data
    const users = await prisma.user.findMany({
      include: {
        patients: true,
        doctors: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get total counts
    const totalUsers = await prisma.user.count();
    const totalPatients = await prisma.patient.count();
    const totalDoctors = await prisma.doctor.count();

    return NextResponse.json({
      summary: {
        totalUsers,
        totalPatients,
        totalDoctors
      },
      users: users.map(user => ({
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        patientCount: user.patients.length,
        doctorCount: user.doctors.length,
        patients: user.patients.map(p => ({
          id: p.id,
          createdAt: p.createdAt
        })),
        doctors: user.doctors.map(d => ({
          id: d.id,
          specialization: d.specialization
        }))
      }))
    });
  } catch (error) {
    console.error('Error testing database:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create_test_user':
        // Create a test user
        const testUser = await prisma.user.create({
          data: {
            clerkId: `test_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            role: 'PATIENT'
          }
        });
        return NextResponse.json({ message: 'Test user created', user: testUser });

      case 'create_test_patient':
        // Create a test patient for an existing user
        const user = await prisma.user.findFirst({
          where: { role: 'PATIENT' }
        });
        
        if (!user) {
          return NextResponse.json({ error: 'No patient user found' }, { status: 404 });
        }

        const testPatient = await prisma.patient.create({
          data: {
            userId: user.id,
            phoneNumber: '123-456-7890',
            address: 'Test Address',
            medicalHistory: JSON.stringify({ conditions: 'Test condition' })
          }
        });
        return NextResponse.json({ message: 'Test patient created', patient: testPatient });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
