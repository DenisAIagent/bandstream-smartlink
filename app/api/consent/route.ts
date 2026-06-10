export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { analytics, marketing, id } = await request.json();

  try {
    const consent = await prisma.consent.upsert({
      where: {
        privacyId: id,
      },
      update: {
        analytics,
        marketing,
        updatedAt: new Date(),
      },
      create: {
        privacyId: id,
        analytics,
        marketing,
      },
    });

    return NextResponse.json(consent);
  } catch (error) {
    console.error('Error updating consent:', error);
    return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 });
  }
}
