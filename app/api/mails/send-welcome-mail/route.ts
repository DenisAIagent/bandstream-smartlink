import { NextResponse } from 'next/server';
import { sendWelcomeMail } from '@/lib/actions/send-welcome-mail';

export const dynamic = 'force-dynamic';

// /api/mails/send-welcome-mail?internalApiToken=${internalApiToken}&username=${params.user.name}&email=${params.user.email}
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const internalApiToken = searchParams.get('internalApiToken');
    const username = searchParams.get('username');
    const email = searchParams.get('email');

    if(internalApiToken !== process.env.INTERNAL_API_TOKEN) {
        return NextResponse.json({ message: 'Invalid internal API token' }, { status: 401 });
    }

    if(!username || !email) {
        return NextResponse.json({ message: 'Username or email not found' }, { status: 400 });
    }

    const result = await sendWelcomeMail(username, email);
    return NextResponse.json({ message: 'Request sent: ' + result.response.status });
}


// /api/mails/send-welcomemail?internalApiToken=1234567890&username=David%20Balland&email=mail@morve.us