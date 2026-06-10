import { requireAdmin } from "@/lib/auth/api-guard";
export const dynamic = "force-dynamic";
// app/api/platforms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadFile } from '@/lib/storage';
import { auth } from '@/auth';

export async function GET() {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    try {
        const platforms = await prisma.platform.findMany({
            where: { deletedAt: null },
        });
        return NextResponse.json(platforms, { status: 200 });
    } catch (error) {
        console.error('Error fetching platforms:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    try {
        const session = await auth();
        
        // Check if user is authenticated and is an OWNER
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's role from the database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (user?.role !== 'OWNER') {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Parse FormData
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const shortname = formData.get('shortname') as string;
        const URL = formData.get('URL') as string;
        const imageFile = formData.get('image') as File | null;

        if (!name || !shortname || !imageFile || !URL) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Upload image to Scaleway
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        const imageKey = `platforms/logos/${shortname}.png`;
        const imageUrl = await uploadFile(imageKey, imageBuffer, imageFile.type);

        // Save platform information in the database
        const newPlatform = await prisma.platform.create({
            data: {
                name: name,
                shortname: shortname,
                URL: URL,
                logo: imageUrl,
            },
        });

        return NextResponse.json({ success: true, platform: newPlatform });
    } catch (error) {
        console.error('Error creating platform:', error);
        return NextResponse.json({ error: 'Failed to create platform' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    try {
        const session = await auth();
        
        // Check if user is authenticated and is an OWNER
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's role from the database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (user?.role !== 'OWNER') {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const searchParams = request.nextUrl.searchParams;
        const id = parseInt(searchParams.get('id') || '', 10);

        const updatedPlatform = await prisma.platform.update({
            where: { id: id },
            data: { deletedAt: new Date() },
        });
        return NextResponse.json({ success: true, platform: updatedPlatform });
    } catch (error) {
        console.error('Error marking platform as deleted:', error);
        return NextResponse.json({ error: 'Failed to mark platform as deleted' }, { status: 500 });
    }
}
