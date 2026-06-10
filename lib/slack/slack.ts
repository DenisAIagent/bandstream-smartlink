// import { headers } from 'next/headers';

const SLACK_WEBHOOK_URL_USERS = process.env.SLACK_WEBHOOK_URL_USERS || '';

interface SlackMessage {
  text: string;
  channel?: string;
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
        text,
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