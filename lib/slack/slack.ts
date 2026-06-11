// import { headers } from 'next/headers';

const SLACK_WEBHOOK_URL_USERS = process.env.SLACK_WEBHOOK_URL_USERS || '';

interface SlackMessage {
  text: string;
  channel?: string;
}

/**
 * Pseudonymise les adresses email d'un message avant envoi à Slack
 * (RGPD art. 5.1.c — minimisation : Slack est un sous-traitant US, le
 * monitoring opérationnel n'a pas besoin de l'adresse complète).
 * `denis@band.stream` → `d•••@band.stream` — assez pour reconnaître un
 * client connu, pas assez pour constituer un fichier d'emails chez Slack.
 * L'adresse complète reste consultable dans l'admin (fiche client 360°).
 */
function maskEmails(text: string): string {
  return text.replace(
    /([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g,
    (_match, first: string, domain: string) => `${first}•••@${domain}`
  );
}

export async function sendSlackUserNotification({ text }: SlackMessage) {
  // if dev environment, return true
  if (process.env.NODE_ENV === 'development') {
    // return true;
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL_USERS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: maskEmails(text),
        icon_emoji: ':band:',
        channel: '#users-and-customers',
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}