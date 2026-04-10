// app/api/public/contact/route.ts
// Public contact form submission with spam protection and email notification

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import ContactMessage from '@/models/ContactMessage';
import SiteSettings from '@/models/SiteSettings';

// Simple in-memory rate limiter for contact form (per IP, 3 submissions per hour)
const contactAttempts = new Map<string, { count: number; resetAt: Date }>();

function checkContactRateLimit(ip: string): boolean {
  const now = new Date();
  const entry = contactAttempts.get(ip);

  if (!entry || entry.resetAt < now) {
    contactAttempts.set(ip, { count: 1, resetAt: new Date(now.getTime() + 60 * 60 * 1000) });
    return true; // allowed
  }

  if (entry.count >= 3) return false; // blocked
  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

    // Rate limit: 3 submissions per hour per IP
    if (!checkContactRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many messages. Please wait before sending another.' },
        { status: 429 }
      );
    }

    let body: {
      name?: string; email?: string; subject?: string;
      message?: string; category?: string; honeypot?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }

    // Honeypot spam check — bots fill hidden fields, humans don't
    if (body.honeypot) {
      // Silently accept but don't save (fool the bot)
      return NextResponse.json({ success: true, message: 'Message sent!' });
    }

    const { name, email, subject, message, category = 'other' } = body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'All fields (name, email, subject, message) are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
    }

    // Length validation
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json({ success: false, error: 'Input too long' }, { status: 400 });
    }

    // Save to database
    const savedMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      category,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Send email notification (fire-and-forget — don't block response)
    const settings = await SiteSettings.findOne().select('contactEmail autoReplyEnabled smtpHost');
    if (settings?.smtpHost) {
      sendEmailNotification(savedMessage, settings.contactEmail).catch(
        (err) => console.error('[Contact] Email notification failed:', err)
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! I'll get back to you soon. 🚀",
    });

  } catch (error) {
    console.error('[Contact/POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}

// ── Email notification (nodemailer) ─────────────────────────
async function sendEmailNotification(
  msg: { name: string; email: string; subject: string; message: string; category: string },
  toEmail: string
): Promise<void> {
  try {
    const nodemailer = (await import('nodemailer')).default;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `[Portfolio] New Message: ${msg.subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #00D4FF;">New Contact Form Submission</h2>
          <table style="width:100%; border-collapse: collapse;">
            <tr><td style="padding:8px; font-weight:bold;">From:</td><td>${msg.name} (${msg.email})</td></tr>
            <tr><td style="padding:8px; font-weight:bold;">Subject:</td><td>${msg.subject}</td></tr>
            <tr><td style="padding:8px; font-weight:bold;">Category:</td><td>${msg.category}</td></tr>
          </table>
          <div style="margin-top:16px; padding:16px; background:#f5f5f5; border-radius:8px;">
            <p style="white-space:pre-wrap;">${msg.message}</p>
          </div>
          <p style="color:#888; font-size:12px; margin-top:16px;">
            View and reply in your <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/messages">admin panel</a>.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Email] Failed to send:', err);
  }
}
