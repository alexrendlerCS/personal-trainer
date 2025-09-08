import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await context.params;

    // First, get the session to find the client_id
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("client_id, trainer_id")
      .eq("id", id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Delete the session
    const { error: deleteError } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete session" },
        { status: 500 }
      );
    }

    // Find the client's active package and decrement sessions_used
    const { data: packages, error: packagesError } = await supabase
      .from("packages")
      .select("*")
      .eq("client_id", session.client_id)
      .eq("status", "active")
      .order("purchase_date", { ascending: false });

    if (!packagesError && packages && packages.length > 0) {
      // Find the package with available sessions to decrement
      const packageToUpdate = packages.find(
        (pkg) => (pkg.sessions_used || 0) > 0
      );

      if (packageToUpdate) {
        const newSessionsUsed = Math.max(
          0,
          (packageToUpdate.sessions_used || 0) - 1
        );

        // Update package status based on new usage
        const newStatus =
          newSessionsUsed >= packageToUpdate.sessions_included
            ? "completed"
            : "active";

        const { error: updateError } = await supabase
          .from("packages")
          .update({
            sessions_used: newSessionsUsed,
            status: newStatus,
          })
          .eq("id", packageToUpdate.id);

        if (updateError) {
          console.error(
            "Error updating package after session deletion:",
            updateError
          );
          // Don't fail the request, just log the error
        }
      }
    }

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await context.params;
    const body = await request.json();
    console.log("[PATCH] Received id:", id);
    console.log("[PATCH] Received body:", body);
    const {
      date,
      start_time,
      end_time,
      type,
      notes,
      status,
      duration_minutes,
    } = body;

    const { data, error } = await supabase
      .from("sessions")
      .update({
        ...(date && { date }),
        ...(start_time && { start_time }),
        ...(end_time && { end_time }),
        ...(type && { type }),
        ...(notes && { notes }),
        ...(status && { status }),
        ...(duration_minutes && { duration_minutes }),
      })
      .eq("id", id)
      .select()
      .single();

    console.log("[PATCH] Update result:", { data, error });

    if (error) {
      return NextResponse.json(
        { error: "Failed to update session", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ session: data });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
