import { createClient } from "@/lib/supabase-server";
import { getGoogleCalendarClient } from "@/lib/google";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("Calendar event creation request received");
    const supabase = createClient();

    // Use getUser() instead of getSession() for better security
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("No authenticated user found:", authError?.message);
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const trainerId = searchParams.get("trainerId");
    const eventDetails = await request.json();

    console.log("Processing request:", {
      trainerId,
      eventDetails,
      userId: user.id,
    });

    // If trainerId is provided, we're creating an event in the trainer's calendar
    if (trainerId) {
      console.log("Fetching trainer data for ID:", trainerId);
      const { data: trainerData, error: trainerError } = await supabase
        .from("users")
        .select("google_refresh_token, google_calendar_id, email")
        .eq("id", trainerId)
        .single();

      if (trainerError) {
        console.error("Trainer data fetch error:", {
          error: trainerError,
          trainerId,
        });
        return NextResponse.json(
          { 
            error: "database_error",
            message: "Failed to fetch trainer data from database",
            details: trainerError.message 
          },
          { status: 500 }
        );
      }

      console.log("Trainer data retrieved:", {
        hasRefreshToken: !!trainerData?.google_refresh_token,
        hasCalendarId: !!trainerData?.google_calendar_id,
        trainerEmail: trainerData?.email,
      });

      if (
        !trainerData?.google_refresh_token ||
        !trainerData?.google_calendar_id
      ) {
        console.log("Missing trainer Google calendar data:", {
          trainerId,
          hasRefreshToken: !!trainerData?.google_refresh_token,
          hasCalendarId: !!trainerData?.google_calendar_id,
        });
        return NextResponse.json(
          { 
            error: "calendar_not_connected",
            message: "Trainer Google Calendar not connected. Please connect your Google Calendar in settings.",
            details: {
              hasRefreshToken: !!trainerData?.google_refresh_token,
              hasCalendarId: !!trainerData?.google_calendar_id,
            }
          },
          { status: 400 }
        );
      }

      console.log("Creating trainer calendar client with refresh token");
      const calendar = await getGoogleCalendarClient(
        trainerData.google_refresh_token
      );

      console.log("Creating event in trainer calendar");
      try {
        const event = await calendar.events.insert({
          calendarId: trainerData.google_calendar_id,
          requestBody: eventDetails,
        });
        console.log("Trainer calendar event created:", event.data.id);
        return NextResponse.json({ eventId: event.data.id });
      } catch (error: unknown) {
        console.error("Google Calendar API Error:", {
          error,
          details: (error as any)?.response?.data,
          calendarId: trainerData.google_calendar_id,
          eventDetails,
        });
        
        // Parse Google API errors for better user messages
        const errorData = (error as any)?.response?.data;
        const errorMessage = (error as any)?.message || String(error);
        
        if (errorMessage.includes('invalid_grant') || errorMessage.includes('invalid_token')) {
          return NextResponse.json(
            { 
              error: "calendar_auth_expired",
              message: "Google Calendar authentication has expired. Please reconnect your calendar.",
              details: errorMessage
            },
            { status: 401 }
          );
        } else if (errorData?.error?.message?.includes('rate limit')) {
          return NextResponse.json(
            { 
              error: "rate_limit",
              message: "Too many calendar requests. Please wait a moment and try again.",
              details: errorMessage
            },
            { status: 429 }
          );
        } else {
          return NextResponse.json(
            { 
              error: "calendar_api_error",
              message: "Failed to create calendar event in Google Calendar",
              details: errorMessage
            },
            { status: 500 }
          );
        }
      }
    }

    // Otherwise, create event in client's calendar
    console.log("Fetching client data");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("google_refresh_token, google_calendar_id")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("User data fetch error:", userError);
      return NextResponse.json(
        { 
          error: "database_error",
          message: "Failed to fetch user data from database",
          details: userError.message 
        },
        { status: 500 }
      );
    }

    if (!userData?.google_refresh_token || !userData?.google_calendar_id) {
      console.log("No client Google calendar found");
      return NextResponse.json(
        { 
          error: "calendar_not_connected",
          message: "Your Google Calendar is not connected. Please connect your calendar in settings.",
          details: {
            hasRefreshToken: !!userData?.google_refresh_token,
            hasCalendarId: !!userData?.google_calendar_id,
          }
        },
        { status: 400 }
      );
    }

    console.log("Creating client calendar client");
    const calendar = await getGoogleCalendarClient(
      userData.google_refresh_token
    );

    console.log("Creating event in client calendar");
    try {
      const event = await calendar.events.insert({
        calendarId: userData.google_calendar_id,
        requestBody: eventDetails,
      });
      console.log("Client calendar event created:", event.data.id);
      return NextResponse.json({ eventId: event.data.id });
    } catch (error: unknown) {
      console.error("Google Calendar API Error:", {
        error,
        details: (error as any)?.response?.data,
        calendarId: userData.google_calendar_id,
        eventDetails,
      });
      
      const errorMessage = (error as any)?.message || String(error);
      
      if (errorMessage.includes('invalid_grant') || errorMessage.includes('invalid_token')) {
        return NextResponse.json(
          { 
            error: "calendar_auth_expired",
            message: "Google Calendar authentication has expired. Please reconnect your calendar.",
            details: errorMessage
          },
          { status: 401 }
        );
      } else {
        return NextResponse.json(
          { 
            error: "calendar_api_error",
            message: "Failed to create calendar event",
            details: errorMessage
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Calendar event creation error:", error);
    return NextResponse.json(
      {
        error: "server_error",
        message: "Failed to create calendar event",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
