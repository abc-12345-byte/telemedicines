import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN') {
      // For development, allow any user to access admin stats
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: allowing non-admin user to access admin stats');
      } else {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    // Get various statistics
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalPrescriptions,
      recentAppointments,
      appointmentsByStatus,
      recentMonthsAppointments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.prescription.count(),
      prisma.appointment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: { include: { user: true } },
          patient: { include: { user: true } }
        }
      }),
      prisma.appointment.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.appointment.findMany({
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1)
          }
        },
        select: { date: true }
      })
    ]);

    // Aggregate appointments by month in JS to avoid provider-specific SQL
    const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const monthCountsMap = new Map();
    recentMonthsAppointments.forEach(({ date }) => {
      const key = monthKey(new Date(date));
      monthCountsMap.set(key, (monthCountsMap.get(key) || 0) + 1);
    });
    const appointmentsByMonth = Array.from(monthCountsMap.entries())
      .map(([date, count]) => ({ date, _count: { date: count } }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const stats = {
      overview: {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        totalPrescriptions
      },
      recentAppointments,
      appointmentsByStatus,
      appointmentsByMonth
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
