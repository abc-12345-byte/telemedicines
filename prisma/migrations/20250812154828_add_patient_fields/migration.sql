-- AlterTable
ALTER TABLE "public"."Patient" ADD COLUMN     "address" TEXT,
ADD COLUMN     "currentSymptoms" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "insuranceInfo" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "preferences" TEXT;
