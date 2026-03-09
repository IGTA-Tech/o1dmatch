// src/app/api/send-new-job-confirmation/route.ts
//
// Sends a confirmation email to the agency contact when they
// successfully post a new job listing for a client.

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
  contactName,
  agencyName,
  jobTitle,
  clientName,
  department,
  engagementType,
  workArrangement,
  locations,
  salaryMin,
  salaryMax,
  experienceLevel,
  visaSponsorship,
}: {
  contactName: string;
  agencyName: string;
  jobTitle: string;
  clientName: string;
  department: string | null;
  engagementType: string;
  workArrangement: string;
  locations: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  experienceLevel: string | null;
  visaSponsorship: boolean;
}) {
  const postedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const engagementLabels: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
  };
  const engagementLabel = engagementLabels[engagementType] ?? engagementType;

  const arrangementLabels: Record<string, string> = {
    onsite: 'On-site',
    remote: 'Remote',
    hybrid: 'Hybrid',
  };
  const arrangementLabel = arrangementLabels[workArrangement] ?? workArrangement;

  const experienceLabels: Record<string, string> = {
    entry: 'Entry Level (0-2 years)',
    mid: 'Mid Level (3-5 years)',
    senior: 'Senior (6-10 years)',
    lead: 'Lead / Principal (10+ years)',
    executive: 'Executive',
  };
  const experienceLabel = experienceLevel ? (experienceLabels[experienceLevel] ?? experienceLevel) : null;

  let salaryDisplay = 'Not specified';
  if (salaryMin && salaryMax) {
    salaryDisplay = `$${Number(salaryMin).toLocaleString()} – $${Number(salaryMax).toLocaleString()} / yr`;
  } else if (salaryMin) {
    salaryDisplay = `$${Number(salaryMin).toLocaleString()}+ / yr`;
  } else if (salaryMax) {
    salaryDisplay = `Up to $${Number(salaryMax).toLocaleString()} / yr`;
  }

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
  <title>New Job Posted – O1DMatch</title>
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
                New Job Posted &#10003;
              </h1>
              <p style="margin:12px 0 0;font-size:14px;
                         color:rgba(255,255,255,0.58);line-height:1.5;">
                Your job listing is now live on O1DMatch.
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#FFFFFF;padding:36px 40px;">

              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Hi ${contactName},
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
                A new job listing has been successfully posted by
                <strong style="color:#0B1D35;">${agencyName}</strong>
                on behalf of <strong style="color:#0B1D35;">${clientName}</strong>.
                Here is a summary of the listing:
              </p>

              <!-- Job summary card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FBF8F1;border:1.5px solid rgba(212,168,75,0.3);
                            border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px 8px;">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;
                               letter-spacing:0.12em;text-transform:uppercase;color:#D4A84B;">
                      Job Listing
                    </p>
                    <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;
                               color:#0B1D35;line-height:1.25;">${jobTitle}</h2>
                    <p style="margin:0 0 20px;font-size:13px;color:#6B7280;">
                      ${clientName}
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${department ? detailRow('Department', department) : ''}
                      ${detailRow('Employment Type', engagementLabel)}
                      ${detailRow('Work Arrangement', arrangementLabel)}
                      ${locations ? detailRow('Location(s)', locations) : ''}
                      ${detailRow('Salary', salaryDisplay)}
                      ${experienceLabel ? detailRow('Experience Level', experienceLabel) : ''}
                      ${detailRow('O-1 Visa Sponsorship', visaSponsorship ? 'Available' : 'Not available')}
                      ${detailRow('Posted On', postedAt)}
                    </table>
                  </td>
                </tr>
                <tr><td style="height:12px;"></td></tr>
              </table>

              <!-- What's next -->
              <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0B1D35;">
                What you can do next
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
                      O-1 talent on O1DMatch can now discover this listing.
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
                      Send interest letters to qualified candidates directly from your dashboard.
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
                      Manage all your job listings from your
                      <a href="https://www.o1dmatch.com/dashboard/agency/jobs"
                         style="color:#D4A84B;text-decoration:none;font-weight:600;">
                        Jobs dashboard
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
                    <a href="https://www.o1dmatch.com/dashboard/agency/jobs"
                       style="display:inline-block;padding:14px 36px;background:#D4A84B;
                              color:#0B1D35;font-size:15px;font-weight:700;
                              text-decoration:none;border-radius:10px;">
                      View All Jobs &#8594;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.7;">
                Questions? Reply to this email or visit your agency dashboard.
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
      contactName,
      agencyName,
      jobTitle,
      clientName,
      department,
      engagementType,
      workArrangement,
      locations,
      salaryMin,
      salaryMax,
      experienceLevel,
      visaSponsorship,
    } = body;

    if (!toEmail || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: toEmail, jobTitle' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('[send-new-job-confirmation] SENDGRID_API_KEY is not set');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    await sendEmail(
      apiKey,
      toEmail,
      `New job "${jobTitle}" posted for ${clientName || 'client'} – O1DMatch`,
      buildHtml({
        contactName: contactName || 'there',
        agencyName: agencyName || 'your agency',
        jobTitle,
        clientName: clientName || 'Unknown Client',
        department: department || null,
        engagementType: engagementType || 'full_time',
        workArrangement: workArrangement || 'hybrid',
        locations: locations || null,
        salaryMin: salaryMin ?? null,
        salaryMax: salaryMax ?? null,
        experienceLevel: experienceLevel || null,
        visaSponsorship: visaSponsorship ?? false,
      })
    );

    console.log('[send-new-job-confirmation] Email sent to:', toEmail);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[send-new-job-confirmation] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 });
  }
}