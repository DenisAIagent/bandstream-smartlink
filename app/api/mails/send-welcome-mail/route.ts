import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { sendWelcomeMail } from '@/lib/actions/send-welcome-mail';

export const dynamic = 'force-dynamic';

/**
 * Endpoint interne (serveur → serveur) : envoi de l'email de bienvenue.
 *
 * Audit APP-08 : le secret transite désormais en en-tête
 * `Authorization: Bearer <INTERNAL_API_TOKEN>` (jamais en query string —
 * les URLs sont journalisées par les proxies/serveurs) et la comparaison
 * est en temps constant. POST JSON : { username, email }.
 */
export async function POST(request: Request) {
    const expected = process.env.INTERNAL_API_TOKEN;
    if (!expected) {
        return NextResponse.json({ message: 'Internal API not configured' }, { status: 503 });
    }

    const header = request.headers.get('authorization') ?? '';
    const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
        return NextResponse.json({ message: 'Invalid internal API token' }, { status: 401 });
    }

    let username: unknown, email: unknown;
    try {
        ({ username, email } = await request.json());
    } catch {
        return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }

    if (typeof username !== 'string' || typeof email !== 'string' || !username || !email) {
        return NextResponse.json({ message: 'Username or email not found' }, { status: 400 });
    }

    const result = await sendWelcomeMail(username, email);
    return NextResponse.json({ message: 'Request sent: ' + result.response.status });
}
