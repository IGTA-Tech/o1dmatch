// src/app/api/send-job-confirmation/route.ts
//
// Uses the SendGrid Web API (HTTPS POST) instead of SMTP.
// Vercel blocks outbound SMTP (port 587), but HTTPS works fine.
// No extra npm packages needed — plain fetch() only.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      toEmail,
      toName,
      jobTitle,
      jobLocation,
      engagementType,
      salaryMin,
      salaryMax,
    } = await request.json();

    if (!toEmail || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: toEmail and jobTitle' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('[send-job-confirmation] SENDGRID_API_KEY is not set');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // ── helpers ──────────────────────────────────────────────────────────────
    const engagementLabel: Record<string, string> = {
      full_time: 'Full Time',
      part_time: 'Part Time',
      contract: 'Contract',
    };

    const fmt = (n: number | null | undefined) =>
      n ? `$${Number(n).toLocaleString()}` : '—';

    const salaryLine =
      salaryMin || salaryMax
        ? `${fmt(salaryMin)} – ${fmt(salaryMax)} / yr`
        : 'Not specified';

    const displayName = toName || 'there';
    const displayType = engagementLabel[engagementType] ?? engagementType;
    const displayLocation = jobLocation || 'Not specified';

    // ── HTML email template ──────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Job Posted – O1DMatch</title>
</head>
<body style="margin:0;padding:0;background:#F1EDE4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1EDE4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:#0B1D35;border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.14em;
                         text-transform:uppercase;color:#D4A84B;">O1DMatch</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#FFFFFF;line-height:1.2;">
                Your Job Is Live! &#127881;
              </h1>
              <p style="margin:12px 0 0;font-size:14px;color:rgba(255,255,255,0.58);line-height:1.5;">
                Your listing is now visible to pre-vetted O-1 talent.
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#FFFFFF;padding:36px 40px;">

              <p style="margin:0 0 18px;font-size:15px;color:#374151;line-height:1.7;">
                Hi ${displayName},
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
                Great news &#8212; your job listing has been successfully posted on
                <strong style="color:#0B1D35;">O1DMatch</strong> and is now live for
                extraordinary O-1 talent to discover. Here&#8217;s a summary:
              </p>

              <!-- JOB SUMMARY CARD -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FBF8F1;border:1.5px solid rgba(212,168,75,0.3);
                            border-radius:12px;margin-bottom:30px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.12em;
                               text-transform:uppercase;color:#D4A84B;">Job Posted</p>
                    <h2 style="margin:0 0 22px;font-size:20px;font-weight:700;color:#0B1D35;
                               line-height:1.25;">${jobTitle}</h2>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding-bottom:16px;vertical-align:top;">
                          <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;font-weight:700;
                                     text-transform:uppercase;letter-spacing:0.09em;">Location</p>
                          <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                            ${displayLocation}
                          </p>
                        </td>
                        <td width="50%" style="padding-bottom:16px;vertical-align:top;">
                          <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;font-weight:700;
                                     text-transform:uppercase;letter-spacing:0.09em;">Employment Type</p>
                          <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                            ${displayType}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;font-weight:700;
                                     text-transform:uppercase;letter-spacing:0.09em;">Salary Range</p>
                          <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                            ${salaryLine}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- WHAT HAPPENS NEXT -->
              <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0B1D35;">
                What happens next?
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #F1F5F9;vertical-align:middle;">
                    <span style="display:inline-block;width:26px;height:26px;background:#D4A84B;
                                  border-radius:50%;text-align:center;line-height:26px;
                                  font-size:12px;font-weight:700;color:#0B1D35;
                                  margin-right:12px;vertical-align:middle;">1</span>
                    <span style="font-size:14px;color:#374151;vertical-align:middle;">
                      Our algorithm matches your listing with eligible O-1 candidates.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #F1F5F9;vertical-align:middle;">
                    <span style="display:inline-block;width:26px;height:26px;background:#D4A84B;
                                  border-radius:50%;text-align:center;line-height:26px;
                                  font-size:12px;font-weight:700;color:#0B1D35;
                                  margin-right:12px;vertical-align:middle;">2</span>
                    <span style="font-size:14px;color:#374151;vertical-align:middle;">
                      Matched candidates appear in your dashboard under
                      <em>Candidates</em>.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;vertical-align:middle;">
                    <span style="display:inline-block;width:26px;height:26px;background:#D4A84B;
                                  border-radius:50%;text-align:center;line-height:26px;
                                  font-size:12px;font-weight:700;color:#0B1D35;
                                  margin-right:12px;vertical-align:middle;">3</span>
                    <span style="font-size:14px;color:#374151;vertical-align:middle;">
                      Send Letters of Interest to candidates you&#8217;d like to sponsor.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="https://app.o1dmatch.com/dashboard/employer/jobs"
                       style="display:inline-block;padding:14px 36px;background:#D4A84B;
                              color:#0B1D35;font-size:15px;font-weight:700;
                              text-decoration:none;border-radius:10px;
                              letter-spacing:0.01em;">
                      View My Job Listings &#8594;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.7;">
                If you need to edit or remove this listing, log in to your employer dashboard.
                For any other questions, just reply to this email.
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
              <p style="margin:0 0 12px;font-size:12px;color:rgba(255,255,255,0.4);line-height:1.6;">
                Built by a licensed immigration attorney.<br/>
                Connecting extraordinary talent with opportunity.
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.28);">
                &#169; 2026 O1DMatch. All rights reserved. &#183;
                <a href="https://app.o1dmatch.com/privacy"
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

    // ── Call SendGrid Web API (HTTPS — works on Vercel) ──────────────────────
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: toEmail, name: toName || undefined }],
          },
        ],
        from: {
          email: 'noreply@o1dmatch.com',
          name: 'O1DMatch Support Team',
        },
        reply_to: {
          email: 'noreply@o1dmatch.com',
          name: 'O1DMatch Support Team',
        },
        subject: `Your job "${jobTitle}" is now live on O1DMatch`,
        content: [
          {
            type: 'text/html',
            value: html,
          },
        ],
      }),
    });

    // SendGrid returns 202 Accepted on success (no body)
    if (!sgResponse.ok) {
      const errBody = await sgResponse.text();
      console.error('[send-job-confirmation] SendGrid error:', sgResponse.status, errBody);
      return NextResponse.json(
        { error: 'SendGrid rejected the request', detail: errBody },
        { status: 500 }
      );
    }

    console.log('[send-job-confirmation] Email accepted by SendGrid for:', toEmail);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[send-job-confirmation] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}