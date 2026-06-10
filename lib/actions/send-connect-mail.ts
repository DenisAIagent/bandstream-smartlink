import { sendEmail } from '@/lib/mailers/mailjet';
import ConnectEmail from '@/components/mails/ConnectEmail';
import { render } from '@react-email/render';

export const sendConnectMail = async (mail: string, name: string, validationCode: string) => {

    const subject = 'Here is your validation code';

    // Send welcome email to each recipient
    const htmlString = await render(ConnectEmail({
        validationCode: validationCode
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