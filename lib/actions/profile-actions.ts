'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type UpdateProfileState = {
  error?: string;
  success?: boolean;
};

export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const rawName = formData.get('name');
  const rawPhone = formData.get('phone');

  const name = typeof rawName === 'string' ? rawName.trim() : '';
  const phone = typeof rawPhone === 'string' ? rawPhone.trim() : '';

  if (name.length < 1) {
    return { error: 'name_required' };
  }

  // Loose phone format check: digits, spaces, +, -, parens, dot. Min 6 chars.
  // Empty phone is allowed (optional).
  if (phone && !/^[\d\s+\-().]{6,}$/.test(phone)) {
    return { error: 'phone_invalid' };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone: phone || null,
      },
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { error: 'update_failed' };
  }

  revalidatePath('/admin/profile', 'page');
  return { success: true };
}
