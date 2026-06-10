import { requireAdmin } from "@/lib/auth/api-guard";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { processBandUpload } from '@/lib/services/band-upload';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id } = await context.params;

    try {
        const formData = await req.formData();
        const result = await processBandUpload(parseInt(id), formData);

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.band);
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
