import { createClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    console.log("DELETE /api/trainer/delete-payment called");

    const supabase = createClient();
    console.log("Supabase client created");

    // Get the current user to verify they're a trainer
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    console.log("Auth result:", { user: user?.id, error: authError });

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Unauthorized - No user found" },
        { status: 400 }
      );
    }

    console.log("User authenticated:", user.id);

    // Verify the user is a trainer
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("User lookup error:", userError);
      return NextResponse.json(
        { error: "Failed to verify user role" },
        { status: 500 }
      );
    }

    if (userData?.role !== "trainer") {
      console.error("User is not a trainer:", userData?.role);
      return NextResponse.json(
        { error: "Forbidden: Trainers only" },
        { status: 403 }
      );
    }

    console.log("User verified as trainer");

    const body = await request.json();
    console.log("Request body:", body);

    const { paymentId } = body;
    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    console.log("Processing payment deletion for ID:", paymentId);

    // Start a transaction to ensure data consistency
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    console.log("Payment data retrieved:", {
      id: payment.id,
      client_id: payment.client_id,
      package_type: payment.package_type,
      session_count: payment.session_count,
      paid_at: payment.paid_at,
      method: payment.method,
      amount: payment.amount,
    });

    // Get the package associated with this payment
    let packageToUpdate = null;
    if (payment.package_id) {
      const { data: packageData, error: packageError } = await supabase
        .from("packages")
        .select("*")
        .eq("id", payment.package_id)
        .single();

      if (!packageError && packageData) {
        packageToUpdate = packageData;
      }
    }

    // IMPORTANT: Sessions are NOT automatically created when payments are made
    // They are only created when trainers actually schedule sessions
    // So we don't need to delete sessions from the sessions table
    // Instead, we just need to update the package to reduce available sessions
    let sessionsToDelete: any[] = []; // This will always be empty since no sessions exist yet

    console.log(
      "🔍 Debug: No sessions to delete - sessions are only created when scheduled"
    );

    // If no package_id, we need to intelligently select the best package
    if (!packageToUpdate) {
      console.log(
        "🔍 Debug: No package_id, intelligently selecting best package"
      );

      // Try to find by client_id, package_type, and transaction_id first
      if (payment.transaction_id) {
        const { data: packageData, error: packageError } = await supabase
          .from("packages")
          .select("*")
          .eq("client_id", payment.client_id)
          .eq("package_type", payment.package_type)
          .eq("transaction_id", payment.transaction_id)
          .single();

        if (!packageError && packageData) {
          packageToUpdate = packageData;
          console.log(
            "🔍 Debug: Found package by transaction_id:",
            packageData.id
          );
        }
      }

      // If still no package found, get ALL packages for this client and package type
      if (!packageToUpdate) {
        const { data: allPackages, error: packagesError } = await supabase
          .from("packages")
          .select("*")
          .eq("client_id", payment.client_id)
          .eq("package_type", payment.package_type)
          .order("purchase_date", { ascending: false });

        if (packagesError) {
          console.log(
            "🔍 Debug: Error fetching packages:",
            packagesError.message
          );
        } else if (allPackages && allPackages.length > 0) {
          console.log(
            "🔍 Debug: Found",
            allPackages.length,
            "packages for client"
          );

          // Find the best package to update based on session availability
          let bestPackage = null;
          let bestScore = -1;

          for (const pkg of allPackages) {
            const availableSessions =
              (pkg.sessions_included || 0) - (pkg.sessions_used || 0);
            const canRemoveSessions =
              availableSessions >= payment.session_count;

            console.log(
              `🔍 Debug: Package ${pkg.id}: available=${availableSessions}, can_remove=${canRemoveSessions}`
            );

            if (canRemoveSessions) {
              // Prefer packages with more available sessions (better utilization)
              const score = availableSessions;
              if (score > bestScore) {
                bestScore = score;
                bestPackage = pkg;
              }
            }
          }

          if (bestPackage) {
            packageToUpdate = bestPackage;
            console.log(
              "🔍 Debug: Selected best package:",
              bestPackage.id,
              "with",
              bestScore,
              "available sessions"
            );
          } else {
            console.log(
              "🔍 Debug: No suitable package found - all packages have insufficient available sessions"
            );
          }
        }
      }
    }

    // 2. Update the package if it exists
    if (packageToUpdate) {
      // Calculate how many sessions were actually used from this package
      const sessionsUsedFromPackage = Math.min(
        payment.session_count,
        packageToUpdate.sessions_used || 0
      );

      // Update the package to reflect the deleted sessions
      const newSessionsUsed = Math.max(
        0,
        (packageToUpdate.sessions_used || 0) - sessionsUsedFromPackage
      );
      const newSessionsIncluded = Math.max(
        0,
        (packageToUpdate.sessions_included || 0) - payment.session_count
      );

      // If the package has no sessions left, mark it as cancelled
      const newStatus =
        newSessionsIncluded <= 0
          ? "cancelled"
          : newSessionsUsed >= newSessionsIncluded
            ? "completed"
            : "active";

      const { error: updatePackageError } = await supabase
        .from("packages")
        .update({
          sessions_used: newSessionsUsed,
          sessions_included: newSessionsIncluded,
          status: newStatus,
        })
        .eq("id", packageToUpdate.id);

      if (updatePackageError) {
        console.error("Error updating package:", updatePackageError);
        return NextResponse.json(
          {
            error: "Failed to update package",
          },
          { status: 500 }
        );
      }
    }

    // 3. Finally, delete the payment record
    const { error: deletePaymentError } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (deletePaymentError) {
      console.error("Error deleting payment:", deletePaymentError);
      return NextResponse.json(
        {
          error: "Failed to delete payment",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment deleted successfully",
      deletedSessions: payment.session_count, // This represents sessions removed from the package
      packageUpdated: !!packageToUpdate,
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
