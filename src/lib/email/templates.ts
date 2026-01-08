// Email templates for O1DMatch

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
`;

const buttonStyle = `
  display: inline-block;
  background-color: #2563eb;
  color: #ffffff !important;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
`;

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${baseStyles} margin: 0; padding: 0; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px;">
              <h1 style="color: #2563eb; font-size: 24px; margin: 0 0 20px;">O1DMatch</h1>
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                This email was sent by O1DMatch. If you have questions, please contact support.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Interest Letter Received (for talent)
export function interestLetterReceived(params: {
  talentName: string;
  companyName: string;
  jobTitle: string;
  commitmentLevel: string;
  dashboardUrl: string;
}): EmailTemplate {
  const { talentName, companyName, jobTitle, commitmentLevel, dashboardUrl } = params;

  return {
    subject: `New Interest Letter from ${companyName} - ${jobTitle}`,
    html: layout(`
      <h2 style="margin: 0 0 20px; font-size: 20px; color: #111827;">
        You&apos;ve received a new interest letter!
      </h2>
      <p>Hi ${talentName},</p>
      <p>
        Great news! <strong>${companyName}</strong> has expressed interest in you for the position of
        <strong>${jobTitle}</strong>.
      </p>
      <p>
        <strong>Commitment Level:</strong> ${commitmentLevel}
      </p>
      <p>
        This letter can be used as supporting documentation for your O-1 visa petition.
        Log in to your dashboard to view the full details and respond.
      </p>
      <p style="margin: 30px 0;">
        <a href="${dashboardUrl}" style="${buttonStyle}">View Interest Letter</a>
      </p>
      <p>Best regards,<br>The O1DMatch Team</p>
    `),
    text: `
Hi ${talentName},

Great news! ${companyName} has expressed interest in you for the position of ${jobTitle}.

Commitment Level: ${commitmentLevel}

This letter can be used as supporting documentation for your O-1 visa petition.
Log in to your dashboard to view the full details and respond.

View the letter: ${dashboardUrl}

Best regards,
The O1DMatch Team
    `.trim(),
  };
}

// Letter Response (for employer)
export function letterResponse(params: {
  employerName: string;
  talentName?: string;
  candidateId: string;
  jobTitle: string;
  accepted: boolean;
  talentEmail?: string;
  talentPhone?: string;
  dashboardUrl: string;
}): EmailTemplate {
  const {
    employerName,
    talentName,
    candidateId,
    jobTitle,
    accepted,
    talentEmail,
    talentPhone,
    dashboardUrl,
  } = params;

  const statusText = accepted ? 'accepted' : 'declined';
  const statusColor = accepted ? '#10b981' : '#ef4444';

  return {
    subject: `Interest Letter ${statusText} - ${jobTitle}`,
    html: layout(`
      <h2 style="margin: 0 0 20px; font-size: 20px; color: #111827;">
        Interest Letter ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}
      </h2>
      <p>Hi ${employerName},</p>
      <p>
        ${talentName || `Candidate ${candidateId}`} has
        <span style="color: ${statusColor}; font-weight: 600;">${statusText}</span>
        your interest letter for the position of <strong>${jobTitle}</strong>.
      </p>
      ${
        accepted && (talentEmail || talentPhone)
          ? `
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px; color: #166534;">Contact Information Revealed</h3>
          ${talentName ? `<p style="margin: 5px 0;"><strong>Name:</strong> ${talentName}</p>` : ''}
          ${talentEmail ? `<p style="margin: 5px 0;"><strong>Email:</strong> ${talentEmail}</p>` : ''}
          ${talentPhone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${talentPhone}</p>` : ''}
        </div>
        <p>You can now reach out directly to continue the conversation.</p>
      `
          : ''
      }
      <p style="margin: 30px 0;">
        <a href="${dashboardUrl}" style="${buttonStyle}">View in Dashboard</a>
      </p>
      <p>Best regards,<br>The O1DMatch Team</p>
    `),
    text: `
Hi ${employerName},

${talentName || `Candidate ${candidateId}`} has ${statusText} your interest letter for the position of ${jobTitle}.

${
  accepted && (talentEmail || talentPhone)
    ? `
Contact Information Revealed:
${talentName ? `Name: ${talentName}` : ''}
${talentEmail ? `Email: ${talentEmail}` : ''}
${talentPhone ? `Phone: ${talentPhone}` : ''}

You can now reach out directly to continue the conversation.
`
    : ''
}

View in Dashboard: ${dashboardUrl}

Best regards,
The O1DMatch Team
    `.trim(),
  };
}

// Application Received (for employer)
export function applicationReceived(params: {
  employerName: string;
  candidateId: string;
  jobTitle: string;
  o1Score: number;
  dashboardUrl: string;
}): EmailTemplate {
  const { employerName, candidateId, jobTitle, o1Score, dashboardUrl } = params;

  return {
    subject: `New Application Received - ${jobTitle}`,
    html: layout(`
      <h2 style="margin: 0 0 20px; font-size: 20px; color: #111827;">
        New Application Received
      </h2>
      <p>Hi ${employerName},</p>
      <p>
        A new candidate has applied for your <strong>${jobTitle}</strong> position.
      </p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Candidate ID:</strong> ${candidateId}</p>
        <p style="margin: 5px 0;"><strong>O-1 Readiness Score:</strong> ${o1Score}%</p>
      </div>
      <p>
        Log in to your dashboard to review the application and take action.
      </p>
      <p style="margin: 30px 0;">
        <a href="${dashboardUrl}" style="${buttonStyle}">Review Application</a>
      </p>
      <p>Best regards,<br>The O1DMatch Team</p>
    `),
    text: `
Hi ${employerName},

A new candidate has applied for your ${jobTitle} position.

Candidate ID: ${candidateId}
O-1 Readiness Score: ${o1Score}%

Log in to your dashboard to review the application and take action.

Review Application: ${dashboardUrl}

Best regards,
The O1DMatch Team
    `.trim(),
  };
}

// Document Verified (for talent)
export function documentVerified(params: {
  talentName: string;
  documentTitle: string;
  criterion: string;
  scoreImpact: number;
  newScore: number;
  dashboardUrl: string;
}): EmailTemplate {
  const { talentName, documentTitle, criterion, scoreImpact, newScore, dashboardUrl } = params;

  return {
    subject: `Document Verified - Your O-1 Score Updated`,
    html: layout(`
      <h2 style="margin: 0 0 20px; font-size: 20px; color: #111827;">
        Document Verified!
      </h2>
      <p>Hi ${talentName},</p>
      <p>
        Great news! Your document <strong>${documentTitle}</strong> has been verified.
      </p>
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>O-1 Criterion:</strong> ${criterion}</p>
        <p style="margin: 5px 0;"><strong>Score Impact:</strong> +${scoreImpact} points</p>
        <p style="margin: 5px 0;"><strong>New O-1 Score:</strong> ${newScore}%</p>
      </div>
      <p>
        Keep uploading evidence to strengthen your O-1 profile!
      </p>
      <p style="margin: 30px 0;">
        <a href="${dashboardUrl}" style="${buttonStyle}">View Your Profile</a>
      </p>
      <p>Best regards,<br>The O1DMatch Team</p>
    `),
    text: `
Hi ${talentName},

Great news! Your document "${documentTitle}" has been verified.

O-1 Criterion: ${criterion}
Score Impact: +${scoreImpact} points
New O-1 Score: ${newScore}%

Keep uploading evidence to strengthen your O-1 profile!

View Your Profile: ${dashboardUrl}

Best regards,
The O1DMatch Team
    `.trim(),
  };
}

// Document Rejected (for talent)
export function documentRejected(params: {
  talentName: string;
  documentTitle: string;
  reason: string;
  reviewerNotes?: string;
  dashboardUrl: string;
}): EmailTemplate {
  const { talentName, documentTitle, reason, reviewerNotes, dashboardUrl } = params;

  return {
    subject: `Document Review Update - ${documentTitle}`,
    html: layout(`
      <h2 style="margin: 0 0 20px; font-size: 20px; color: #111827;">
        Document Review Update
      </h2>
      <p>Hi ${talentName},</p>
      <p>
        Your document <strong>${documentTitle}</strong> has been reviewed and requires some attention.
      </p>
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ef4444;">
        <p style="margin: 5px 0;"><strong>Status:</strong> Needs Revision</p>
        <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>
        ${reviewerNotes ? `<p style="margin: 10px 0 0;"><strong>Reviewer Notes:</strong> ${reviewerNotes}</p>` : ''}
      </div>
      <p>
        Please review the feedback and consider uploading an updated document or additional evidence.
      </p>
      <p style="margin: 30px 0;">
        <a href="${dashboardUrl}" style="${buttonStyle}">View Your Documents</a>
      </p>
      <p>Best regards,<br>The O1DMatch Team</p>
    `),
    text: `
Hi ${talentName},

Your document "${documentTitle}" has been reviewed and requires some attention.

Status: Needs Revision
Reason: ${reason}
${reviewerNotes ? `Reviewer Notes: ${reviewerNotes}` : ''}

Please review the feedback and consider uploading an updated document or additional evidence.

View Your Documents: ${dashboardUrl}

Best regards,
The O1DMatch Team
    `.trim(),
  };
}

// Welcome Email
export function welcomeEmail(params: {
  name: string;
  role: string;
  dashboardUrl: string;
}): EmailTemplate {
  const { name, role, dashboardUrl } = params;

  const roleMessages: Record<string, string> = {
    talent: 'Start by completing your profile and uploading evidence of your extraordinary abilities.',
    employer: 'Start by completing your company profile to begin browsing O-1 ready talent.',
    agency: 'Set up your agency profile and start managing clients looking for O-1 talent.',
    lawyer: 'Complete your attorney profile to appear in our lawyer directory.',
  };

  const message = roleMessages[role] || roleMessages.talent;

  return {
    subject: `Welcome to O1DMatch!`,
    html: layout(`
      <h2 style="margin: 0 0 20px; font-size: 20px; color: #111827;">
        Welcome to O1DMatch!
      </h2>
      <p>Hi ${name},</p>
      <p>
        Thank you for joining O1DMatch! We&apos;re excited to help you navigate the O-1 visa journey.
      </p>
      <p>${message}</p>
      <p style="margin: 30px 0;">
        <a href="${dashboardUrl}" style="${buttonStyle}">Go to Dashboard</a>
      </p>
      <p>
        If you have any questions, feel free to reach out to our support team.
      </p>
      <p>Best regards,<br>The O1DMatch Team</p>
    `),
    text: `
Hi ${name},

Thank you for joining O1DMatch! We're excited to help you navigate the O-1 visa journey.

${message}

Go to Dashboard: ${dashboardUrl}

If you have any questions, feel free to reach out to our support team.

Best regards,
The O1DMatch Team
    `.trim(),
  };
}

// Waitlist Confirmation (for user who signed up)
export function waitlistConfirmation(params: {
  name: string;
  userType: string;
  position?: string;
}): EmailTemplate {
  const { name, userType, position } = params;

  const userTypeMessages: Record<string, string> = {
    talent: 'As an O-1 talent, you\'ll get early access to connect with employers looking for extraordinary individuals like you.',
    employer: 'As an employer, you\'ll be among the first to access our pool of pre-vetted O-1 ready talent.',
    agency: 'As an agency partner, you\'ll get priority access to our platform for managing O-1 placements.',
    lawyer: 'As an immigration attorney, you\'ll be featured in our lawyer directory and connect with O-1 candidates.',
  };

  const message = userTypeMessages[userType] || userTypeMessages.talent;

  return {
    subject: `You're on the O1DMatch Waitlist!`,
    html: layout(`
      <h2 style="margin: 0 0 20px; font-size: 20px; color: #111827;">
        You're on the list!
      </h2>
      <p>Hi ${name},</p>
      <p>
        Thank you for joining the O1DMatch waitlist! We're building the premier platform for
        connecting O-1 visa talent with US employers.
      </p>
      <p>${message}</p>
      <div style="background-color: #eff6ff; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
        <p style="margin: 0; font-weight: 600; color: #1e40af;">What happens next?</p>
        <ul style="margin: 10px 0 0; padding-left: 20px; color: #1e40af;">
          <li>We'll notify you as soon as we launch</li>
          <li>Early waitlist members get priority access</li>
          <li>You may receive exclusive pre-launch offers</li>
        </ul>
      </div>
      ${position ? `<p style="font-size: 14px; color: #6b7280;">Your priority status: <strong>${position}</strong></p>` : ''}
      <p>
        Stay tuned for updates! We can't wait to have you on board.
      </p>
      <p>Best regards,<br>The O1DMatch Team</p>
    `),
    text: `
Hi ${name},

Thank you for joining the O1DMatch waitlist! We're building the premier platform for connecting O-1 visa talent with US employers.

${message}

What happens next?
- We'll notify you as soon as we launch
- Early waitlist members get priority access
- You may receive exclusive pre-launch offers

${position ? `Your priority status: ${position}` : ''}

Stay tuned for updates! We can't wait to have you on board.

Best regards,
The O1DMatch Team
    `.trim(),
  };
}

// Waitlist Admin Notification (for admin when someone signs up)
export function waitlistSignupAdmin(params: {
  userType: string;
  name: string;
  email: string;
  company?: string;
  priorityScore: number;
}): EmailTemplate {
  const { userType, name, email, company, priorityScore } = params;

  return {
    subject: `New Waitlist Signup: ${userType.charAt(0).toUpperCase() + userType.slice(1)} - ${name}`,
    html: layout(`
      <h2 style="margin: 0 0 20px; font-size: 20px; color: #111827;">
        New Waitlist Signup
      </h2>
      <p>A new user has joined the O1DMatch waitlist:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Type:</strong> ${userType.charAt(0).toUpperCase() + userType.slice(1)}</p>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
        ${company ? `<p style="margin: 5px 0;"><strong>Company/Firm:</strong> ${company}</p>` : ''}
        <p style="margin: 5px 0;"><strong>Priority Score:</strong> ${priorityScore}</p>
      </div>
      <p>
        Log in to the admin dashboard to review and manage waitlist entries.
      </p>
    `),
    text: `
New Waitlist Signup

A new user has joined the O1DMatch waitlist:

Type: ${userType.charAt(0).toUpperCase() + userType.slice(1)}
Name: ${name}
Email: ${email}
${company ? `Company/Firm: ${company}` : ''}
Priority Score: ${priorityScore}

Log in to the admin dashboard to review and manage waitlist entries.
    `.trim(),
  };
}
