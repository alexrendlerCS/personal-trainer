import { createClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get the current user to verify they're a trainer
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - No user found" },
        { status: 400 }
      );
    }

    // Verify the user is a trainer
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: "Failed to verify user role" },
        { status: 500 }
      );
    }

    if (userData?.role !== "trainer") {
      return NextResponse.json(
        { error: "Forbidden: Trainers only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { paymentId } = body;
    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Get the package associated with this payment
    let packageToUpdate = null;

    // First try to find package by package_id if it exists
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

    // If no package found by ID, try to find by client_id, package_type, and transaction_id
    if (!packageToUpdate && payment.transaction_id) {
      const { data: packageData, error: packageError } = await supabase
        .from("packages")
        .select("*")
        .eq("client_id", payment.client_id)
        .eq("package_type", payment.package_type)
        .eq("transaction_id", payment.transaction_id)
        .single();

      if (!packageError && packageData) {
        packageToUpdate = packageData;
      }
    }

    // If still no package found, try to find by client_id and package_type (most recent)
    if (!packageToUpdate) {
      const { data: packageData, error: packageError } = await supabase
        .from("packages")
        .select("*")
        .eq("client_id", payment.client_id)
        .eq("package_type", payment.package_type)
        .order("purchase_date", { ascending: false })
        .limit(1)
        .single();

      if (!packageError && packageData) {
        packageToUpdate = packageData;
      }
    }



    // Find sessions that were created after this payment for the same client and package type
    // Since session_payments table is not populated, we need to find sessions by date and package type
    let sessionsToDelete: any[] = [];

    if (payment.package_type) {
              // Find sessions for this client with the same package type created after the payment date

      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("id, status, date, start_time, type, created_at")
        .eq("client_id", payment.client_id)
        .gte("created_at", payment.paid_at)
        .order("created_at", { ascending: true });

      if (sessionsError) {
        console.error("Error fetching sessions:", sessionsError);
        return NextResponse.json(
          {
            error: "Failed to fetch associated sessions",
          },
          { status: 500 }
        );
      }



      // Filter sessions by package type and limit to session_count
      const packageTypeMapping: { [key: string]: string } = {
        "In-Person Training": "In-Person Training",
        "Virtual Training": "Virtual Training",
        "Partner Training": "Partner Training",
      };



      const relevantSessions = sessions.filter((s) => 
        packageTypeMapping[s.type] === payment.package_type
      );

      // Take only the first session_count sessions (the ones that were "paid for")
      sessionsToDelete = relevantSessions.slice(0, payment.session_count);



      // If no sessions found by date, try to find sessions by package type regardless of date
      if (sessionsToDelete.length === 0) {
        const { data: fallbackSessions, error: fallbackError } = await supabase
          .from("sessions")
          .select("id, status, date, start_time, type, created_at")
          .eq("client_id", payment.client_id)
          .eq("type", payment.package_type)
          .order("created_at", { ascending: true });

        if (!fallbackError && fallbackSessions) {
          sessionsToDelete = fallbackSessions.slice(0, payment.session_count);
        }
      }

      // Check if any sessions are already completed or in progress
      const completedOrInProgressSessions = sessionsToDelete.filter(
        (s) => s.status === "completed" || s.status === "in_progress"
      );

      if (completedOrInProgressSessions.length > 0) {
        const sessionDetails = completedOrInProgressSessions
          .map((s) => `${s.date} at ${s.start_time} (${s.status})`)
          .join(", ");

        return NextResponse.json(
          {
            error: `Cannot delete payment: ${completedOrInProgressSessions.length} session(s) are already completed or in progress: ${sessionDetails}`,
          },
          { status: 400 }
        );
      }

      // Delete the sessions that were paid for by this payment
      if (sessionsToDelete.length > 0) {
        const sessionIds = sessionsToDelete.map((s) => s.id);

        const { error: deleteSessionsError } = await supabase
          .from("sessions")
          .delete()
          .in("id", sessionIds);

        if (deleteSessionsError) {
          console.error("Error deleting sessions:", deleteSessionsError);
          return NextResponse.json(
            {
              error: "Failed to delete associated sessions",
            },
            { status: 500 }
          );
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
      deletedSessions: sessionsToDelete.length,
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
