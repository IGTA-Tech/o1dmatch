import sgMail from '@sendgrid/mail';
import { EmailTemplate } from './templates';

let initialized = false;

function initSendGrid(): boolean {
  if (!process.env.SENDGRID_API_KEY) {
    return false;
  }
  if (!initialized) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    initialized = true;
  }
  return true;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'O1DMatch <noreply@o1dmatch.com>';

interface SendEmailParams {
  to: string;
  template: EmailTemplate;
  replyTo?: string;
}

export async function sendEmail({ to, template, replyTo }: SendEmailParams): Promise<{ id: string } | null> {
  if (!initSendGrid()) {
    console.warn('SENDGRID_API_KEY not set, skipping email send');
    console.log('Would send email to:', to);
    console.log('Subject:', template.subject);
    return null;
  }

  try {
    const msg = {
      to,
      from: FROM_EMAIL,
      subject: template.subject,
      text: template.text,
      html: template.html,
      ...(replyTo && { replyTo }),
    };

    const [response] = await sgMail.send(msg);

    return { id: response.headers['x-message-id'] || 'sent' };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

// Batch send emails
export async function sendBatchEmails(
  emails: SendEmailParams[]
): Promise<{ id: string }[]> {
  const results: { id: string }[] = [];

  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      if (result) {
        results.push(result);
      }
    } catch (error) {
      console.error(`Failed to send email to ${email.to}:`, error);
    }
  }

  return results;
}
