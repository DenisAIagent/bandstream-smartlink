import { sendEmail } from '@/lib/mailers/mailjet';
import WelcomeEmail from '@/components/mails/WelcomeEmail';
import { render } from '@react-email/render';

export const sendWelcomeMail = async (userName: string, userEmail: string) => {
    const subject = `${userName}, welcome to band.stream!`;

    // Send welcome email to each recipient
    const htmlString = await render(WelcomeEmail({
        userFirstname: userName.split(' ')[0] // Get first name
    }), {
        pretty: true,
    });
    // const bottomText = '';
    
    // Send email to current recipient
    return await sendEmail({
        name: userName,
        mail: userEmail,
        sendername: 'band.stream',
        from: 'no-reply@band.stream',
        subject: subject,
        message: htmlString,
    });
}