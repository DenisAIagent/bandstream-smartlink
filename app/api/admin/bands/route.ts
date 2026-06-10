import { requireAdmin } from "@/lib/auth/api-guard";
export const dynamic = "force-dynamic";
// app/api/admin/bands/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadFile } from '@/lib/storage';
import { auth } from '@/auth';
import sharp from 'sharp';
import { hasBandStreamPermission, BandStreamUserRole } from "@/lib/rbac/roles"
import { isValidDomainname } from "@/lib/services/band-create"

export async function GET() {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    try {
        const session = await auth();
        
        // Check if user is authenticated
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
        }

        // Base query options that are common for both cases
        const baseQuery = {
            where: {
                deletedAt: null,
                ...(hasBandStreamPermission(session.user.role as BandStreamUserRole | undefined, "ADMIN") 
                    ? {} 
                    : { users: { some: { userId: session.user.id } } }
                )
            },
            include: {
                platforms: {
                    select: {
                        platform: true,
                        customURL: true,
                    },
                },
            },
        };

        const bands = await prisma.band.findMany(baseQuery);

        // Transform response to simplify structure
        const transformedBands = bands.map((band) => ({
            ...band,
            platforms: band.platforms.map((p) => ({
                platformId: p.platform.id,
                platformName: p.platform.name,
                platformLogo: p.platform.logo,
                customURL: p.customURL,
            })),
        }));

        return NextResponse.json(transformedBands, { status: 200 });
    } catch (error) {
        console.error('Error fetching bands:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    try {
        const session = await auth();
        
        // Check if user is authenticated
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse FormData
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const domainname = formData.get('domainname') as string;
        const album = formData.get('album') as string;

        const trackingGTM = formData.get('trackingGTM') as string;
        const trackingGTAG = formData.get('trackingGTAG') as string;
        const trackingMeta = formData.get('trackingMeta') as string;
        
        const imageFile = formData.get('image') as File | null;
        const audioFile = formData.get('audio') as File | null;

        if (!name || !album || !imageFile || !audioFile) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // domainname alimente les clés S3 et le routage : valider strictement.
        const safeDomain = (domainname ?? '').trim().toLowerCase();
        if (!isValidDomainname(safeDomain)) {
            return NextResponse.json({ error: 'invalid_domainname' }, { status: 400 });
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.type)) {
            return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
        }
        if (audioFile.type !== 'audio/mpeg') {
            return NextResponse.json({ error: 'Invalid audio format' }, { status: 400 });
        }

        // Image : ré-encodage sharp + content-type serveur (jamais client)
        const rawImage = Buffer.from(await imageFile.arrayBuffer());
        const imageBuffer = await sharp(rawImage, { limitInputPixels: 24_000_000 })
            .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 90 })
            .toBuffer();
        const imageKey = `bands/covers/${safeDomain}.jpg`;
        const imageUrl = await uploadFile(imageKey, imageBuffer, 'image/jpeg');

        // Upload audio
        const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
        const audioKey = `bands/music/${safeDomain}.mp3`;
        const audioUrl = await uploadFile(audioKey, audioBuffer, 'audio/mpeg');

        // Save band information in the database and create the user-band relationship
        const newBand = await prisma.band.create({
            data: {
                name: name,
                domainname: domainname,
                trackingGTM: trackingGTM,
                trackingGTAG: trackingGTAG,
                trackingMeta: trackingMeta,
                album: album,
                coverImage: imageUrl,
                musicSample: audioUrl,
                users: {
                    create: {
                        userId: session.user.id,
                        role: 'OWNER'
                    }
                }
            },
            include: {
                users: true
            }
        });

        return NextResponse.json({ success: true, band: newBand });
    } catch (error) {
        console.error('Error creating band:', error);
        return NextResponse.json({ error: 'Failed to create band' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    const searchParams = request.nextUrl.searchParams;
    const id = parseInt(searchParams.get('id') || '', 10);
  
    try {
        const updatedBand = await prisma.band.update({
            where: { id: id },
            data: { deletedAt: new Date() }, // Set the current timestamp
        });

        return NextResponse.json({ success: true, band: updatedBand });
    } catch (error) {
        console.error('Error marking band as deleted:', error);
        return NextResponse.json({ error: 'Failed to mark band as deleted' }, { status: 500 });
    }
}
