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
      "Posing Package": {
        1: 8000, // $80 for 1 pack
        4: 28000, // $280 for 4 pack
        8: 48000, // $480 for 8 pack
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
    let expiryDate = nextMonthStart;

    // Determine pricing based on purchase option
    switch (purchaseOption) {
      case "single_session":
        // Single session: no expiry, just 1 session
        actualSessions = 1;
        amount = baseAmount; // Should always be the single session price
        // Single sessions don't expire, set to far future
        expiryDate = new Date(today.getFullYear() + 10, today.getMonth(), today.getDate());
        break;

      case "current_month":
        // Full package for current month: all sessions
        actualSessions = sessionsIncluded;
        amount = baseAmount;
        break;

      case "next_month":
        // Full package for next month: all sessions
        actualSessions = sessionsIncluded;
        amount = baseAmount;
        // Set expiry to end of next month
        expiryDate = new Date(today.getFullYear(), today.getMonth() + 2, 1);
        break;

      default:
        // Default to current month behavior
        actualSessions = sessionsIncluded;
        amount = baseAmount;
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
        case "Posing Package":
          return `🎯 Includes ${count} specialized posing coaching session${count > 1 ? 's' : ''} — perfect your technique!`;
        default:
          return `🎯 Includes ${count} training sessions — ready to schedule after checkout!`;
      }
    };

    // Get package-specific details
    const getPackageDetails = (
      type: string,
      sessions: number,
      nextMonthDate: Date,
      discount?: { type: string; value: number; discountAmount: number } | null
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
          case "Posing Package":
            return "specialized posing coaching sessions";
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

      // Check if single session or regular package
      if (purchaseOption === "single_session") {
        // Special description for single sessions (no expiry)
        let singleDesc = `🎯 Single ${sessionType.replace(/s$/, '')} — book anytime after purchase!`;
        if (discount) {
          const discountText = discount.type === 'percent'
            ? `${discount.value}% off`
            : `$${(discount.value / 100).toFixed(2)} off`;
          singleDesc += ` • 🎉 ${discountText} applied!`;
        }
        description = singleDesc;
      } else {
        // Standard package description
        let baseDesc = `🎯 Includes ${sessions} ${sessionType} — book after checkout! • ⏳ Expires ${expiryDate}`;
        if (discount) {
          const discountText = discount.type === 'percent'
            ? `${discount.value}% off`
            : `$${(discount.value / 100).toFixed(2)} off`;
          baseDesc += ` • 🎉 ${discountText} applied!`;
        }
        description = baseDesc;
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
        case "Posing Package":
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

    // Validate promo code and calculate discount if provided
    let finalAmount = amount;
    let discountInfo: { type: string; value: number; discountAmount: number } | null = null;

    if (promoCode) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("discount_codes")
        .select("percent_off, amount_off, code, expires_at, max_redemptions")
        .eq("code", promoCode)
        .maybeSingle();

      if (error) {
        console.error("❌ Error validating promo code:", error);
        return NextResponse.json(
          { error: "Error validating promo code" },
          { status: 400 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: "Invalid promo code" },
          { status: 400 }
        );
      }

      // Check if promo code is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return NextResponse.json(
          { error: "Promo code has expired" },
          { status: 400 }
        );
      }

      // Calculate the discount amount
      let discountAmount = 0;
      if (data.percent_off) {
        discountAmount = Math.round(amount * (data.percent_off / 100));
        discountInfo = {
          type: "percent",
          value: data.percent_off,
          discountAmount
        };
      } else if (data.amount_off) {
        discountAmount = Math.min(data.amount_off, amount); // Don't discount more than the total
        discountInfo = {
          type: "amount",
          value: data.amount_off,
          discountAmount
        };
      }

      // Apply the discount to the final amount
      finalAmount = Math.max(0, amount - discountAmount);

      console.log("💰 Promo code applied:", {
        code: promoCode,
        originalAmount: amount,
        discountType: discountInfo?.type,
        discountValue: discountInfo?.value,
        discountAmount,
        finalAmount
      });
    }

    // Get package-specific details with discount information
    const packageDetails = getPackageDetails(
      packageType,
      actualSessions,
      expiryDate,
      discountInfo
    );

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: discountInfo
                ? `Transform with ${actualSessions} ${packageType} Sessions 💪 (${discountInfo.type === 'percent' ? `${discountInfo.value}%` : `$${discountInfo.value / 100}`} off!)`
                : `Transform with ${actualSessions} ${packageType} Sessions 💪`,
              description: packageDetails.description,
            },
            unit_amount: finalAmount, // Use the discounted amount
          },
          quantity: 1, // Total package, not per session
        },
      ],
      mode: "payment",
      success_url: `${origin}/client/checkout?success=true&sessionsIncluded=${actualSessions}&packageType=${encodeURIComponent(packageType)}`,
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
        package_type: packageType,
        expiry_date: expiryDate.toISOString(),
        ...(promoCode ? { promo_code: promoCode } : {}),
        ...(discountInfo ? {
          discount_type: discountInfo.type,
          discount_value: discountInfo.value.toString(),
          discount_amount: discountInfo.discountAmount.toString(),
          original_amount: amount.toString()
        } : {}),
      },
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
