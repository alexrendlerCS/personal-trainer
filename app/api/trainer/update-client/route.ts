import { createClient } from "@/lib/supabase-server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { clientId, first_name, last_name, email, phone } = await req.json();

    // Validate required fields
    if (!clientId || !first_name || !last_name || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400 }
      );
    }

    // Validate phone if provided
    if (phone) {
      const phoneRegex = /^[\d\s\-\(\)\+]+$/;
      const digitsOnly = phone.replace(/\D/g, "");
      if (!phoneRegex.test(phone) || digitsOnly.length < 10) {
        return new Response(
          JSON.stringify({ error: "Invalid phone number format" }),
          { status: 400 }
        );
      }
    }

    // Create Supabase client with user's auth context
    const supabase = createClient();

    // Get the current user (trainer) making the request
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    // Verify user is a trainer
    const { data: trainerData, error: trainerError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (trainerError || trainerData?.role !== "trainer") {
      return new Response(
        JSON.stringify({ error: "Only trainers can update client information" }),
        { status: 403 }
      );
    }

    // Verify the client exists and is a client
    const { data: clientData, error: clientCheckError } = await supabase
      .from("users")
      .select("role, email")
      .eq("id", clientId)
      .single();

    if (clientCheckError || !clientData) {
      return new Response(
        JSON.stringify({ error: "Client not found" }),
        { status: 404 }
      );
    }

    if (clientData.role !== "client") {
      return new Response(
        JSON.stringify({ error: "Can only update client accounts" }),
        { status: 400 }
      );
    }

    // Check if email is being changed and if it's already in use
    if (email.toLowerCase() !== clientData.email.toLowerCase()) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase())
        .neq("id", clientId)
        .single();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "Email address is already in use by another account" }),
          { status: 400 }
        );
      }
    }

    // Construct full_name for backward compatibility
    const full_name = `${first_name} ${last_name}`;

    // Update the client record
    const { error: updateError } = await supabase
      .from("users")
      .update({
        first_name: first_name,
        last_name: last_name,
        full_name: full_name,
        email: email,
        phone: phone || null,
      })
      .eq("id", clientId);

    if (updateError) {
      console.error("Error updating client:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update client information" }),
        { status: 500 }
      );
    }

    // If email changed, update auth user email as well using service role
    if (email.toLowerCase() !== clientData.email.toLowerCase()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      const { error: authUpdateError } = await serviceClient.auth.admin.updateUserById(
        clientId,
        { email: email }
      );

      if (authUpdateError) {
        console.error("Error updating auth email:", authUpdateError);
        // Not fatal - the database record is updated, but log the issue
      }
    }

    // Update user metadata using service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    await serviceClient.auth.admin.updateUserById(clientId, {
      user_metadata: {
        full_name: full_name,
        first_name: first_name,
        last_name: last_name,
        phone: phone,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Client information updated successfully",
        client: {
          id: clientId,
          first_name,
          last_name,
          full_name,
          email,
          phone,
        },
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in update-client API:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500 }
    );
  }
}
