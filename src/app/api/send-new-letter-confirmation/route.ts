// src/app/api/send-new-letter-confirmation/route.ts
//
// Sends a confirmation email to the agency after they submit an interest letter.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      toEmail,
      agencyName,
      jobTitle,
      clientName,
      commitmentLevel,
      engagementType,
      workArrangement,
      salaryMin,
      salaryMax,
      salaryNegotiable,
      locations,
      startTiming,
    } = await request.json();

    if (!toEmail || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: toEmail, jobTitle' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('[send-new-letter-confirmation] SENDGRID_API_KEY is not set');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    // ── Format helpers ───────────────────────────────────────────────────────
    const formatSalary = () => {
      if (salaryNegotiable && !salaryMin && !salaryMax) return 'Negotiable';
      if (salaryMin && salaryMax)
        return `$${Number(salaryMin).toLocaleString()} – $${Number(salaryMax).toLocaleString()}${salaryNegotiable ? ' (Negotiable)' : ''}`;
      if (salaryMin) return `$${Number(salaryMin).toLocaleString()}+`;
      if (salaryMax) return `Up to $${Number(salaryMax).toLocaleString()}`;
      return 'Not specified';
    };

    const formatEnum = (val: string) =>
      val?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Not specified';

    const sentAt = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const displayLocations = locations
      ? (Array.isArray(locations) ? locations.join(', ') : locations)
      : 'Not specified';

    // ── HTML email ───────────────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Interest Letter Sent – O1DMatch</title>
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
                Interest Letter Sent &#10003;
              </h1>
              <p style="margin:12px 0 0;font-size:14px;
                         color:rgba(255,255,255,0.58);line-height:1.5;">
                Your letter has been submitted and is pending admin review.
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#FFFFFF;padding:36px 40px;">

              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Hi ${agencyName || 'there'},
              </p>

              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Your interest letter for <strong>${jobTitle}</strong>${clientName ? ` on behalf of <strong>${clientName}</strong>` : ''} has been successfully submitted. Our admin team will review it shortly.
              </p>

              <!-- Summary card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FBF8F1;
                            border:1.5px solid rgba(212,168,75,0.3);
                            border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">

                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;
                               letter-spacing:0.12em;text-transform:uppercase;
                               color:#D4A84B;">Letter Summary</p>
                    <h2 style="margin:0 0 22px;font-size:19px;font-weight:700;
                               color:#0B1D35;line-height:1.25;">${jobTitle}</h2>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                          <p style="margin:0 0 3px;font-size:10px;color:#9CA3AF;
                                     font-weight:700;text-transform:uppercase;
                                     letter-spacing:0.09em;">Client</p>
                          <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                            ${clientName || 'Not specified'}
                          </p>
                        </td>
                        <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                          <p style="margin:0 0 3px;font-size:10px;color:#9CA3AF;
                                     font-weight:700;text-transform:uppercase;
                                     letter-spacing:0.09em;">Commitment Level</p>
                          <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                            ${formatEnum(commitmentLevel)}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                          <p style="margin:0 0 3px;font-size:10px;color:#9CA3AF;
                                     font-weight:700;text-transform:uppercase;
                                     letter-spacing:0.09em;">Engagement Type</p>
                          <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                            ${formatEnum(engagementType)}
                          </p>
                        </td>
                        <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                          <p style="margin:0 0 3px;font-size:10px;color:#9CA3AF;
                                     font-weight:700;text-transform:uppercase;
                                     letter-spacing:0.09em;">Work Arrangement</p>
                          <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                            ${formatEnum(workArrangement)}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                          <p style="margin:0 0 3px;font-size:10px;color:#9CA3AF;
                                     font-weight:700;text-transform:uppercase;
                                     letter-spacing:0.09em;">Compensation</p>
                          <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                            ${formatSalary()}
                          </p>
                        </td>
                        <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                          <p style="margin:0 0 3px;font-size:10px;color:#9CA3AF;
                                     font-weight:700;text-transform:uppercase;
                                     letter-spacing:0.09em;">Location(s)</p>
                          <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                            ${displayLocations}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="vertical-align:top;">
                          <p style="margin:0 0 3px;font-size:10px;color:#9CA3AF;
                                     font-weight:700;text-transform:uppercase;
                                     letter-spacing:0.09em;">Start Timing</p>
                          <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                            ${startTiming || 'Not specified'}
                          </p>
                        </td>
                        <td width="50%" style="vertical-align:top;">
                          <p style="margin:0 0 3px;font-size:10px;color:#9CA3AF;
                                     font-weight:700;text-transform:uppercase;
                                     letter-spacing:0.09em;">Submitted On</p>
                          <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                            ${sentAt}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What happens next -->
              <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0B1D35;">
                What happens next?
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
                      Our admin team reviews the letter for completeness and compliance.
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
                      Once approved, the letter is forwarded to the candidate for review.
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
                      You will be notified when the candidate responds.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="https://app.o1dmatch.com/dashboard/agency/letters"
                       style="display:inline-block;padding:14px 36px;
                              background:#D4A84B;color:#0B1D35;font-size:15px;
                              font-weight:700;text-decoration:none;border-radius:10px;">
                      View My Letters &#8594;
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

    // ── SendGrid ─────────────────────────────────────────────────────────────
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail, name: agencyName || 'Agency' }] }],
        from: { email: 'noreply@o1dmatch.com', name: 'O1DMatch Support Team' },
        reply_to: { email: 'noreply@o1dmatch.com', name: 'O1DMatch Support Team' },
        subject: `Your interest letter for "${jobTitle}" has been submitted`,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    if (!sgResponse.ok) {
      const errBody = await sgResponse.text();
      console.error('[send-new-letter-confirmation] SendGrid error:', sgResponse.status, errBody);
      return NextResponse.json(
        { error: 'SendGrid rejected the request', detail: errBody },
        { status: 500 }
      );
    }

    console.log('[send-new-letter-confirmation] Email sent to:', toEmail);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[send-new-letter-confirmation] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 });
  }
}