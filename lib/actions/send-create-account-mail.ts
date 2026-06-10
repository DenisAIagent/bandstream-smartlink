import { sendEmail } from '@/lib/mailers/mailjet';
import CreateAccountEmail from '@/components/mails/CreateAccountEmail';
import { render } from '@react-email/render';

export const sendCreateAccountMail = async (mail: string, name: string, url: string) => {

    const subject = 'Confirm account creation';

    // Send welcome email to each recipient
    const htmlString = await render(CreateAccountEmail({
        url: url
    }), {
        pretty: true,
    });
    
    // Send email to current recipient
    return await sendEmail({
        name: name,
        mail: mail,
        sendername: 'band.stream',
        from: 'no-reply@band.stream',
        subject: subject,
        message: htmlString,
    });
}