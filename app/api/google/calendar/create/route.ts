import { createClient } from "@/lib/supabase-server";
import { getGoogleCalendarClient } from "@/lib/google";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("Calendar creation request received");
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.log("No session found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's Google refresh token
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("google_refresh_token, full_name, role")
      .eq("id", session.user.id)
      .single();

    if (userError) {
      console.error("User data fetch error:", userError);
      return new NextResponse("Failed to fetch user data", { status: 500 });
    }

    if (!userData?.google_refresh_token) {
      console.log("No Google token found");
      return new NextResponse("Google Calendar not connected", {
        status: 400,
      });
    }

    try {
      console.log("Creating calendar client");
      const calendar = await getGoogleCalendarClient(
        userData.google_refresh_token
      );

      // Create a new calendar for fitness training
      const calendarName =
        userData.role === "trainer"
          ? `${userData.full_name}'s Training Sessions`
          : "My Training Sessions";

      console.log("Creating new calendar:", calendarName);
      const newCalendar = await calendar.calendars.insert({
        requestBody: {
          summary: calendarName,
          description: "Calendar for fitness training sessions",
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });

      if (!newCalendar.data.id) {
        throw new Error("Failed to create calendar - no ID returned");
      }

      // Update user with new calendar ID
      console.log("Updating user with new calendar ID:", newCalendar.data.id);
      const { error: updateError } = await supabase
        .from("users")
        .update({
          google_calendar_id: newCalendar.data.id,
          google_account_connected: true,
        })
        .eq("id", session.user.id);

      if (updateError) {
        console.error("Failed to update user with calendar ID:", updateError);
        // Try to delete the calendar we just created
        try {
          await calendar.calendars.delete({
            calendarId: newCalendar.data.id,
          });
        } catch (deleteError) {
          console.error(
            "Failed to cleanup calendar after update error:",
            deleteError
          );
        }
        throw updateError;
      }

      console.log("Calendar created successfully");
      return NextResponse.json({
        calendarId: newCalendar.data.id,
        calendarName: calendarName,
      });
    } catch (error) {
      console.error("Calendar creation error:", error);
      return new NextResponse("Failed to create calendar", {
        status: 500,
      });
    }
  } catch (error) {
    console.error("Calendar setup error:", error);
    return new NextResponse(
      `Failed to setup calendar: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
}
