import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password, full_name, role } = await req.json();

    if (!email || !password || !full_name || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First create the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    // Then immediately confirm their email for development
    if (data.user) {
      await supabase.auth.admin.updateUserById(data.user.id, {
        email_confirm: true,
        user_metadata: {
          full_name,
          role,
        },
      });

      // Create the user record in the users table
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          email: email,
          full_name: full_name,
          role: role,
          created_at: new Date().toISOString(),
          contract_accepted: false,
          google_account_connected: false,
        },
      ]);

      if (insertError) {
        console.error("Failed to create user record:", insertError);
        // Try to clean up the auth user since we couldn't create the full user record
        await supabase.auth.admin.deleteUser(data.user.id);
        return new Response(
          JSON.stringify({ error: "Failed to create user record" }),
          { status: 500 }
        );
      }

      // If the new user is a client, create a free in-person package with 1 session
      if (role === "client") {
        const { error: packageError } = await supabase.from("packages").insert([
          {
            client_id: data.user.id,
            package_type: "In-Person Training",
            sessions_included: 1,
            original_sessions: 1,
            status: "active",
            purchase_date: new Date().toISOString().split("T")[0],
          },
        ]);
        if (packageError) {
          console.error("Failed to create free in-person package:", packageError);
          // Not fatal, but you may want to notify admin or log this
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: "Signup successful",
        user: data.user,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
