// src/app/api/send-shortlist-notification/route.ts
//
// Sends two emails when an employer shortlists a candidate:
//   • Employer  → confirmation that they shortlisted the applicant
//   • Talent    → notification that they have been shortlisted
//
// NO names or email addresses appear in either email body.
// Both recipient emails are resolved server-side from Supabase — never sent from the browser.
// Uses SendGrid HTTP API (HTTPS) — works on Vercel (SMTP port 587 is blocked).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── SendGrid helper ───────────────────────────────────────────────────────────
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

// ── Shared email wrapper ──────────────────────────────────────────────────────
function emailWrapper(innerHtml: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#F1EDE4;
             font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background:#F1EDE4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;">
          ${innerHtml}
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
}

// ── Email: Employer confirmation ──────────────────────────────────────────────
function buildEmployerHtml(jobTitle: string, applicationRef: string, appliedOn: string) {
  return emailWrapper(`
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
          Candidate Shortlisted &#10003;
        </h1>
        <p style="margin:12px 0 0;font-size:14px;
                   color:rgba(255,255,255,0.58);line-height:1.5;">
          You have successfully shortlisted an applicant.
        </p>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="background:#FFFFFF;padding:36px 40px;">

        <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
          Hi there,
        </p>
        <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
          You have shortlisted an applicant for <strong style="color:#0B1D35;">${jobTitle}</strong>.
          Here is a summary of the action taken:
        </p>

        <!-- Summary card -->
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:#FBF8F1;border:1.5px solid rgba(212,168,75,0.3);
                      border-radius:12px;margin-bottom:28px;">
          <tr>
            <td style="padding:24px 28px;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;
                         letter-spacing:0.12em;text-transform:uppercase;color:#D4A84B;">
                Shortlisted For
              </p>
              <h2 style="margin:0 0 22px;font-size:19px;font-weight:700;
                         color:#0B1D35;line-height:1.25;">${jobTitle}</h2>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-bottom:0;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;font-weight:700;
                               text-transform:uppercase;letter-spacing:0.09em;">
                      Application Ref
                    </p>
                    <p style="margin:0;font-size:14px;color:#1E293B;font-weight:600;">
                      #${applicationRef}
                    </p>
                  </td>
                  <td width="50%" style="padding-bottom:0;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;font-weight:700;
                               text-transform:uppercase;letter-spacing:0.09em;">
                      Originally Applied
                    </p>
                    <p style="margin:0;font-size:14px;color:#1E293B;font-weight:500;">
                      ${appliedOn}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Next steps -->
        <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0B1D35;">
          Next steps
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #F1F5F9;vertical-align:middle;">
              <span style="display:inline-block;width:26px;height:26px;background:#D4A84B;
                            border-radius:50%;text-align:center;line-height:26px;font-size:12px;
                            font-weight:700;color:#0B1D35;margin-right:12px;vertical-align:middle;">
                1
              </span>
              <span style="font-size:14px;color:#374151;vertical-align:middle;">
                Review the candidate&#8217;s full O-1 profile and evidence in your dashboard.
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #F1F5F9;vertical-align:middle;">
              <span style="display:inline-block;width:26px;height:26px;background:#D4A84B;
                            border-radius:50%;text-align:center;line-height:26px;font-size:12px;
                            font-weight:700;color:#0B1D35;margin-right:12px;vertical-align:middle;">
                2
              </span>
              <span style="font-size:14px;color:#374151;vertical-align:middle;">
                Send a formal Letter of Interest to begin the sponsorship process.
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;vertical-align:middle;">
              <span style="display:inline-block;width:26px;height:26px;background:#D4A84B;
                            border-radius:50%;text-align:center;line-height:26px;font-size:12px;
                            font-weight:700;color:#0B1D35;margin-right:12px;vertical-align:middle;">
                3
              </span>
              <span style="font-size:14px;color:#374151;vertical-align:middle;">
                Our team will facilitate the next steps once the candidate accepts.
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
                        text-decoration:none;border-radius:10px;">
                View Shortlisted Candidates &#8594;
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.7;">
          Questions? Reply to this email or visit your employer dashboard.
        </p>
      </td>
    </tr>
  `);
}

// ── Email: Talent notification ────────────────────────────────────────────────
function buildTalentHtml(jobTitle: string, applicationRef: string) {
  return emailWrapper(`
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
          You&#8217;ve Been Shortlisted! &#127775;
        </h1>
        <p style="margin:12px 0 0;font-size:14px;
                   color:rgba(255,255,255,0.58);line-height:1.5;">
          Great news — an employer has shortlisted your application.
        </p>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="background:#FFFFFF;padding:36px 40px;">

        <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
          Hi there,
        </p>
        <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
          Exciting news! An employer has reviewed your application for
          <strong style="color:#0B1D35;">${jobTitle}</strong> and has moved you
          to the shortlist. This means your profile and O-1 evidence stood out.
        </p>

        <!-- Status card -->
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:#FBF8F1;border:1.5px solid rgba(212,168,75,0.3);
                      border-radius:12px;margin-bottom:28px;">
          <tr>
            <td style="padding:24px 28px;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;
                         letter-spacing:0.12em;text-transform:uppercase;color:#D4A84B;">
                Application Status
              </p>
              <h2 style="margin:0 0 20px;font-size:19px;font-weight:700;
                         color:#0B1D35;line-height:1.25;">${jobTitle}</h2>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;font-weight:700;
                               text-transform:uppercase;letter-spacing:0.09em;">
                      Application Ref
                    </p>
                    <p style="margin:0;font-size:14px;color:#1E293B;font-weight:600;">
                      #${applicationRef}
                    </p>
                  </td>
                  <td width="50%" style="vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;font-weight:700;
                               text-transform:uppercase;letter-spacing:0.09em;">
                      New Status
                    </p>
                    <p style="margin:0;font-size:14px;font-weight:700;color:#16A34A;">
                      &#10003; Shortlisted
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- What this means -->
        <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0B1D35;">
          What this means
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #F1F5F9;vertical-align:middle;">
              <span style="display:inline-block;width:26px;height:26px;background:#D4A84B;
                            border-radius:50%;text-align:center;line-height:26px;font-size:12px;
                            font-weight:700;color:#0B1D35;margin-right:12px;vertical-align:middle;">
                1
              </span>
              <span style="font-size:14px;color:#374151;vertical-align:middle;">
                The employer is actively reviewing your O-1 profile and evidence.
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #F1F5F9;vertical-align:middle;">
              <span style="display:inline-block;width:26px;height:26px;background:#D4A84B;
                            border-radius:50%;text-align:center;line-height:26px;font-size:12px;
                            font-weight:700;color:#0B1D35;margin-right:12px;vertical-align:middle;">
                2
              </span>
              <span style="font-size:14px;color:#374151;vertical-align:middle;">
                If they decide to proceed, you will receive a formal Letter of Interest.
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;vertical-align:middle;">
              <span style="display:inline-block;width:26px;height:26px;background:#D4A84B;
                            border-radius:50%;text-align:center;line-height:26px;font-size:12px;
                            font-weight:700;color:#0B1D35;margin-right:12px;vertical-align:middle;">
                3
              </span>
              <span style="font-size:14px;color:#374151;vertical-align:middle;">
                Keep your profile up to date to strengthen your O-1 eligibility score.
              </span>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td align="center">
              <a href="https://app.o1dmatch.com/dashboard/talent/applications"
                 style="display:inline-block;padding:14px 36px;background:#D4A84B;
                        color:#0B1D35;font-size:15px;font-weight:700;
                        text-decoration:none;border-radius:10px;">
                View My Applications &#8594;
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.7;">
          Questions? Reply to this email or visit your talent dashboard.
          Contact details will be shared once a signed letter of interest is exchanged.
        </p>
      </td>
    </tr>
  `);
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { applicationId, jobTitle } = await request.json();

    if (!applicationId || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, jobTitle' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('[send-shortlist-notification] SENDGRID_API_KEY is not set');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const supabase = await createClient();

    // ── Fetch application → talent user_id + applied_at ──────────────────────
    const { data: application, error: appErr } = await supabase
      .from('job_applications')
      .select(`
        id,
        applied_at,
        created_at,
        job_id,
        talent:talent_profiles (
          user_id
        )
      `)
      .eq('id', applicationId)
      .single();

    if (appErr || !application) {
      console.error('[send-shortlist-notification] Application lookup failed:', appErr);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const talentUserIdRaw = Array.isArray(application.talent)
      ? application.talent[0]?.user_id
      : (application.talent as { user_id: string } | null)?.user_id;

    // ── Fetch talent email from profiles table ────────────────────────────────
    let talentEmail = '';
    if (talentUserIdRaw) {
      const { data: talentProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', talentUserIdRaw)
        .single();
      talentEmail = talentProfile?.email ?? '';
    }

    // ── Fetch employer signatory_email via job_listings → employer_profiles ───
    const { data: job, error: jobErr } = await supabase
      .from('job_listings')
      .select(`
        employer_id,
        employer_profiles (
          signatory_email
        )
      `)
      .eq('id', application.job_id)
      .single();

    if (jobErr || !job) {
      console.error('[send-shortlist-notification] Job lookup failed:', jobErr);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const employerProfileRaw = Array.isArray(job.employer_profiles)
      ? job.employer_profiles[0]
      : job.employer_profiles;

    const employerEmail: string = (employerProfileRaw as { signatory_email: string } | null)?.signatory_email ?? '';

    if (!employerEmail) {
      console.error('[send-shortlist-notification] No employer signatory_email for job:', application.job_id);
      return NextResponse.json({ error: 'Employer email not found' }, { status: 404 });
    }

    // Shared values for email bodies
    const applicationRef = applicationId.slice(0, 8).toUpperCase();
    const appliedOn = new Date(application.applied_at || application.created_at).toLocaleDateString(
      'en-US', { year: 'numeric', month: 'long', day: 'numeric' }
    );

    // ── Send both emails (parallel) ───────────────────────────────────────────
    const emailPromises: Promise<void>[] = [
      sendEmail(
        apiKey,
        employerEmail,
        `You shortlisted an applicant for "${jobTitle}" on O1DMatch`,
        buildEmployerHtml(jobTitle, applicationRef, appliedOn)
      ),
    ];

    if (talentEmail) {
      emailPromises.push(
        sendEmail(
          apiKey,
          talentEmail,
          `You've been shortlisted for "${jobTitle}" on O1DMatch`,
          buildTalentHtml(jobTitle, applicationRef)
        )
      );
    }

    await Promise.all(emailPromises);

    console.log(`[send-shortlist-notification] Emails sent — employer: ${employerEmail}, talent: ${talentEmail || 'n/a'}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[send-shortlist-notification] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}