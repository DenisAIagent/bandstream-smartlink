import { requireAdmin } from "@/lib/auth/api-guard";
export const dynamic = "force-dynamic";
// app/api/admin/platforms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    try {
        const session = await auth();
        
        // Check if user is authenticated
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

        const { id } = (await context.params);
        const platform = await prisma.platform.findUnique({
            where: { id: parseInt(id) },
        });

        if (!platform) {
            return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
        }

        return NextResponse.json(platform);
    } catch (error) {
        console.error('Error fetching platform:', error);
        return NextResponse.json({ error: 'Failed to fetch platform' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    try {
        const session = await auth();
        
        // Check if user is authenticated
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

        const params = await props.params;
        const { id } = params;
        const formData = await req.formData();

        const name = formData.get('name') as string;
        const shortname = formData.get('shortname') as string;
        const URL = formData.get('URL') as string;
        const imageFile = formData.get('image') as File | null;

        // Fetch the existing platform data
        const existingPlatform = await prisma.platform.findUnique({ 
            where: { id: parseInt(id) } 
        });
        
        if (!existingPlatform) {
            return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
        }

        const updates: { 
            name?: string;
            shortname?: string;
            URL?: string;
            logo?: string | null;
        } = { name, shortname, URL };

        // Upload new image if provided, else keep the existing one
        if (imageFile) {
            const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
            const imageKey = `platforms/logos/${shortname}.jpg`;
            updates.logo = await uploadFile(imageKey, imageBuffer, imageFile.type);
        } else {
            updates.logo = existingPlatform.logo;
        }

        const updatedPlatform = await prisma.platform.update({
            where: { id: parseInt(id) },
            data: updates,
        });

        return NextResponse.json({ success: true, platform: updatedPlatform });
    } catch (error) {
        console.error('Error updating platform:', error);
        return NextResponse.json({ error: 'Failed to update platform' }, { status: 500 });
    }
}

