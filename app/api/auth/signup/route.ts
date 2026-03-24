import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, password, first_name, last_name, phone, role } = await req.json();

    if (!email || !password || !first_name || !last_name || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Construct full_name for backward compatibility
    const full_name = `${first_name} ${last_name}`;

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
          first_name,
          last_name,
          phone,
          role,
        },
      });

      // Create the user record in the users table
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          email: email,
          full_name: full_name,
          first_name: first_name,
          last_name: last_name,
          phone: phone || null,
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

        // Send notification email to Haley about new client sign-up
        try {
          const formattedSignupDate = new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          await resend.emails.send({
            from: "Coach Kilday <no-reply@coachkilday.com>",
            to: ["haley@coachkilday.com"],
            subject: `New Client Sign-Up - ${full_name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #d32f2f; margin-bottom: 20px;">🎉 New Client Sign-Up!</h2>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="margin: 0 0 15px 0; color: #333;">Client Information</h3>
                  
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #666; width: 40%;">Name:</td>
                      <td style="padding: 8px 0;">${full_name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td>
                      <td style="padding: 8px 0;">${email}</td>
                    </tr>
                    ${phone ? `
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #666;">Phone:</td>
                      <td style="padding: 8px 0;">${phone}</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #666;">Sign-Up Date:</td>
                      <td style="padding: 8px 0;">${formattedSignupDate}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 0; color: #2e7d32; font-weight: bold;">✓ Free Session Package Created</p>
                  <p style="margin: 5px 0 0 0; color: #558b2f; font-size: 14px;">
                    The client has been automatically assigned 1 complimentary In-Person Training session.
                  </p>
                </div>
                
                <p style="color: #666; margin: 20px 0;">
                  A new client has successfully registered for Coach Kilday's training platform. 
                  They now have access to the client dashboard and can view their free session package.
                </p>
                
                <p style="color: #666; margin: 0;">
                  <strong>Next steps:</strong>
                </p>
                <ul style="color: #666; margin: 10px 0;">
                  <li>Client will need to sign the training agreement before booking sessions</li>
                  <li>You can reach out to welcome them and discuss their fitness goals</li>
                  <li>They can book their first free session once the contract is signed</li>
                </ul>
              </div>
            `,
          });

          console.log("New client sign-up notification email sent to Haley");
        } catch (emailError) {
          console.error("Failed to send new client notification email to Haley:", emailError);
          // Don't fail the signup process if email fails
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
