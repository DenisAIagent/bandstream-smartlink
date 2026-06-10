import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { getRolePermission } from "@/components/auth/RoleGuard"

export async function getUsersCount(): Promise<number> {
    const session = await auth();
    const userId = session?.user?.id;
    const isOwner = await getRolePermission("OWNER")

    if (!userId) {
        throw new Error('User not authenticated');
    }

    // Check if the user has "OWNER" permissions
    if (isOwner) {
        // Return count of all users
        const count = await prisma.user.count({
            // where: {
            //     deletedAt: null,
            // }
        });
        return count;
    }else {
        throw new Error('Unauthorized');
    }
}

// Get count of beta invites
export async function getBetaInvitesCount(): Promise<number> {
    const session = await auth();
    const userId = session?.user?.id;
    const isOwner = await getRolePermission("OWNER")

    if (!userId) {
        throw new Error('User not authenticated');
    }

    if (isOwner) {
        const count = await prisma.userInvite.count();
        return count;
    }else {
        throw new Error('Unauthorized');
    }
}