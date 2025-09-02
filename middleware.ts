import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/login", "/reset-password", "/privacy", "/terms"];

// Define routes that require authentication
const protectedRoutes = [
  "/client",
  "/trainer",
  "/messages",
  "/booking",
  "/calendar",
  "/payment-methods",
];

export async function middleware(request: NextRequest) {
  // Skip middleware for Stripe webhook route
  if (request.nextUrl.pathname === "/api/stripe/webhook") {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
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
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Allow access to public routes without authentication
  if (publicRoutes.some((route) => path.startsWith(route))) {
    // If user is authenticated and trying to access login, redirect to dashboard
    if (user && path.startsWith("/login")) {
      try {
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        const redirectTo =
          userData?.role === "trainer"
            ? "/trainer/dashboard"
            : "/client/dashboard";
        return NextResponse.redirect(new URL(redirectTo, request.url));
      } catch (error) {
        // If there's an error fetching user data, clear the session and redirect to login
        console.error("Error fetching user data in middleware:", error);
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
    return response;
  }

  // Check if the path requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is authenticated but trying to access protected routes, verify they have proper role
  if (isProtectedRoute && user) {
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      // Check if user is trying to access trainer routes but is a client
      if (path.startsWith("/trainer") && userData?.role !== "trainer") {
        return NextResponse.redirect(new URL("/client/dashboard", request.url));
      }

      // Check if user is trying to access client routes but is a trainer
      if (path.startsWith("/client") && userData?.role !== "client") {
        return NextResponse.redirect(
          new URL("/trainer/dashboard", request.url)
        );
      }
    } catch (error) {
      // If there's an error fetching user data, redirect to login
      console.error("Error fetching user data in middleware:", error);
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (API routes - handled by individual route handlers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
