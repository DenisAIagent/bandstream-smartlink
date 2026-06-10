export const dynamic = "force-dynamic";
// app/api/check-customer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const customer = searchParams.get('customer');

    if (!customer) {
        return NextResponse.json({ error: 'Invalid customer parameter' }, { status: 400 });
    }

    try {
        // Ne révèle que les bands publiés et non supprimés : pas de fuite
        // d'existence des brouillons (releases confidentielles), et aligne
        // le résultat sur ce que la page fan affiche réellement.
        const customerExists = await prisma.band.findFirst({
            where: {
                domainname: customer,
                publishedAt: { not: null },
                unpublishedAt: null,
                deletedAt: null,
            },
            select: { id: true },
        });
        return NextResponse.json({ exists: !!customerExists });
    } catch (error) {
        console.error('Error checking customer:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}