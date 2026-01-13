import { createClient } from "@/lib/supabase-server";
import { getGoogleCalendarClient } from "@/lib/google";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("Client calendar event creation request received");
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
    const clientId = searchParams.get("clientId");
    const eventDetails = await request.json();

    console.log("Processing client calendar request:", {
      clientId,
      eventDetails,
      userId: user.id,
    });

    if (!clientId) {
      console.log("No clientId provided");
      return new NextResponse("Client ID is required", { status: 400 });
    }

    // Fetch client's Google calendar data
    console.log("Fetching client data for ID:", clientId);
    const { data: clientData, error: clientError } = await supabase
      .from("users")
      .select("google_refresh_token, google_calendar_id, email")
      .eq("id", clientId)
      .single();

    if (clientError) {
      console.error("Client data fetch error:", {
        error: clientError,
        clientId,
      });
      return new NextResponse("Failed to fetch client data", {
        status: 500,
      });
    }

    console.log("Client data retrieved:", {
      hasRefreshToken: !!clientData?.google_refresh_token,
      hasCalendarId: !!clientData?.google_calendar_id,
      clientEmail: clientData?.email,
    });

    if (!clientData?.google_refresh_token || !clientData?.google_calendar_id) {
      console.log("Missing client Google calendar data:", {
        clientId,
        hasRefreshToken: !!clientData?.google_refresh_token,
        hasCalendarId: !!clientData?.google_calendar_id,
      });
      return new NextResponse("Client Google Calendar not connected", {
        status: 400,
      });
    }

    console.log("Creating client calendar client with refresh token");
    try {
      const calendar = await getGoogleCalendarClient(
        clientData.google_refresh_token
      );

      console.log("Creating event in client calendar");
      try {
        const event = await calendar.events.insert({
          calendarId: clientData.google_calendar_id,
          requestBody: eventDetails,
        });
        console.log("Client calendar event created:", event.data.id);
        return NextResponse.json({ eventId: event.data.id });
      } catch (calendarError: unknown) {
        console.error("Google Calendar API Error:", {
          error: calendarError,
          details: (calendarError as any)?.response?.data,
          calendarId: clientData.google_calendar_id,
          eventDetails,
        });
        throw calendarError;
      }
    } catch (authError) {
      // Handle authentication errors gracefully
      console.warn("Client Google Calendar authentication failed:", authError);
      
      // Check if it's an authentication/token error
      const errorMessage = authError instanceof Error ? authError.message : String(authError);
      if (errorMessage.includes('invalid_grant') || 
          errorMessage.includes('invalid_token') || 
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('authentication')) {
        
        console.log("Returning success despite calendar auth failure to allow session booking to continue");
        return NextResponse.json({ 
          eventId: null, 
          error: 'calendar_auth_failed',
          message: 'Session created but client calendar sync failed - client needs to reconnect Google Calendar' 
        });
      }
      
      // Re-throw non-auth errors
      throw authError;
    }
  } catch (error) {
    console.error("Client calendar event creation error:", error);
    return new NextResponse(
      `Failed to create client calendar event: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
}
