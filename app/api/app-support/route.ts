import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const SUPPORT_EMAIL = "support@coachkilday.com";
const MAX_FILE_BYTES = 4 * 1024 * 1024; // stay under Vercel's 4.5MB body limit
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
];

const REASONS: Record<string, string> = {
  help: "I need help",
  bug: "Report a bug",
  feedback: "Share feedback or suggest a feature",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const reason = String(formData.get("reason") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const screenshot = formData.get("screenshot");

    if (!name || !email || !reason || !message) {
      return NextResponse.json(
        { error: "Please fill out all required fields." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const reasonLabel = REASONS[reason];
    if (!reasonLabel) {
      return NextResponse.json(
        { error: "Please choose what brings you here." },
        { status: 400 }
      );
    }

    if (name.length > 200 || email.length > 320 || message.length > 5000) {
      return NextResponse.json(
        { error: "One of the fields is too long." },
        { status: 400 }
      );
    }

    const attachments: { filename: string; content: Buffer }[] = [];
    if (screenshot instanceof File && screenshot.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(screenshot.type)) {
        return NextResponse.json(
          { error: "Screenshots must be an image (PNG, JPG, GIF, WEBP, or HEIC)." },
          { status: 400 }
        );
      }
      if (screenshot.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: "Screenshot must be smaller than 4MB." },
          { status: 400 }
        );
      }
      attachments.push({
        filename: screenshot.name || "screenshot",
        content: Buffer.from(await screenshot.arrayBuffer()),
      });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 }
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">App ${escapeHtml(reasonLabel)}</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p style="margin: 8px 0;"><strong>Reason:</strong> ${escapeHtml(reasonLabel)}</p>
          <p style="margin: 8px 0;"><strong>Screenshot:</strong> ${
            attachments.length ? "Attached" : "None"
          }</p>
        </div>
        <h3 style="color: #333;">Message</h3>
        <p style="font-size: 15px; white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: "Coach Kilday App <no-reply@coachkilday.com>",
      to: [SUPPORT_EMAIL],
      replyTo: email,
      subject: `[App ${reasonLabel}] ${name}`,
      html,
      attachments: attachments.length ? attachments : undefined,
    });

    if (error) {
      console.error("Resend error sending app support email:", error);
      return NextResponse.json(
        { error: "We couldn't send your message. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("App support form error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
