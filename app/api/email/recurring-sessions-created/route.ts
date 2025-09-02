import { NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

interface RecurringSessionEmailPayload {
  trainer_email: string;
  trainer_name: string;
  client_name: string;
  session_type: string;
  recurring_sessions: Array<{
    day_of_week: string;
    time: string;
    weeks: number;
    start_date: string;
  }>;
  total_sessions: number;
  location?: string;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const body: RecurringSessionEmailPayload = await request.json();

    // Validate required fields
    const requiredFields: (keyof RecurringSessionEmailPayload)[] = [
      "trainer_email",
      "trainer_name",
      "client_name",
      "session_type",
      "recurring_sessions",
      "total_sessions",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Format the recurring sessions list
    const sessionsList = body.recurring_sessions
      .map(
        (session) =>
          `• ${session.day_of_week} at ${session.time} for ${session.weeks} week${
            session.weeks !== 1 ? "s" : ""
          } (starting ${session.start_date})`
      )
      .join("<br>");

    // Format the email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">New Recurring Training Sessions Booked</h2>
        
        <p style="font-size: 16px;">Hello ${body.trainer_name},</p>
        
        <p style="font-size: 16px;">A new recurring training session schedule has been booked with you.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;">
            <strong>👤 Client:</strong> ${body.client_name}
          </p>
          <p style="margin: 10px 0;">
            <strong>🏋️ Session Type:</strong> ${body.session_type}
          </p>
          <p style="margin: 10px 0;">
            <strong>📊 Total Sessions:</strong> ${body.total_sessions} sessions
          </p>
          ${
            body.location
              ? `
          <p style="margin: 10px 0;">
            <strong>📍 Location:</strong> ${body.location}
          </p>
          `
              : ""
          }
          ${
            body.notes
              ? `
          <p style="margin: 10px 0;">
            <strong>📝 Notes:</strong> ${body.notes}
          </p>
          `
              : ""
          }
        </div>

        <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0056b3; margin-top: 0;">Recurring Schedule:</h3>
          <div style="line-height: 1.6;">
            ${sessionsList}
          </div>
        </div>
        
        <p style="font-size: 16px;">You can view these sessions and manage your schedule in your <a href="${
          process.env.NEXT_PUBLIC_APP_URL
        }/trainer/schedule" style="color: #007bff;">dashboard</a>.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #666; font-size: 14px;">
          — Fitness Trainer Scheduler Team
        </p>
      </div>
    `;

    // Send email with Resend
    await resend.emails.send({
      from: "Fitness Trainer <no-reply@coachkilday.com>",
      to: [body.trainer_email],
      subject: `New Recurring Training Sessions Booked - ${body.total_sessions} sessions`,
      html: emailHtml,
    });

    return NextResponse.json(
      { message: "Recurring sessions confirmation email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Failed to send recurring sessions confirmation email:",
      error
    );
    return NextResponse.json(
      { error: "Failed to send recurring sessions confirmation email" },
      { status: 500 }
    );
  }
}
