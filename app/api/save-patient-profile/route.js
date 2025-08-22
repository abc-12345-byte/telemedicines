import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Saving patient profile for user:', userId);

    const body = await request.json();
    const {
      dateOfBirth,
      phoneNumber,
      address,
      emergencyContact,
      medicalHistory,
      currentSymptoms,
      insuranceInfo,
      preferences,
      updateExisting = false // New parameter to control behavior
    } = body;

    // First find the user record
    const user = await prisma.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) {
      console.log('User not found for clerkId:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user:', user.id, 'with role:', user.role);

    // If user is not a patient, update their role to patient
    if (user.role !== 'PATIENT') {
      console.log('Updating user role from', user.role, 'to PATIENT');
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'PATIENT' }
      });
    }

    // Log current patient count before operation
    const patientCountBefore = await prisma.patient.count();
    console.log('Patient count before operation:', patientCountBefore);

    // Check if patient profile already exists
    const existingPatient = await prisma.patient.findFirst({
      where: { userId: user.id },
    });

    console.log('Existing patient found:', existingPatient ? existingPatient.id : 'None');
    console.log('Update existing flag:', updateExisting);

    let result;

    if (existingPatient && updateExisting) {
      // Update existing patient profile
      console.log('Updating existing patient profile:', existingPatient.id);
      result = await prisma.patient.update({
        where: { id: existingPatient.id },
        data: {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          phoneNumber,
          address,
          emergencyContact: emergencyContact ? JSON.stringify(emergencyContact) : null,
          medicalHistory: medicalHistory ? JSON.stringify(medicalHistory) : null,
          currentSymptoms,
          insuranceInfo: insuranceInfo ? JSON.stringify(insuranceInfo) : null,
          preferences: preferences ? JSON.stringify(preferences) : null,
        },
      });
      console.log('Patient profile updated successfully:', result.id);
    } else {
      // Always create a new patient profile
      console.log('Creating new patient profile for user:', user.id);
      result = await prisma.patient.create({
        data: {
          userId: user.id,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          phoneNumber,
          address,
          emergencyContact: emergencyContact ? JSON.stringify(emergencyContact) : null,
          medicalHistory: medicalHistory ? JSON.stringify(medicalHistory) : null,
          currentSymptoms,
          insuranceInfo: insuranceInfo ? JSON.stringify(insuranceInfo) : null,
          preferences: preferences ? JSON.stringify(preferences) : null,
        },
      });
      console.log('New patient profile created successfully:', result.id);
    }
    
    // Verify patient count after operation
    const patientCountAfter = await prisma.patient.count();
    console.log('Patient count after operation:', patientCountAfter);
    
    if (patientCountAfter < patientCountBefore) {
      console.error('WARNING: Patient count decreased after operation!');
    }

    return NextResponse.json({ 
      message: updateExisting && existingPatient ? 'Patient profile updated successfully' : 'Patient profile created successfully',
      patient: result,
      operation: updateExisting && existingPatient ? 'updated' : 'created'
    });
  } catch (error) {
    console.error('Error saving patient profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
