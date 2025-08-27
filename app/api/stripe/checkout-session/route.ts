import { createClient } from "@/lib/supabase-server";
import Stripe from "stripe";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { userId, packageType, sessionsIncluded, promoCode, purchaseOption } =
      await req.json();

    console.log("🛒 Creating Stripe checkout session:", {
      userId,
      packageType,
      sessionsIncluded,
      purchaseOption,
    });

    // Define valid pricing structure (cents)
    const pricingMatrix: Record<string, Record<number, number>> = {
      "In-Person Training": {
        1: 15000, // $150 for single session
        4: 52000, // $520 for 1x/week (new)
        8: 100000, // $1,000
        12: 138000, // $1,380
        16: 176000, // $1,760
        20: 200000, // $2,000
      },
      "Virtual Training": {
        1: 15000, // $150 for single session
        4: 48000, // $480 for 1x/week (new)
        8: 92000, // $920
        12: 126000, // $1,260
        16: 160000, // $1,600
        20: 180000, // $1,800
      },
      "Partner Training": {
        1: 15000, // $150 for single session
        4: 40000, // $400 for 1x/week (new)
        8: 68000, // $680
        12: 96000, // $960
        16: 120000, // $1,200
        20: 140000, // $1,400
      },
    };

    let baseAmount = pricingMatrix?.[packageType]?.[sessionsIncluded];

    if (!baseAmount) {
      console.error("❌ Invalid pricing configuration", {
        packageType,
        sessionsIncluded,
      });
      return NextResponse.json(
        { error: "Invalid package configuration" },
        { status: 400 }
      );
    }

    // Calculate pricing based on purchase option
    const today = new Date();
    const nextMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      1
    );
    const msInWeek = 1000 * 60 * 60 * 24 * 7;
    const weeksRemaining = Math.max(
      Math.floor((nextMonthStart.getTime() - today.getTime()) / msInWeek),
      1
    );

    let actualSessions = sessionsIncluded;
    let amount = baseAmount;
    let isProrated = false;
    let expiryDate = nextMonthStart;

    // Determine pricing based on purchase option
    switch (purchaseOption) {
      case "prorated":
        // Prorated package: only sessions for remaining weeks
        const sessionsPerWeek = sessionsIncluded / 4;
        actualSessions = Math.round(weeksRemaining * sessionsPerWeek);
        const ratePerSession = baseAmount / sessionsIncluded;
        amount = Math.round(ratePerSession * actualSessions);
        isProrated = true;
        break;

      case "current_month":
        // Full package for current month: all sessions (not prorated)
        actualSessions = sessionsIncluded;
        amount = baseAmount;
        isProrated = false;
        break;

      case "next_month":
        // Full package for next month: all sessions
        actualSessions = sessionsIncluded;
        amount = baseAmount;
        isProrated = false;
        // Set expiry to end of next month
        expiryDate = new Date(today.getFullYear(), today.getMonth() + 2, 1);
        break;

      default:
        // Fallback to original prorated logic for backward compatibility
        const fallbackSessionsPerWeek = sessionsIncluded / 4;
        actualSessions = Math.round(weeksRemaining * fallbackSessionsPerWeek);
        const fallbackRatePerSession = baseAmount / sessionsIncluded;
        amount = Math.round(fallbackRatePerSession * actualSessions);
        isProrated = true;
        break;
    }

    // Log pricing details
    console.log("💰 Pricing Calculation:", {
      purchaseOption,
      today: today.toISOString(),
      nextMonthStart: nextMonthStart.toISOString(),
      weeksRemaining,
      originalSessions: sessionsIncluded,
      actualSessions,
      originalAmount: baseAmount,
      finalAmount: amount,
      isProrated,
      expiryDate: expiryDate.toISOString(),
    });

    const origin =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.NEXT_PUBLIC_SITE_URL || "https://your-production-url.com";

    // Helper function for package description line
    const getShortPackageLine = (type: string, count: number) => {
      switch (type) {
        case "In-Person Training":
          return `🎯 Includes ${count} personalized in-person training sessions with your coach — book anytime after purchase!`;
        case "Virtual Training":
          return `🎯 Includes ${count} virtual live training sessions via video call — book anytime after purchase!`;
        case "Partner Training":
          return `🎯 Includes ${count} small group sessions — train with a partner and save!`;
        default:
          return `🎯 Includes ${count} training sessions — ready to schedule after checkout!`;
      }
    };

    // Get package-specific details
    const getPackageDetails = (
      type: string,
      sessions: number,
      nextMonthDate: Date
    ) => {
      const baseImageUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
      const expiryDate = nextMonthDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      // Get package-specific session description
      const getSessionType = (packageType: string) => {
        switch (packageType) {
          case "In-Person Training":
            return "personalized in-person training sessions";
          case "Virtual Training":
            return "live virtual training sessions";
          case "Partner Training":
            return "partner training sessions";
          default:
            return "training sessions";
        }
      };

      // Format currency for descriptions
      const formatPrice = (cents: number) =>
        `$${(cents / 100).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

      const sessionType = getSessionType(type);
      let description: string;

      // Check if package is prorated
      if (sessions === sessionsIncluded) {
        // Simple version for non-prorated packages
        description = `🎯 Includes ${sessions} ${sessionType} — book after checkout! • ⏳ Expires ${expiryDate}`;
      } else {
        // Detailed version for prorated packages
        const discountAmount = baseAmount - amount;
        description = [
          `🔥 Prorated Package: ${sessions} of ${sessionsIncluded} ${type} Sessions`,
          `💸 Original: ${formatPrice(baseAmount)} |  Discount: ${formatPrice(
            discountAmount
          )} | Final: ${formatPrice(amount)}`,
          `📆 You're joining mid-month — cost adjusted for ${weeksRemaining} week(s)`,
          `🎯 ${sessions} ${sessionType}`,
          `⏳ Book after checkout • Expires ${expiryDate}`,
        ].join(" • ");
      }

      // Return package details with appropriate image and description
      switch (type) {
        case "In-Person Training":
          return {
            image: `${baseImageUrl}/placeholder.jpg`,
            description,
          };
        case "Virtual Training":
          return {
            image: `${baseImageUrl}/placeholder-virtual.jpg`,
            description,
          };
        case "Partner Training":
          return {
            image: `${baseImageUrl}/placeholder.jpg`,
            description,
          };
        default:
          return {
            image: `${baseImageUrl}/placeholder.jpg`,
            description,
          };
      }
    };

    const packageDetails = getPackageDetails(
      packageType,
      actualSessions,
      expiryDate
    );

    // Validate promo code if provided
    let promotionCodeId: string | undefined = undefined;
    if (promoCode) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("discount_codes")
        .select("stripe_promotion_code_id, code, expires_at, max_redemptions")
        .eq("code", promoCode)
        .maybeSingle();
      if (error) {
        return NextResponse.json(
          { error: "Error validating promo code" },
          { status: 400 }
        );
      }
      if (!data || !data.stripe_promotion_code_id) {
        return NextResponse.json(
          { error: "Invalid promo code" },
          { status: 400 }
        );
      }
      // Optionally: check expiry and redemptions here if needed
      promotionCodeId = data.stripe_promotion_code_id;
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name:
                actualSessions === sessionsIncluded
                  ? `Transform with ${actualSessions} ${packageType} Sessions 💪`
                  : `Prorated Package: ${actualSessions} of ${sessionsIncluded} ${packageType} Sessions 💪`,
              description: packageDetails.description,
            },
            unit_amount: amount,
          },
          quantity: 1, // Total package, not per session
        },
      ],
      mode: "payment",
      success_url: `${origin}/client/packages?success=true`,
      cancel_url: `${origin}/client/packages?canceled=true`,
      custom_text: {
        submit: {
          message: "Can't wait to start your fitness journey! 🎉",
        },
      },

      metadata: {
        user_id: userId,
        sessions_included: actualSessions.toString(), // actual # of sessions this user is buying
        original_sessions: sessionsIncluded.toString(), // original full package size
        is_prorated: isProrated ? "true" : "false",
        package_type: packageType,
        expiry_date: expiryDate.toISOString(),
        ...(promoCode ? { promo_code: promoCode } : {}),
      },
      ...(promotionCodeId
        ? { discounts: [{ promotion_code: promotionCodeId }] }
        : {}),
    });

    console.log("✅ Checkout session created:", {
      sessionId: session.id,
      amount,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("🔥 Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
