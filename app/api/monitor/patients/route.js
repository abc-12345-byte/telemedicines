import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const timestamp = new Date().toISOString();
    
    // Get all patients with their user information
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            email: true,
            role: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Get total counts
    const totalPatients = await prisma.patient.count();
    const totalUsers = await prisma.user.count();

    // Create a summary for easy monitoring
    const summary = {
      timestamp,
      totalPatients,
      totalUsers,
      patients: patients.map(patient => ({
        id: patient.id,
        userId: patient.userId,
        userEmail: patient.user.email,
        userClerkId: patient.user.clerkId,
        address: patient.address,
        phoneNumber: patient.phoneNumber,
        currentSymptoms: patient.currentSymptoms,
        createdAt: patient.createdAt
      }))
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error monitoring patients:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'check_integrity') {
      // Check for orphaned patients (patients without users)
      const orphanedPatients = await prisma.patient.findMany({
        where: {
          user: null
        }
      });

      // Check for users without patients
      const usersWithoutPatients = await prisma.user.findMany({
        where: {
          role: 'PATIENT',
          patients: {
            none: {}
          }
        }
      });

      return NextResponse.json({
        timestamp: new Date().toISOString(),
        integrity: {
          orphanedPatients: orphanedPatients.length,
          usersWithoutPatients: usersWithoutPatients.length,
          orphanedPatientIds: orphanedPatients.map(p => p.id),
          usersWithoutPatientIds: usersWithoutPatients.map(u => u.id)
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in monitor endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}


