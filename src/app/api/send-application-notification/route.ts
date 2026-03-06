// src/app/api/send-application-notification/route.ts
//
// Emails the employer when a talent submits a job application.
// Uses SendGrid Web API (HTTPS) — works on Vercel (SMTP port 587 is blocked there).
//
// Flow:
//   1. Receive job_id + talent info from ApplyButton
//   2. Look up job → employer_profiles.signatory_email  (single query, no admin API needed)
//   3. Send branded notification email via SendGrid

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const {
      jobId,
      jobTitle,
      jobLocation,
      talentSkills,
      talentScore,
      coverMessage,
    } = await request.json();

    if (!jobId || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, jobTitle' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('[send-application-notification] SENDGRID_API_KEY is not set');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    // ── Single query: job → employer_profiles (signatory_email lives there) ──
    const supabase = await createClient();

    const { data: job, error: jobErr } = await supabase
      .from('job_listings')
      .select(`
        employer_id,
        employer_profiles (
          company_name,
          signatory_name,
          signatory_email
        )
      `)
      .eq('id', jobId)
      .single();

    if (jobErr || !job) {
      console.error('[send-application-notification] Job lookup failed:', jobErr);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Supabase returns joined rows as object (single FK) or array — handle both
    const employerProfile = Array.isArray(job.employer_profiles)
      ? job.employer_profiles[0]
      : job.employer_profiles;

    const toEmail: string = employerProfile?.signatory_email ?? '';
    const companyName: string = employerProfile?.company_name ?? 'there';
    const signatoryName: string = employerProfile?.signatory_name ?? companyName;

    if (!toEmail) {
      console.error('[send-application-notification] signatory_email is empty for job:', jobId);
      return NextResponse.json({ error: 'Employer email not found' }, { status: 404 });
    }

    // ── Build HTML email ─────────────────────────────────────────────────────
    const displayScore    = talentScore != null ? `${talentScore}%` : 'N/A';
    const displayLocation = jobLocation || 'Not specified';
    const appliedAt       = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    // Skills: accept either an array or a comma-separated string
    const skillsArray: string[] = Array.isArray(talentSkills)
      ? talentSkills
      : typeof talentSkills === 'string' && talentSkills.trim()
        ? talentSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

    const skillBadges = skillsArray.length
      ? skillsArray
          .map(
            (s) =>
              `<span style="display:inline-block;padding:3px 10px;background:#EEF2FF;
                            color:#3730A3;border-radius:100px;font-size:12px;
                            font-weight:600;margin:2px 3px 2px 0;">${s}</span>`
          )
          .join('')
      : '<span style="font-size:13px;color:#9CA3AF;">Not specified</span>';

    const coverSection = coverMessage
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td style="background:#F8F7F4;border-left:3px solid #D4A84B;
                       border-radius:0 8px 8px 0;padding:16px 20px;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.1em;
                         text-transform:uppercase;color:#D4A84B;">Cover Message</p>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;
                         white-space:pre-wrap;">${coverMessage}</p>
            </td>
          </tr>
        </table>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>New Job Application – O1DMatch</title>
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
                New Application Received &#128203;
              </h1>
              <p style="margin:12px 0 0;font-size:14px;
                         color:rgba(255,255,255,0.58);line-height:1.5;">
                An O-1 candidate has applied to one of your job listings.
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#FFFFFF;padding:36px 40px;">

              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Hi ${signatoryName},
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
                               color:#D4A84B;">Applied To</p>
                    <h2 style="margin:0 0 22px;font-size:19px;font-weight:700;
                               color:#0B1D35;line-height:1.25;">${jobTitle}</h2>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding-bottom:16px;vertical-align:top;">
                          <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;
                                     font-weight:700;text-transform:uppercase;
                                     letter-spacing:0.09em;">O-1 Score</p>
                          <p style="margin:0;font-size:22px;font-weight:700;color:#D4A84B;">
                            ${displayScore}
                          </p>
                        </td>
                        <td width="50%" style="padding-bottom:16px;vertical-align:top;">
                          <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;
                                     font-weight:700;text-transform:uppercase;
                                     letter-spacing:0.09em;">Applied On</p>
                          <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                            ${appliedAt}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-bottom:16px;vertical-align:top;">
                          <p style="margin:0 0 8px;font-size:10px;color:#9CA3AF;
                                     font-weight:700;text-transform:uppercase;
                                     letter-spacing:0.09em;">Skills</p>
                          <div>${skillBadges}</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="vertical-align:top;">
                          <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;
                                     font-weight:700;text-transform:uppercase;
                                     letter-spacing:0.09em;">Location</p>
                          <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                            ${displayLocation}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${coverSection}

              <!-- Next steps -->
              <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0B1D35;">
                Next steps
              </p>
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="margin-bottom:30px;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #F1F5F9;
                              vertical-align:middle;">
                    <span style="display:inline-block;width:26px;height:26px;
                                  background:#D4A84B;border-radius:50%;text-align:center;
                                  line-height:26px;font-size:12px;font-weight:700;
                                  color:#0B1D35;margin-right:12px;vertical-align:middle;">
                      1
                    </span>
                    <span style="font-size:14px;color:#374151;vertical-align:middle;">
                      Review the candidate&#8217;s full profile and O-1 evidence in your dashboard.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #F1F5F9;
                              vertical-align:middle;">
                    <span style="display:inline-block;width:26px;height:26px;
                                  background:#D4A84B;border-radius:50%;text-align:center;
                                  line-height:26px;font-size:12px;font-weight:700;
                                  color:#0B1D35;margin-right:12px;vertical-align:middle;">
                      2
                    </span>
                    <span style="font-size:14px;color:#374151;vertical-align:middle;">
                      If interested, send a formal Letter of Interest to begin the sponsorship process.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;vertical-align:middle;">
                    <span style="display:inline-block;width:26px;height:26px;
                                  background:#D4A84B;border-radius:50%;text-align:center;
                                  line-height:26px;font-size:12px;font-weight:700;
                                  color:#0B1D35;margin-right:12px;vertical-align:middle;">
                      3
                    </span>
                    <span style="font-size:14px;color:#374151;vertical-align:middle;">
                      Our team will facilitate next steps once the candidate accepts.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="https://www.o1dmatch.com/dashboard/employer/candidates"
                       style="display:inline-block;padding:14px 36px;
                              background:#D4A84B;color:#0B1D35;font-size:15px;
                              font-weight:700;text-decoration:none;border-radius:10px;">
                      Review Candidate &#8594;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.7;">
                Questions? Reply to this email or visit your employer dashboard.
                Full contact details are shared after a signed letter of interest is exchanged.
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

    // ── SendGrid HTTP API ────────────────────────────────────────────────────
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail, name: signatoryName }] }],
        from: {
          email: 'noreply@o1dmatch.com',
          name: 'O1DMatch Support Team',
        },
        reply_to: {
          email: 'noreply@o1dmatch.com',
          name: 'O1DMatch Support Team',
        },
        subject: `New application for "${jobTitle}" on O1DMatch`,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    if (!sgResponse.ok) {
      const errBody = await sgResponse.text();
      console.error(
        '[send-application-notification] SendGrid error:',
        sgResponse.status,
        errBody
      );
      return NextResponse.json(
        { error: 'SendGrid rejected the request', detail: errBody },
        { status: 500 }
      );
    }

    console.log('[send-application-notification] Email sent to:', toEmail);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[send-application-notification] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to send notification email' }, { status: 500 });
  }
}