'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { createBand } from '@/lib/services/band-create';

type CreateBandState = {
  error?: string | { name: string[] };
  success?: boolean;
  data?: {
    id: number;
    name: string;
  };
};

export async function createBandAction(
  prevState: CreateBandState,
  formData: FormData
): Promise<CreateBandState> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  
  if (!name || name.trim().length < 1) {
    return { 
      error: { 
        name: ['Name must be at least 1 character long'] // TODO: translate
      } 
    };
  }

  try {
    const result = await createBand(session.user.id, name);

    if (!result.ok) {
      return { error: 'Failed to create band' };
    }

    return {
      success: true,
      data: {
        id: result.band.id,
        name: result.band.name
      }
    };
  } catch (error) {
    console.error('Error creating band:', error);
    return { error: 'Failed to create band' };
  }
}

export async function deleteBandAction(id: string | number) {
    if (!id) {
        return { error: 'Band ID is required' };
    }

    const session = await auth();

    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        // Verify the band exists and user has permission
        const band = await prisma.band.findFirst({
            where: { 
            id: Number(id),
            users: {
                some: {
                userId: session.user.id,
                role: 'OWNER'
                }
            }
            }
        });

        if (!band) {
            return { error: 'Band not found or you don\'t have permission to delete it' };
        }

        await prisma.band.update({
            where: { id: Number(id) },
            data: {
                deletedAt: new Date()
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error deleting band:', error);
        return { error: 'Failed to delete band' };
    }
}