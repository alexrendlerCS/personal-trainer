import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  let response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.json(
            { message: "Logged out successfully" },
            { status: 200 }
          );
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.delete({
            name,
            ...options,
          });
          response = NextResponse.json(
            { message: "Logged out successfully" },
            { status: 200 }
          );
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  try {
    // Check if user is authenticated before signing out
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("No user found during logout - already logged out");
      return response;
    }

    console.log("Signing out user:", user.id);

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      return NextResponse.json(
        { error: "Failed to sign out", details: error.message },
        { status: 500 }
      );
    }

    console.log("User signed out successfully");
    return response;
  } catch (error) {
    console.error("Unexpected error during logout:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
