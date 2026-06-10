import { requireAdmin } from "@/lib/auth/api-guard";
export const dynamic = "force-dynamic";
// app/api/admin/users/beta/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getRolePermission } from "@/components/auth/RoleGuard"


export async function GET() {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    try {
        const isOwner = await getRolePermission("OWNER")
        
        // Check if user is authenticated
        if (!isOwner) {
            return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
        }

        // Get all invites from database
        const invites = await prisma.userInvite.findMany({
            include: {
                invitedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        

        return NextResponse.json(invites, { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Add a delete route

export async function DELETE(request: NextRequest) {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    try {
        const isOwner = await getRolePermission("OWNER")
        
        // Check if user is authenticated
        if (!isOwner) {
            return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
        }

        // Get the invite ID from the request body
        const { inviteId } = await request.json();

        if (!inviteId) {
            return NextResponse.json({ error: 'Invite ID is required' }, { status: 400 });
        }

        // Delete the invite
        await prisma.userInvite.delete({
            where: {
                id: inviteId
            }
        });

        return NextResponse.json({ message: 'Invite deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting invite:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
