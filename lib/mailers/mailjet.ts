import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendEmail(
  { name, mail, sendername, from, subject, message }
  :
  { name: string, mail: string, sendername: string, from: string, subject: string, message: string })
  {
  try {
    const result = await getClient().emails.send({
      from: `${sendername} <${from}>`,
      to: [mail],
      subject: subject,
      html: message,
    });
    return { response: { status: 200 }, body: result };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
