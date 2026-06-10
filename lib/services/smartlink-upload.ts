import prisma from '@/lib/prisma';
import { uploadFile } from '@/lib/storage';
import sharp from 'sharp';
import { parseBuffer } from 'music-metadata';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 600;
const JPEG_QUALITY = 90;
const MAX_AUDIO_DURATION = 30;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const MAX_INPUT_PIXELS = 24_000_000;

export type SmartLinkUploadResult =
  | { ok: true; smartLink: unknown }
  | { ok: false; status: number; error: string };

/**
 * Upload pochette / extrait audio d'un smartlink.
 * Clés S3 par sortie : bands/covers/{domainname}/{slug}.jpg et
 * bands/music/{domainname}/{slug}.mp3 (les anciennes clés par band
 * restent intactes). Les guards d'auth sont gérés par les routes.
 */
export async function processSmartLinkUpload(
  smartLinkId: number,
  formData: FormData
): Promise<SmartLinkUploadResult> {
  const smartLink = await prisma.smartLink.findUnique({
    where: { id: smartLinkId },
    include: { band: { select: { domainname: true } } },
  });

  if (!smartLink) {
    return { ok: false, status: 404, error: 'SmartLink not found' };
  }

  const imageFile = formData.get('image') as File | null;
  const audioFile = formData.get('audio') as File | null;

  if (!imageFile && !audioFile) {
    return { ok: false, status: 400, error: 'No file provided' };
  }

  const keyBase = `${smartLink.band.domainname}/${smartLink.slug}`;
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
    const processedImage = await sharp(imageBuffer, { limitInputPixels: MAX_INPUT_PIXELS })
      .resize(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    updates.coverImage = await uploadFile(
      `bands/covers/${keyBase}.jpg`,
      processedImage,
      'image/jpeg'
    );
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
    const metadata = await parseBuffer(audioBuffer, { mimeType: 'audio/mpeg' });
    const duration = metadata.format.duration || 0;

    if (duration > MAX_AUDIO_DURATION) {
      return {
        ok: false,
        status: 400,
        error: `Audio is too long (${Math.round(duration)}s). Maximum duration is ${MAX_AUDIO_DURATION} seconds.`,
      };
    }

    updates.musicSample = await uploadFile(
      `bands/music/${keyBase}.mp3`,
      audioBuffer,
      'audio/mpeg'
    );
  }

  const updated = await prisma.smartLink.update({
    where: { id: smartLinkId },
    data: updates,
    include: { platforms: true },
  });

  return { ok: true, smartLink: updated };
}
