// src/app/api/send-employer-signature-forwarded-notification/route.ts
//
// Sends an email to the employer's signatory when the talent's signed
// interest letter has been reviewed and forwarded to them by an admin.

import { NextRequest, NextResponse } from 'next/server';

async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'noreply@o1dmatch.com', name: 'O1DMatch Support Team' },
      reply_to: { email: 'noreply@o1dmatch.com', name: 'O1DMatch Support Team' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SendGrid ${res.status}: ${body}`);
  }
}

function buildHtml({
  signatoryName,
  companyName,
  jobTitle,
  commitmentLevel,
  engagementType,
  workArrangement,
  salaryMin,
  salaryMax,
  salaryNegotiable,
  locations,
  startTiming,
}: {
  signatoryName: string;
  companyName: string;
  jobTitle: string;
  commitmentLevel: string;
  engagementType: string;
  workArrangement: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryNegotiable: boolean;
  locations: string;
  startTiming: string;
}) {
  const forwardedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const commitmentLabels: Record<string, string> = {
    exploratory_interest: 'Exploratory Interest',
    intent_to_engage: 'Intent to Engage',
    conditional_offer: 'Conditional Offer',
    firm_commitment: 'Firm Commitment',
    offer_extended: 'Offer Extended',
  };
  const commitmentLabel = commitmentLabels[commitmentLevel] ?? commitmentLevel;

  let salaryDisplay = 'Not specified';
  if (salaryMin && salaryMax) {
    salaryDisplay = `$${Number(salaryMin).toLocaleString()} – $${Number(salaryMax).toLocaleString()} / yr`;
  } else if (salaryMin) {
    salaryDisplay = `$${Number(salaryMin).toLocaleString()}+ / yr`;
  } else if (salaryMax) {
    salaryDisplay = `Up to $${Number(salaryMax).toLocaleString()} / yr`;
  }
  if (salaryNegotiable) salaryDisplay += ' (negotiable)';

  const engagementLabels: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract_w2: 'Contract (W2)',
    consulting_1099: 'Consulting (1099)',
    project_based: 'Project Based',
  };
  const engagementLabel = engagementLabels[engagementType] ?? engagementType;

  const arrangementLabels: Record<string, string> = {
    on_site: 'On-site',
    hybrid: 'Hybrid',
    remote: 'Remote',
    flexible: 'Flexible',
  };
  const arrangementLabel = arrangementLabels[workArrangement] ?? workArrangement;

  const detailRow = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;vertical-align:top;width:40%;">
        <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;
                   letter-spacing:0.09em;color:#9CA3AF;">${label}</p>
      </td>
      <td style="padding:10px 0 10px 16px;border-bottom:1px solid #F1F5F9;vertical-align:top;">
        <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">${value}</p>
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Candidate Has Signed – O1DMatch</title>
</head>
<body style="margin:0;padding:0;background:#F1EDE4;
             font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0"
         style="background:#F1EDE4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:#0B1D35;border-radius:16px 16px 0 0;
                       padding:36px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;
                         letter-spacing:0.14em;text-transform:uppercase;color:#D4A84B;">
                O1DMatch
              </p>
              <h1 style="margin:0;font-size:26px;font-weight:700;
                         color:#FFFFFF;line-height:1.2;">
                The Candidate Has Signed &#9997;&#65039;
              </h1>
              <p style="margin:12px 0 0;font-size:14px;
                         color:rgba(255,255,255,0.58);line-height:1.5;">
                The signed interest letter is now available in your dashboard.
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#FFFFFF;padding:36px 40px;">

              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Hi ${signatoryName},
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
                Great news! The candidate has reviewed and signed the Interest Letter from
                <strong style="color:#0B1D35;">${companyName}</strong>
                for the <strong style="color:#0B1D35;">${jobTitle}</strong> position.
                Our team has verified the signature and it is now available for you to view
                in your employer dashboard.
              </p>

              <!-- Signed badge -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;padding:10px 24px;
                                background:#EFF6FF;border:1.5px solid #93C5FD;
                                border-radius:999px;">
                      <span style="font-size:14px;font-weight:700;color:#1D4ED8;">
                        &#9997;&#65039;&nbsp; Signed &amp; Verified by O1DMatch
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Summary card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FBF8F1;border:1.5px solid rgba(212,168,75,0.3);
                            border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px 8px;">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;
                               letter-spacing:0.12em;text-transform:uppercase;color:#D4A84B;">
                      Position
                    </p>
                    <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;
                               color:#0B1D35;line-height:1.25;">${jobTitle}</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${commitmentLabel ? detailRow('Commitment Level', commitmentLabel) : ''}
                      ${detailRow('Salary', salaryDisplay)}
                      ${engagementLabel ? detailRow('Employment Type', engagementLabel) : ''}
                      ${arrangementLabel ? detailRow('Work Arrangement', arrangementLabel) : ''}
                      ${locations ? detailRow('Location(s)', locations) : ''}
                      ${startTiming ? detailRow('Start Timing', startTiming) : ''}
                      ${detailRow('Forwarded On', forwardedAt)}
                    </table>
                  </td>
                </tr>
                <tr><td style="height:12px;"></td></tr>
              </table>

              <!-- What happens next -->
              <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0B1D35;">
                What happens next
              </p>
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="margin-bottom:30px;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #F1F5F9;vertical-align:middle;">
                    <span style="display:inline-block;width:26px;height:26px;
                                  background:#D4A84B;border-radius:50%;text-align:center;
                                  line-height:26px;font-size:12px;font-weight:700;
                                  color:#0B1D35;margin-right:12px;vertical-align:middle;">1</span>
                    <span style="font-size:14px;color:#374151;vertical-align:middle;">
                      Log in to view the signed letter and the candidate&apos;s details.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #F1F5F9;vertical-align:middle;">
                    <span style="display:inline-block;width:26px;height:26px;
                                  background:#D4A84B;border-radius:50%;text-align:center;
                                  line-height:26px;font-size:12px;font-weight:700;
                                  color:#0B1D35;margin-right:12px;vertical-align:middle;">2</span>
                    <span style="font-size:14px;color:#374151;vertical-align:middle;">
                      Our team will reach out to guide you through the O-1 sponsorship process.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;vertical-align:middle;">
                    <span style="display:inline-block;width:26px;height:26px;
                                  background:#D4A84B;border-radius:50%;text-align:center;
                                  line-height:26px;font-size:12px;font-weight:700;
                                  color:#0B1D35;margin-right:12px;vertical-align:middle;">3</span>
                    <span style="font-size:14px;color:#374151;vertical-align:middle;">
                      Track all your letters from your
                      <a href="https://www.o1dmatch.com/dashboard/employer/letters"
                         style="color:#D4A84B;text-decoration:none;font-weight:600;">
                        Letters dashboard
                      </a>.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="https://www.o1dmatch.com/dashboard/employer/letters"
                       style="display:inline-block;padding:14px 36px;background:#D4A84B;
                              color:#0B1D35;font-size:15px;font-weight:700;
                              text-decoration:none;border-radius:10px;">
                      View Signed Letter &#8594;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.7;">
                Questions? Reply to this email or visit your employer dashboard.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#0B1D35;border-radius:0 0 16px 16px;
                       padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#FFFFFF;">
                O1DMatch
              </p>
              <p style="margin:0 0 12px;font-size:12px;
                         color:rgba(255,255,255,0.4);line-height:1.6;">
                Built by a licensed immigration attorney.<br/>
                Connecting extraordinary talent with opportunity.
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.28);">
                &#169; 2026 O1DMatch. All rights reserved. &#183;
                <a href="https://www.o1dmatch.com/privacy"
                   style="color:rgba(255,255,255,0.38);text-decoration:none;">
                  Privacy Policy
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      toEmail,
      signatoryName,
      companyName,
      jobTitle,
      commitmentLevel,
      engagementType,
      workArrangement,
      salaryMin,
      salaryMax,
      salaryNegotiable,
      locations,
      startTiming,
    } = body;

    if (!toEmail || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: toEmail, jobTitle' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('[send-employer-signature-forwarded-notification] SENDGRID_API_KEY is not set');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    await sendEmail(
      apiKey,
      toEmail,
      `The candidate has signed your interest letter for "${jobTitle}" – O1DMatch`,
      buildHtml({
        signatoryName: signatoryName || 'there',
        companyName: companyName || 'Your Company',
        jobTitle,
        commitmentLevel: commitmentLevel || '',
        engagementType: engagementType || '',
        workArrangement: workArrangement || '',
        salaryMin: salaryMin ?? null,
        salaryMax: salaryMax ?? null,
        salaryNegotiable: salaryNegotiable ?? false,
        locations: locations || '',
        startTiming: startTiming || '',
      })
    );

    console.log('[send-employer-signature-forwarded-notification] Email sent to:', toEmail);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[send-employer-signature-forwarded-notification] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to send notification email' }, { status: 500 });
  }
}