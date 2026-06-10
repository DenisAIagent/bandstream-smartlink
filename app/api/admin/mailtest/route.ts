import { requireAdmin } from "@/lib/auth/api-guard";
export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { sendConnectMail } from '@/lib/actions/send-connect-mail';
import { auth } from '@/auth';

export async function GET() {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
    const session = await auth();

    if(!session?.user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const validationCode = Math.random().toString(36).substring(2, 8);

    if(!session.user.email || !session.user.name) {
        return NextResponse.json({ message: 'User email or name not found' }, { status: 404 });
    }

    const result = await sendConnectMail(session.user.email, session.user.name, validationCode);
    console.log(result.response.status);
    return NextResponse.json({ message: 'Emails sent successfully ' + result.response.status });
}
