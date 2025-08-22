import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req) {
  try {
    // ✅ Verify user is logged in
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, email } = body;

    if (!role || !email) {
      return NextResponse.json(
        { error: "Missing role or email" },
        { status: 400 }
      );
    }

    // ✅ Save role in DB (example with Prisma)
    const updatedUser = await prisma.user.upsert({
      where: { clerkId: userId },   // clerkId stored when user registers
      update: { role, email },
      create: {
        clerkId: userId,
        role,
        email,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
