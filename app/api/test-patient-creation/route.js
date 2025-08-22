import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get current state
    const patients = await prisma.patient.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const users = await prisma.user.findMany({
      include: {
        patients: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      currentState: {
        totalPatients: patients.length,
        totalUsers: users.length,
        patients: patients.map(p => ({
          id: p.id,
          userId: p.userId,
          userEmail: p.user.email,
          userClerkId: p.user.clerkId,
          createdAt: p.createdAt,
          address: p.address
        })),
        users: users.map(u => ({
          id: u.id,
          clerkId: u.clerkId,
          email: u.email,
          role: u.role,
          patientCount: u.patients.length
        }))
      }
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, testData } = body;

    switch (action) {
      case 'create_test_patient':
        // Create a test user first
        const testUser = await prisma.user.create({
          data: {
            clerkId: `test_user_${Date.now()}`,
            email: `test_user_${Date.now()}@example.com`,
            role: 'PATIENT'
          }
        });

        // Create a test patient
        const testPatient = await prisma.patient.create({
          data: {
            userId: testUser.id,
            phoneNumber: `123-456-${Date.now().toString().slice(-4)}`,
            address: `Test Address ${Date.now()}`,
            currentSymptoms: 'Test symptoms',
            medicalHistory: JSON.stringify({ conditions: 'Test condition' }),
            emergencyContact: JSON.stringify({ name: 'Test Contact' })
          }
        });

        return NextResponse.json({
          message: 'Test patient created successfully',
          user: {
            id: testUser.id,
            clerkId: testUser.clerkId,
            email: testUser.email
          },
          patient: {
            id: testPatient.id,
            userId: testPatient.userId,
            address: testPatient.address
          }
        });

      case 'create_multiple_patients':
        // Create multiple test patients to verify they persist
        const results = [];
        
        for (let i = 1; i <= 3; i++) {
          const user = await prisma.user.create({
            data: {
              clerkId: `multi_test_user_${Date.now()}_${i}`,
              email: `multi_test_user_${Date.now()}_${i}@example.com`,
              role: 'PATIENT'
            }
          });

          const patient = await prisma.patient.create({
            data: {
              userId: user.id,
              phoneNumber: `123-456-${i}`,
              address: `Test Address ${i}`,
              currentSymptoms: `Test symptoms ${i}`,
              medicalHistory: JSON.stringify({ conditions: `Test condition ${i}` }),
              emergencyContact: JSON.stringify({ name: `Test Contact ${i}` })
            }
          });

          results.push({
            user: {
              id: user.id,
              clerkId: user.clerkId,
              email: user.email
            },
            patient: {
              id: patient.id,
              userId: patient.userId,
              address: patient.address
            }
          });
        }

        return NextResponse.json({
          message: 'Multiple test patients created successfully',
          results
        });

      case 'verify_persistence':
        // Check if all patients still exist after creation
        const allPatients = await prisma.patient.findMany({
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return NextResponse.json({
          message: 'Persistence verification',
          totalPatients: allPatients.length,
          patients: allPatients.map(p => ({
            id: p.id,
            userId: p.userId,
            userEmail: p.user.email,
            address: p.address,
            createdAt: p.createdAt
          }))
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}


