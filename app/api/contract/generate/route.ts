import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

interface ContractPayload {
  clientName: string;
  email: string;
  phone: string;
  startDate: string;
  location: string;
  signature: string; // base64 PNG string
  signatureDate: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields: (keyof ContractPayload)[] = [
      "clientName",
      "email",
      "phone",
      "startDate",
      "location",
      "signature",
      "signatureDate",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([612, 792]); // Standard US Letter size
    const { width, height } = page.getSize();

    // Get fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 10;
    const titleSize = 16;
    const headingSize = 12;
    const lineHeight = fontSize * 1.5;
    const margin = 50;

    let currentY = height - margin;

    // Helper function to add text with proper line breaks
    const addText = (
      text: string,
      { font = helvetica, size = fontSize, indent = 0 } = {}
    ) => {
      const words = text.split(" ");
      let line = "";
      const maxWidth = width - (margin * 2 + indent);

      for (const word of words) {
        const testLine = line + (line ? " " : "") + word;
        const testWidth = font.widthOfTextAtSize(testLine, size);

        if (testWidth > maxWidth) {
          page.drawText(line, {
            x: margin + indent,
            y: currentY,
            size,
            font,
          });
          currentY -= lineHeight;
          line = word;
        } else {
          line = testLine;
        }
      }

      if (line) {
        page.drawText(line, {
          x: margin + indent,
          y: currentY,
          size,
          font,
        });
        currentY -= lineHeight;
      }
    };

    // Add header
    page.drawText("COACH KILDAY LLC | PERSONAL TRAINING AGREEMENT", {
      x: margin,
      y: currentY,
      size: titleSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    currentY -= lineHeight * 2;

    // Add client information
    page.drawText("Business:", {
      x: margin,
      y: currentY,
      size: fontSize,
      font: helveticaBold,
    });
    currentY -= lineHeight;

    page.drawText("Coach Kilday LLC", {
      x: margin,
      y: currentY,
      size: fontSize,
      font: helvetica,
    });
    currentY -= lineHeight * 2;

    // Client details grid
    const details = [
      [`Client Name: ${body.clientName}`, `Email: ${body.email}`],
      [`Phone: ${body.phone}`, `Start Date: ${body.startDate}`],
      [`Training Location: ${body.location}`, ""],
    ];

    details.forEach((row) => {
      row.forEach((text, index) => {
        page.drawText(text, {
          x: margin + (index * (width - margin * 2)) / 2,
          y: currentY,
          size: fontSize,
          font: helvetica,
        });
      });
      currentY -= lineHeight;
    });
    currentY -= lineHeight;

    // Section 1: LIABILITY WAIVER
    page.drawText("1. LIABILITY WAIVER AND ASSUMPTION OF RISK", {
      x: margin,
      y: currentY,
      size: headingSize,
      font: helveticaBold,
    });
    currentY -= lineHeight;

    addText(
      "By signing this agreement, I, the undersigned client, voluntarily agree to participate in physical training sessions provided by Coach Kilday LLC and acknowledge and accept the following:"
    );
    currentY -= lineHeight;

    const liabilityPoints = [
      "I affirm that I am physically able to participate in a fitness program and either have obtained medical clearance or take full responsibility for participating without it.",
      "I understand that physical exercise carries inherent risks, including but not limited to musculoskeletal injuries, cardiovascular events, other health complications and death.",
      "I hereby RELEASE, WAIVE, AND DISCHARGE Coach Kilday LLC, its owners, employees, agents, and independent contractors from ANY AND ALL LIABILITY, CLAIMS, OR DEMANDS arising from participation in training or use of facilities, INCLUDING THOSE CAUSED BY ORDINARY NEGLIGENCE.",
      "I agree to INDEMNIFY, DEFEND, AND HOLD HARMLESS Coach Kilday LLC and all affiliated parties from any claims or demands resulting from my participation or conduct.",
      "In the case of a medical emergency, I authorize Coach Kilday LLC to seek medical treatment on my behalf, understanding that I am responsible for any related expenses.",
      "I acknowledge that any nutrition or supplement advice provided is for informational purposes only and does not constitute medical advice. I release Coach Kilday LLC from any liability related to adverse effects resulting from nutrition or supplementation.",
    ];

    liabilityPoints.forEach((point) => {
      page.drawText("•", {
        x: margin,
        y: currentY,
        size: fontSize,
        font: helvetica,
      });
      addText(point, { indent: 15 });
      currentY -= lineHeight / 2;
    });
    currentY -= lineHeight;

    // Add a new page if needed
    if (currentY < margin * 2) {
      page = pdfDoc.addPage([612, 792]);
      currentY = height - margin;
    }

    // Section 2: MEDIA RELEASE
    page.drawText("2. MEDIA RELEASE", {
      x: margin,
      y: currentY,
      size: headingSize,
      font: helveticaBold,
    });
    currentY -= lineHeight;

    addText(
      "I grant Coach Kilday LLC the right to use any photographs, videos, or testimonials of me for marketing, social media, or business promotion purposes unless I provide written notice requesting otherwise."
    );
    currentY -= lineHeight;

    // Section 3: SESSION USAGE POLICY
    page.drawText("3. SESSION USAGE POLICY", {
      x: margin,
      y: currentY,
      size: headingSize,
      font: helveticaBold,
    });
    currentY -= lineHeight;

    const usagePoints = [
      "Training sessions are sold in monthly packages or subscriptions based on billing cycles (e.g., June 5 – July 4).",
      "Clients are responsible for scheduling their own sessions. Coach Kilday LLC is not responsible for unused or unscheduled sessions.",
      "Any unused sessions must be used within two weeks after the end of the billing cycle. After this grace period, all unused sessions expire and are forfeited. No refunds or rollovers will be granted.",
    ];

    usagePoints.forEach((point) => {
      page.drawText("•", {
        x: margin,
        y: currentY,
        size: fontSize,
        font: helvetica,
      });
      addText(point, { indent: 15 });
      currentY -= lineHeight / 2;
    });
    currentY -= lineHeight;

    // Add a new page if needed
    if (currentY < margin * 4) {
      page = pdfDoc.addPage([612, 792]);
      currentY = height - margin;
    }

    // Section 4: SUBSCRIPTION & CANCELLATION POLICY
    page.drawText("4. SUBSCRIPTION & CANCELLATION POLICY", {
      x: margin,
      y: currentY,
      size: headingSize,
      font: helveticaBold,
    });
    currentY -= lineHeight;

    const cancellationPoints = [
      "Subscriptions are billed automatically on a recurring monthly basis using the original sign-up date.",
      "Clients must submit cancellation requests via email to haley@coachkilday.com at least 30 days prior to their next billing date.",
      "Cancellations made within 30 days of the next billing date will result in one final charge, with services continuing through the end of that final paid cycle.",
      "This policy is non-negotiable and applies immediately upon enrollment.",
    ];

    cancellationPoints.forEach((point) => {
      page.drawText("•", {
        x: margin,
        y: currentY,
        size: fontSize,
        font: helvetica,
      });
      addText(point, { indent: 15 });
      currentY -= lineHeight / 2;
    });
    currentY -= lineHeight;

    // Section 5: MISSED SESSIONS, LATENESS & REFUNDS
    page.drawText("5. MISSED SESSIONS, LATENESS & REFUNDS", {
      x: margin,
      y: currentY,
      size: headingSize,
      font: helveticaBold,
    });
    currentY -= lineHeight;

    const missedSessionsPoints = [
      "Clients arriving more than 15 minutes late may forfeit their session at the trainer's discretion.",
      "Sessions canceled with less than 24 hours' notice may be forfeited. Make-up sessions must be completed within the same calendar week of the original booking and are not guaranteed.",
      "All personal training sales are final. No refunds will be given for unused sessions, dissatisfaction, or early termination of the training agreement.",
    ];

    missedSessionsPoints.forEach((point) => {
      page.drawText("•", {
        x: margin,
        y: currentY,
        size: fontSize,
        font: helvetica,
      });
      addText(point, { indent: 15 });
      currentY -= lineHeight / 2;
    });
    currentY -= lineHeight;

    // Add a new page if needed
    if (currentY < margin * 4) {
      page = pdfDoc.addPage([612, 792]);
      currentY = height - margin;
    }

    // Section 6: DISPUTE RESOLUTION & GOVERNING LAW
    page.drawText("6. DISPUTE RESOLUTION & GOVERNING LAW", {
      x: margin,
      y: currentY,
      size: headingSize,
      font: helveticaBold,
    });
    currentY -= lineHeight;

    const disputePoints = [
      "This agreement is governed by the laws of the State of Colorado.",
      "Any disputes arising under this agreement will be subject to the jurisdiction of the courts in Denver County, Colorado.",
      "Both parties agree to attempt mediation or binding arbitration before pursuing legal action.",
    ];

    disputePoints.forEach((point) => {
      page.drawText("•", {
        x: margin,
        y: currentY,
        size: fontSize,
        font: helvetica,
      });
      addText(point, { indent: 15 });
      currentY -= lineHeight / 2;
    });
    currentY -= lineHeight;

    // Section 7: ELECTRONIC SIGNATURE CONSENT
    page.drawText("7. ELECTRONIC SIGNATURE CONSENT", {
      x: margin,
      y: currentY,
      size: headingSize,
      font: helveticaBold,
    });
    currentY -= lineHeight;

    addText(
      "By signing this agreement, I agree that my electronic signature (including typed name or digital signature) is valid and enforceable under applicable federal and state law and carries the same legal effect as a handwritten signature."
    );
    currentY -= lineHeight;

    // Section 8: AGREEMENT ACKNOWLEDGMENT
    page.drawText("8. AGREEMENT ACKNOWLEDGMENT", {
      x: margin,
      y: currentY,
      size: headingSize,
      font: helveticaBold,
    });
    currentY -= lineHeight;

    addText(
      "By signing below, I acknowledge that I have read, understand, and agree to all terms in this Personal Training Agreement. I certify that I am entering into this agreement voluntarily and without duress."
    );
    currentY -= lineHeight * 2;

    // Add signature
    page.drawText("Client Signature:", {
      x: margin,
      y: currentY,
      size: fontSize,
      font: helveticaBold,
    });
    currentY -= lineHeight;

    // Remove the 'data:image/png;base64,' prefix if present
    const signatureData = body.signature.replace(
      /^data:image\/\w+;base64,/,
      ""
    );
    const signatureImageBytes = Buffer.from(signatureData, "base64");
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
    const signatureDims = signatureImage.scale(0.3);

    page.drawImage(signatureImage, {
      x: margin,
      y: currentY - signatureDims.height,
      width: signatureDims.width,
      height: signatureDims.height,
    });
    currentY -= signatureDims.height + lineHeight;

    page.drawText(`Date: ${body.signatureDate}`, {
      x: margin,
      y: currentY,
      size: fontSize,
      font: helvetica,
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const base64PDF = Buffer.from(pdfBytes).toString("base64");

    // Send email with Resend
    await resend.emails.send({
      from: "Coach Kilday <no-reply@coachkilday.com>",
      to: [body.email],
      subject: "Your Signed Personal Training Agreement",
      html: `<p>Hi ${body.clientName},</p><p>Attached is your signed agreement. Thank you for choosing Coach Kilday!</p>`,
      attachments: [
        {
          filename: "Signed_Training_Agreement.pdf",
          content: base64PDF,
        },
      ],
    });

    return NextResponse.json(
      { message: "Contract generated and sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contract generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate or send contract" },
      { status: 500 }
    );
  }
}
