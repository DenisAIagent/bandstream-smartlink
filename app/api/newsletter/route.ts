import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, locale } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const validLocale = locale && typeof locale === 'string' ? locale : 'en';

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Service indisponible' }, { status: 503 });
    }

    const res = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        templateId: 2,
        includeListIds: [3],
        redirectionUrl: `https://band.stream/${validLocale}/newsletter/confirmed`,
      }),
    });

    if (res.status === 201 || res.status === 204) {
      return NextResponse.json({ ok: true });
    }

    const data = await res.json().catch(() => ({}));

    if (data.code === 'duplicate_parameter') {
      return NextResponse.json({ duplicate: true });
    }

    return NextResponse.json({ error: data.message || 'Erreur Brevo' }, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
