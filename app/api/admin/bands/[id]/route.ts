import { requireAdmin } from "@/lib/auth/api-guard";
export const dynamic = "force-dynamic";
// app/api/admin/bands/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { uploadFile } from '@/lib/storage';
import prisma from '@/lib/prisma';
import { BandWithPlatforms } from '@/types/bandstream'; // Adjust the path as necessary
import { isValidDomainname } from '@/lib/services/band-create';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    const { id } = (await context.params);
    try {
        // Find the band by ID with associated platforms via BandPlatform
        const band = await prisma.band.findUnique({
            where: { id: parseInt(id) },
              include: {
                platforms: {
                  include: {
                    platform: true,
                  },
                },
                users: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                      },
                    },
                  },
                },
              },
            });

        if (!band) {
            return NextResponse.json({ error: 'Band not found' }, { status: 404 });
        }

        return NextResponse.json(band);
    } catch (error) {
        console.error('Error fetching band:', error);
        return NextResponse.json({ error: 'Failed to fetch band' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    const params = await props.params;
    try {
        const { id } = params;
        const formData = await req.formData();

        // Retrieve updated fields
        const name = formData.get('name') as string;
        const domainname = formData.get('domainname') as string;
        const album = formData.get('album') as string;
        const trackingGTM = formData.get('trackingGTM') as string;
        const trackingGTAG = formData.get('trackingGTAG') as string;
        const trackingMeta = formData.get('trackingMeta') as string;
        const imageFile = formData.get('image') as File | null;
        const audioFile = formData.get('audio') as File | null;

        // Parse selectedPlatforms (JSON stringified from the frontend)
        const selectedPlatforms = JSON.parse(formData.get('selectedPlatforms') as string) as Record<number, string>;

        // Fetch the existing band data with related platforms
        const existingBand = await prisma.band.findUnique({
            where: { id: parseInt(id) },
            include: { platforms: true },
        }) as BandWithPlatforms | null;

        if (!existingBand) {
            return NextResponse.json({ error: 'Band not found' }, { status: 404 });
        }

        // domainname alimente les clés S3 et le routage : valider strictement.
        const safeDomain = (domainname ?? '').trim().toLowerCase();
        if (!isValidDomainname(safeDomain)) {
            return NextResponse.json({ error: 'invalid_domainname' }, { status: 400 });
        }

        // Update band details
        const updates: {
            name?: string;
            domainname?: string;
            album?: string;
            trackingGTM?: string;
            trackingGTAG?: string;
            trackingMeta?: string;
            coverImage?: string | null;
            musicSample?: string | null;
        } = { name, domainname: safeDomain, album, trackingGTM, trackingGTAG, trackingMeta };

        // Image : type vérifié + ré-encodage sharp (jamais le content-type client)
        if (imageFile) {
            if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
                return NextResponse.json(
                    { error: 'Invalid image format. Accepted: JPEG, PNG, WebP' },
                    { status: 400 }
                );
            }
            const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
            const processed = await sharp(imageBuffer, { limitInputPixels: 24_000_000 })
                .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 90 })
                .toBuffer();
            const imageKey = `bands/covers/${safeDomain}.jpg`;
            updates.coverImage = await uploadFile(imageKey, processed, 'image/jpeg');
        } else {
            updates.coverImage = existingBand.coverImage;
        }

        if (audioFile) {
            if (audioFile.type !== 'audio/mpeg') {
                return NextResponse.json(
                    { error: 'Invalid audio format. Only MP3 is accepted.' },
                    { status: 400 }
                );
            }
            const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
            const audioKey = `bands/music/${safeDomain}.mp3`;
            updates.musicSample = await uploadFile(audioKey, audioBuffer, 'audio/mpeg');
        } else {
            updates.musicSample = existingBand.musicSample;
        }

        // Update the main band data
        const updatedBand = await prisma.band.update({
            where: { id: parseInt(id) },
            data: updates,
        });

        // Find existing platform IDs in the database
        const existingPlatformIds = new Set(
            existingBand.platforms.map((p) => p.platformId)
          );
        // Convert selectedPlatforms keys to numbers for comparison
        const submittedPlatformIds = new Set<number>(
            Object.keys(selectedPlatforms).map(Number)
          );
          
        // Identify platforms to delete (in the database but not in form submission)
        const platformsToDelete = [...existingPlatformIds].filter((id) => !submittedPlatformIds.has(id));

        // Delete removed platforms from BandPlatform
        await prisma.bandPlatform.deleteMany({
            where: {
                bandId: parseInt(id),
                platformId: { in: platformsToDelete },
            },
        });

        // Upsert new and updated platforms
        const bandPlatformUpdates = Object.entries(selectedPlatforms).map(async ([platformId, customURL]) => {
            const platformIdInt = parseInt(platformId);
            return prisma.bandPlatform.upsert({
                where: {
                    bandId_platformId: {
                        bandId: parseInt(id),
                        platformId: platformIdInt,
                    },
                },
                update: { customURL },
                create: {
                    bandId: parseInt(id),
                    platformId: platformIdInt,
                    customURL,
                },
            });
        });

        // Execute all upserts for platforms
        await Promise.all(bandPlatformUpdates);

        return NextResponse.json({ success: true, band: updatedBand });
    } catch (error) {
        console.error('Error updating band:', error);
        return NextResponse.json({ error: 'Failed to update band' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    try {
        const { id } = await context.params;
        const body = await request.json();

        // Whitelist allowed fields to prevent mass assignment
        const allowed = ['name', 'album', 'domainname', 'ticketingURL', 'nextEventDate', 'nextEventType', 'nextEventLocation', 'trackingGTAG', 'trackingGTM', 'trackingMeta', 'publishedAt', 'unpublishedAt', 'template'];

        // Validate template id (matches TEMPLATE_IDS in templates/shared.ts)
        if ('template' in body) {
            const validTemplates = ['obsidian', 'onyx', 'prism', 'ivory', 'carbon'];
            if (!validTemplates.includes(body.template)) {
                return NextResponse.json({ error: 'Invalid template id' }, { status: 400 });
            }
        }

        const filtered: Record<string, unknown> = {};
        for (const key of allowed) {
            if (key in body) filtered[key] = body[key];
        }

        // domainname alimente les clés S3 et le routage : valider à chaque update.
        if ('domainname' in filtered) {
            const dn = String(filtered.domainname).trim().toLowerCase();
            if (!isValidDomainname(dn)) {
                return NextResponse.json({ error: 'invalid_domainname' }, { status: 400 });
            }
            filtered.domainname = dn;
        }

        const updatedBand = await prisma.band.update({
            where: { id: parseInt(id) },
            data: filtered,
        });

        return NextResponse.json(updatedBand);
    } catch (error) {
        console.error('Error updating band:', error);
        return NextResponse.json({ error: 'Failed to update band' }, { status: 500 });
    }
}
