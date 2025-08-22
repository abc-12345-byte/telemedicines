import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
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
        createdAt: 'desc'
      }
    });

    // Get all users to see the full picture
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
    const totalPatients = await prisma.patient.count();
    const totalUsers = await prisma.user.count();

    // Check for any potential issues
    const issues = [];
    
    // Check if there are users without patients
    const usersWithoutPatients = users.filter(user => user.patients.length === 0);
    if (usersWithoutPatients.length > 0) {
      issues.push(`Found ${usersWithoutPatients.length} users without patient profiles`);
    }

    // Check for duplicate clerkIds or emails
    const clerkIds = users.map(u => u.clerkId);
    const emails = users.map(u => u.email);
    const duplicateClerkIds = clerkIds.filter((id, index) => clerkIds.indexOf(id) !== index);
    const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
    
    if (duplicateClerkIds.length > 0) {
      issues.push(`Found duplicate clerkIds: ${duplicateClerkIds.join(', ')}`);
    }
    if (duplicateEmails.length > 0) {
      issues.push(`Found duplicate emails: ${duplicateEmails.join(', ')}`);
    }

    return NextResponse.json({
      summary: {
        totalPatients,
        totalUsers,
        issues: issues.length > 0 ? issues : ['No issues detected']
      },
      patients: patients.map(patient => ({
        id: patient.id,
        userId: patient.userId,
        userEmail: patient.user.email,
        userClerkId: patient.user.clerkId,
        userRole: patient.user.role,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
        address: patient.address,
        phoneNumber: patient.phoneNumber,
        currentSymptoms: patient.currentSymptoms
      })),
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
          createdAt: p.createdAt,
          address: p.address
        }))
      })),
      debug: {
        usersWithoutPatients: usersWithoutPatients.map(u => ({
          id: u.id,
          clerkId: u.clerkId,
          email: u.email,
          role: u.role
        })),
        duplicateClerkIds,
        duplicateEmails
      }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
