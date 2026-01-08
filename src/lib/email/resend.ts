import { Resend } from 'resend';
import { EmailTemplate } from './templates';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'O1DMatch <noreply@o1dmatch.com>';

interface SendEmailParams {
  to: string;
  template: EmailTemplate;
  replyTo?: string;
}

export async function sendEmail({ to, template, replyTo }: SendEmailParams): Promise<{ id: string } | null> {
  const resend = getResendClient();

  if (!resend) {
    console.warn('RESEND_API_KEY not set, skipping email send');
    console.log('Would send email to:', to);
    console.log('Subject:', template.subject);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo,
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw error;
    }

    return data;
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
