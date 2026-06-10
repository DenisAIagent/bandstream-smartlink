import prisma from '@/lib/prisma';
import { uploadFile } from '@/lib/storage';
import sharp from 'sharp';
import { parseBuffer } from 'music-metadata';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 600;
const JPEG_QUALITY = 90;
const MAX_AUDIO_DURATION = 30;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 Mo
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10 Mo
const MAX_INPUT_PIXELS = 24_000_000; // ~ anti pixel-bomb

export type BandUploadResult =
  | { ok: true; band: unknown }
  | { ok: false; status: number; error: string };

/**
 * Process cover image / music sample uploads for a band.
 * Shared by the admin and dashboard upload routes — callers are
 * responsible for auth/ownership checks.
 */
export async function processBandUpload(
  bandId: number,
  formData: FormData
): Promise<BandUploadResult> {
  const band = await prisma.band.findUnique({
    where: { id: bandId },
  });

  if (!band) {
    return { ok: false, status: 404, error: 'Band not found' };
  }

  const imageFile = formData.get('image') as File | null;
  const audioFile = formData.get('audio') as File | null;

  if (!imageFile && !audioFile) {
    return { ok: false, status: 400, error: 'No file provided' };
  }

  const updates: { coverImage?: string; musicSample?: string } = {};

  if (imageFile) {
    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
      return {
        ok: false,
        status: 400,
        error: 'Invalid image format. Accepted: JPEG, PNG, WebP',
      };
    }
    if (imageFile.size > MAX_IMAGE_BYTES) {
      return { ok: false, status: 400, error: 'Image too large (max 10 MB)' };
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    // Resize to max 600x600 (fit within, no stretching) and convert to JPEG 90%
    const processedImage = await sharp(imageBuffer, { limitInputPixels: MAX_INPUT_PIXELS })
      .resize(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    const imageKey = `bands/covers/${band.domainname}.jpg`;
    updates.coverImage = await uploadFile(imageKey, processedImage, 'image/jpeg');
  }

  if (audioFile) {
    if (audioFile.type !== 'audio/mpeg') {
      return {
        ok: false,
        status: 400,
        error: 'Invalid audio format. Only MP3 is accepted.',
      };
    }
    if (audioFile.size > MAX_AUDIO_BYTES) {
      return { ok: false, status: 400, error: 'Audio file too large (max 10 MB)' };
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Validate duration server-side
    const metadata = await parseBuffer(audioBuffer, { mimeType: 'audio/mpeg' });
    const duration = metadata.format.duration || 0;

    if (duration > MAX_AUDIO_DURATION) {
      return {
        ok: false,
        status: 400,
        error: `Audio is too long (${Math.round(duration)}s). Maximum duration is ${MAX_AUDIO_DURATION} seconds.`,
      };
    }

    const audioKey = `bands/music/${band.domainname}.mp3`;
    updates.musicSample = await uploadFile(audioKey, audioBuffer, 'audio/mpeg');
  }

  const updatedBand = await prisma.band.update({
    where: { id: bandId },
    data: updates,
    include: { platforms: true },
  });

  return { ok: true, band: updatedBand };
}
