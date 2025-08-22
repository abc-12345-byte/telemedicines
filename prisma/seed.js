import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Check if we should clear existing data (only if explicitly requested)
  const shouldClearData = process.env.CLEAR_DATA === 'true';
  
  if (shouldClearData) {
    console.log("🗑️ Clearing existing data...");
    await prisma.prescription.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.user.deleteMany();
  } else {
    console.log("🔍 Checking existing data...");
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log(`⚠️  Found ${existingUsers} existing users. Skipping seed to preserve data.`);
      console.log("💡 To clear data and reseed, set CLEAR_DATA=true environment variable");
      return;
    }
  }

  console.log("🌱 Seeding database...");

  // Upsert Doctor
  const doctorUser = await prisma.user.upsert({
    where: { clerkId: "doctor_clerk_id_1" },
    update: {},
    create: {
      clerkId: "doctor_clerk_id_1",
      email: "doctor1@example.com",
      role: "DOCTOR",
      doctor: {
        create: {
          specialization: "Cardiologist",
          availability: "Mon-Fri 9 AM - 5 PM",
        },
      },
    },
    include: { doctor: true },
  });

  // Upsert Patient
  const patientUser = await prisma.user.upsert({
    where: { clerkId: "patient_clerk_id_1" },
    update: {},
    create: {
      clerkId: "patient_clerk_id_1",
      email: "patient1@example.com",
      role: "PATIENT",
      patient: {
        create: {
          medicalHistory: "Diabetes, Hypertension",
        },
      },
    },
    include: { patient: true },
  });

  // Create Appointment
  const appointment = await prisma.appointment.create({
    data: {
      patientId: patientUser.patient.id,
      doctorId: doctorUser.doctor.id,
      date: new Date('2025-08-02T10:00:00Z'),
      status: "CONFIRMED",
    },
  });

  // Create Prescription
  await prisma.prescription.create({
    data: {
      doctorId: doctorUser.doctor.id,
      patientId: patientUser.patient.id,
      appointmentId: appointment.id,
      pdfUrl: "https://example.com/prescription1.pdf",
    },
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
