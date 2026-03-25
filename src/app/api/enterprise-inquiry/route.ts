/* src/app/api/enterprise-inquiry/route.ts */
import { NextRequest, NextResponse } from "next/server";

// ── .env vars required ───────────────────────────────────
// SENDGRID_API_KEY        your SendGrid API key (SG.xxxx)
// SENDGRID_FROM_EMAIL     verified sender address (e.g. no-reply@o1dmatch.com)
// ENTERPRISE_NOTIFY_EMAIL recipient for notifications

const USER_TYPE_LABELS: Record<string, string> = {
  employer:             "Employer",
  immigration_attorney: "Immigration Attorney",
  staffing_agency:      "Staffing Agency",
};

const INTEREST_LABELS: Record<string, string> = {
  managed_recruiting: "Managed Recruiting",
  bulk_promo_codes:   "Bulk Promo Codes",
  affiliate_program:  "Affiliate Program",
  volume_pricing:     "Volume Pricing",
  other:              "Other",
};

export async function POST(req: NextRequest) {
  try {
    // ── 1. Validate env vars ─────────────────────────────
    const apiKey      = process.env.SENDGRID_API_KEY;
    const fromEmail   = process.env.SENDGRID_FROM_EMAIL;
    const notifyEmail = process.env.ENTERPRISE_NOTIFY_EMAIL;

    const missing = [
      !apiKey      && "SENDGRID_API_KEY",
      !fromEmail   && "SENDGRID_FROM_EMAIL",
      !notifyEmail && "ENTERPRISE_NOTIFY_EMAIL",
    ].filter(Boolean);

    if (missing.length > 0) {
      console.error("[enterprise-inquiry] Missing env vars:", missing.join(", "));
      return NextResponse.json(
        { error: "Server misconfiguration", missing },
        { status: 500 }
      );
    }

    // ── 2. Parse body ────────────────────────────────────
    const body = await req.json();
    const { full_name, company_name, email, phone, user_type, interests, message } = body;

    console.log("[enterprise-inquiry] Submission from:", email);

    const interestList =
      Array.isArray(interests) && interests.length > 0
        ? interests.map((i: string) => INTEREST_LABELS[i] ?? i).join(", ")
        : "None selected";

    // ── 3. Build email content ───────────────────────────
    const htmlBody = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #0B1D35;">
        <div style="background: #0B1D35; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #D4A84B; font-size: 22px; margin: 0;">
            New Enterprise Inquiry — O1DMatch
          </h1>
        </div>
        <div style="background: #F4EFE6; padding: 28px 32px; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4; width: 38%;">
                <strong style="font-size: 13px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Full Name</strong>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4; font-size: 15px;">
                ${full_name}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4;">
                <strong style="font-size: 13px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Company / Firm</strong>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4; font-size: 15px;">
                ${company_name}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4;">
                <strong style="font-size: 13px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Email</strong>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4; font-size: 15px;">
                <a href="mailto:${email}" style="color: #D4A84B;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4;">
                <strong style="font-size: 13px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Phone</strong>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4; font-size: 15px;">
                ${phone || "—"}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4;">
                <strong style="font-size: 13px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">User Type</strong>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4; font-size: 15px;">
                ${USER_TYPE_LABELS[user_type] ?? user_type}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4;">
                <strong style="font-size: 13px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Interests</strong>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4; font-size: 15px;">
                ${interestList}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; vertical-align: top;">
                <strong style="font-size: 13px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Message</strong>
              </td>
              <td style="padding: 10px 0; font-size: 15px; line-height: 1.6;">
                ${message ? message.replace(/\n/g, "<br>") : "—"}
              </td>
            </tr>
          </table>
          <div style="margin-top: 24px; padding: 16px; background: #fff; border-radius: 8px; border-left: 4px solid #D4A84B;">
            <p style="margin: 0; font-size: 13px; color: #64748B;">
              Submitted via the O1DMatch Enterprise page.
              Reply directly to <a href="mailto:${email}" style="color: #D4A84B;">${email}</a> to respond.
            </p>
          </div>
        </div>
      </div>
    `;

    const textBody = `
New Enterprise Inquiry — O1DMatch

Full Name:    ${full_name}
Company/Firm: ${company_name}
Email:        ${email}
Phone:        ${phone || "—"}
User Type:    ${USER_TYPE_LABELS[user_type] ?? user_type}
Interests:    ${interestList}

Message:
${message || "—"}

---
Submitted via the O1DMatch Enterprise page.
    `.trim();

    // ── 4. Send via SendGrid HTTP API (no nodemailer needed) ──
    const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to:       [{ email: notifyEmail }],
            reply_to: { email },
          },
        ],
        from:    { email: fromEmail, name: "O1DMatch Enterprise" },
        subject: `Enterprise Inquiry: ${full_name} (${USER_TYPE_LABELS[user_type] ?? user_type})`,
        content: [
          { type: "text/plain", value: textBody },
          { type: "text/html",  value: htmlBody },
        ],
      }),
    });

    if (!sgRes.ok) {
      const detail = await sgRes.text();
      console.error("[enterprise-inquiry] SendGrid error:", sgRes.status, detail);
      return NextResponse.json(
        { error: "Email delivery failed", detail },
        { status: 500 }
      );
    }

    console.log("[enterprise-inquiry] Email sent successfully via SendGrid API");
    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    console.error("[enterprise-inquiry] ERROR:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Internal server error", detail }, { status: 500 });
  }
}