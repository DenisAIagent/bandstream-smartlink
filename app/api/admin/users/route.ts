import { requireAdmin } from "@/lib/auth/api-guard";
export const dynamic = "force-dynamic";
// app/api/admin/bands/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { hasBandStreamPermission, BandStreamUserRole } from "@/lib/rbac/roles"


export async function GET() {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    try {
        const session = await auth();
        const userRole = session?.user?.role;
        
        // Check if user is authenticated
        if (!hasBandStreamPermission(userRole as BandStreamUserRole | undefined, "OWNER")) {
            return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
        }

        // Get all users from database, with their plan
        const users = await prisma.user.findMany({
            include: {
                subscription: { select: { plan: true, status: true } },
            },
        });

        const withPlan = users.map(({ subscription, ...user }) => ({
            ...user,
            plan:
                subscription && subscription.status === 'ACTIVE'
                    ? subscription.plan
                    : 'FREE',
        }));

        return NextResponse.json(withPlan, { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
