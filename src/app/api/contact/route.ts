// src/app/api/contact/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role client for public form (no auth required)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@o1dmatch.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "O1DMatch <noreply@o1dmatch.com>";

// Simple rate limiting (in-memory, resets on deploy)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // max submissions
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str: string): string {
  return str.trim().replace(/<[^>]*>/g, "");
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, phone, subject, message, user_type } = body;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    if (!email?.trim() || !validateEmail(email.trim())) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }
    if (!subject?.trim()) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }
    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    if (message.trim().length > 5000) {
      return NextResponse.json(
        { error: "Message is too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    // Honeypot check (if a hidden field is filled, it's likely a bot)
    if (body.website) {
      // Silently succeed to not tip off bots
      return NextResponse.json({ success: true });
    }

    const cleanData = {
      name: sanitize(name),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      subject: sanitize(subject),
      message: sanitize(message),
      user_type: user_type || "general",
    };

    // 1. Save to Supabase
    const { error: dbError } = await supabaseAdmin
      .from("contact_submissions")
      .insert(cleanData);

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json(
        { error: "Failed to save your message. Please try again." },
        { status: 500 }
      );
    }

    // 2. Send email notification to admin via Resend
    if (RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [ADMIN_EMAIL],
            subject: `[O1DMatch Contact] ${cleanData.subject}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #2563eb; padding: 24px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 20px;">New Contact Form Submission</h1>
                </div>
                <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 12px; font-weight: 600; color: #475569; width: 120px; vertical-align: top;">Name</td>
                      <td style="padding: 10px 12px; color: #1e293b;">${cleanData.name}</td>
                    </tr>
                    <tr style="background: #fff;">
                      <td style="padding: 10px 12px; font-weight: 600; color: #475569; vertical-align: top;">Email</td>
                      <td style="padding: 10px 12px; color: #1e293b;">
                        <a href="mailto:${cleanData.email}" style="color: #2563eb;">${cleanData.email}</a>
                      </td>
                    </tr>
                    ${
                      cleanData.phone
                        ? `<tr>
                      <td style="padding: 10px 12px; font-weight: 600; color: #475569; vertical-align: top;">Phone</td>
                      <td style="padding: 10px 12px; color: #1e293b;">${cleanData.phone}</td>
                    </tr>`
                        : ""
                    }
                    <tr style="background: #fff;">
                      <td style="padding: 10px 12px; font-weight: 600; color: #475569; vertical-align: top;">Type</td>
                      <td style="padding: 10px 12px; color: #1e293b; text-transform: capitalize;">${cleanData.user_type}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 12px; font-weight: 600; color: #475569; vertical-align: top;">Subject</td>
                      <td style="padding: 10px 12px; color: #1e293b;">${cleanData.subject}</td>
                    </tr>
                  </table>
                  <div style="margin-top: 16px; padding: 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569; font-size: 14px;">Message</p>
                    <p style="margin: 0; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${cleanData.message}</p>
                  </div>
                </div>
                <div style="padding: 16px 24px; background: #f1f5f9; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
                  <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                    This email was sent from the O1DMatch contact form
                  </p>
                </div>
              </div>
            `,
            reply_to: cleanData.email,
          }),
        });
      } catch (emailErr) {
        // Log but don't fail the request — the submission is already saved
        console.error("Email send error:", emailErr);
      }
    } else {
      console.warn(
        "RESEND_API_KEY not set — skipping email notification. Submission saved to database."
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been sent successfully.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Something went wrong";
    console.error("Contact form error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}