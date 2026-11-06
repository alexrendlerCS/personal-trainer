"use client";

import type React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Mail, Lock, User, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabaseClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Footer } from "@/components/ui/footer";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<"trainer" | "client">("client");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error message when user starts typing
    if (statusMessage.type === "error") {
      setStatusMessage({ type: null, message: "" });
    }
  };

  const validateSignupForm = () => {
    // Validate first name
    if (!formData.first_name.trim()) {
      setStatusMessage({
        type: "error",
        message: "First name is required",
      });
      return false;
    }

    // Validate last name
    if (!formData.last_name.trim()) {
      setStatusMessage({
        type: "error",
        message: "Last name is required",
      });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatusMessage({
        type: "error",
        message: "Please enter a valid email address",
      });
      return false;
    }

    // Validate phone if provided
    if (formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\(\)\+]+$/;
      if (!phoneRegex.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 10) {
        setStatusMessage({
          type: "error",
          message: "Please enter a valid phone number (at least 10 digits)",
        });
        return false;
      }
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setStatusMessage({
        type: "error",
        message: "Passwords do not match",
      });
      return false;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setStatusMessage({
        type: "error",
        message: "Password must be at least 6 characters long",
      });
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: null, message: "" });

    // Validate input fields
    if (!loginData.email.trim()) {
      setStatusMessage({
        type: "error",
        message: "Please enter your email address.",
      });
      setIsLoading(false);
      return;
    }

    if (!loginData.password.trim()) {
      setStatusMessage({
        type: "error",
        message: "Please enter your password.",
      });
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginData.email)) {
      setStatusMessage({
        type: "error",
        message: "Please enter a valid email address.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Use the login API route instead of direct Supabase auth
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific authentication errors
        let errorMessage = "Failed to log in";

        if (
          data.error === "Invalid login credentials" ||
          data.error.includes("Invalid login credentials")
        ) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (data.error.includes("Email not confirmed")) {
          errorMessage =
            "Please check your email and confirm your account before signing in.";
        } else if (data.error.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else if (data.error.includes("User not found")) {
          errorMessage =
            "No account found with this email address. Please check your email or create a new account.";
        } else if (data.error.includes("Account disabled")) {
          errorMessage =
            "Your account has been disabled. Please contact support for assistance.";
        } else if (data.error.includes("Password expired")) {
          errorMessage =
            "Your password has expired. Please reset your password.";
        } else if (data.error.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address.";
        } else {
          errorMessage = data.error || "Failed to log in";
        }

        setStatusMessage({
          type: "error",
          message: errorMessage,
        });
        return;
      }

      // Check if user exists and has the correct role
      if (!data.user) {
        setStatusMessage({
          type: "error",
          message: "User account not found. Please contact support.",
        });
        return;
      }

      // Validate role-based login
      if (data.user.role !== userType) {
        const correctRole = data.user.role === "trainer" ? "Trainer" : "Client";
        const selectedRole = userType === "trainer" ? "Trainer" : "Client";

        setStatusMessage({
          type: "error",
          message: `You are trying to sign in as a ${selectedRole}, but your account is registered as a ${correctRole}. Please select the correct account type and try again.`,
        });
        return;
      }

      // Redirect based on role
      const redirectTo =
        data.user.role === "trainer"
          ? "/trainer/dashboard"
          : "/client/dashboard";
      router.push(redirectTo);
    } catch (error) {
      console.error("Unexpected error during login:", error);
      setStatusMessage({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateSignupForm()) {
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: null, message: "" });

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          role: userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Clear form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        phone: "",
      });

      // Show signup welcome message (leave isLogin as false)
      setStatusMessage({
        type: "success",
        message: "", // leave blank to use the new welcome message
      });

      // Pre-fill the login email
      setLoginData((prev) => ({
        ...prev,
        email: formData.email,
      }));
    } catch (error: any) {
      let friendlyMessage = error.message;

      if (error.message.includes("User already registered")) {
        friendlyMessage =
          "An account with this email already exists. Please log in or use a different email.";
      } else if (
        error.message.includes("Password should be at least 6 characters")
      ) {
        friendlyMessage = "Password must be at least 6 characters long.";
      } else if (error.message.includes("Invalid email")) {
        friendlyMessage = "Please enter a valid email address.";
      }

      setStatusMessage({
        type: "error",
        message: friendlyMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const platformFeatures = [
    {
      title: "Google Calendar Integration",
      description:
        "Seamlessly sync your training sessions with Google Calendar for effortless scheduling and automatic reminders.",
    },
    {
      title: "Integrated Payments",
      description:
        "Secure payment processing built right into the platform for hassle-free transactions and package purchases.",
    },
    {
      title: "Multiple Training Options",
      description:
        "Choose from virtual sessions, in-person training, or partner workouts to fit your lifestyle and preferences.",
    },
    {
      title: "Session Tracking",
      description:
        "Easy scheduling and comprehensive session tracking to monitor your progress and manage your fitness journey.",
    },
  ];

  // Shared styles (light + dark)
  const labelClass = "text-gray-800 dark:text-gray-200";
  const inputClass =
    "h-11 rounded-xl border-gray-200 bg-gray-50 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus-visible:border-red-600 focus-visible:bg-white focus-visible:ring-red-600/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus-visible:bg-gray-900 md:text-sm";
  const iconInputClass = `${inputClass} pl-10`;
  const fieldIconClass =
    "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500";
  const errorAlertClass =
    "rounded-xl border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
  const hintClass = "mt-1 text-xs text-gray-500 dark:text-gray-400";
  const primaryButtonClass =
    "h-12 w-full rounded-full bg-red-600 text-base font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 dark:shadow-red-950/40";
  const tabTriggerClass =
    "h-full rounded-full text-sm font-semibold text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-400 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-100";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Photo band — dark in both themes, like the site's page heroes */}
      <div className="relative isolate h-[300px] overflow-hidden bg-gray-900 sm:h-[360px]">
        <Image
          src="/back.JPG"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[50%_45%]"
        />
        <div className="absolute inset-0 -z-10 bg-black/60" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-950" />

        <div className="container mx-auto px-4 pt-6">
          <Button
            size="sm"
            onClick={() => router.push("/")}
            className="group rounded-full border border-white/30 bg-white/10 px-4 text-white backdrop-blur-sm hover:bg-white hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="font-medium">Back to Home</span>
          </Button>
        </div>
      </div>

      <main className="relative z-10 -mt-48 px-4 pb-20 sm:-mt-56">
        {/* Card */}
        <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-xl shadow-gray-900/10 ring-1 ring-gray-200/70 dark:bg-gray-900 dark:shadow-black/40 dark:ring-gray-800 sm:p-8">
          {/* Brand */}
          <div className="flex flex-col items-center text-center">
            <Image
              src="/logo.jpg"
              alt="Coach Kilday logo"
              width={96}
              height={96}
              className="rounded-full shadow-lg ring-4 ring-white dark:ring-gray-900"
              priority
            />
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              Coach Kilday
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Professional fitness coaching platform
            </p>
          </div>

          <Tabs
            className="mt-8"
            value={isLogin ? "login" : "signup"}
            onValueChange={(value) => {
              setIsLogin(value === "login");
              // Clear messages when switching tabs
              setStatusMessage({ type: null, message: "" });
            }}
          >
            <TabsList className="grid h-12 w-full grid-cols-2 rounded-full bg-gray-100 p-1 dark:bg-gray-800">
              <TabsTrigger value="login" className={tabTriggerClass}>
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className={tabTriggerClass}>
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Account type */}
            <fieldset className="mt-6">
              <legend className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                I am a:
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { value: "client", label: "Client", icon: User },
                    { value: "trainer", label: "Trainer", icon: Dumbbell },
                  ] as const
                ).map(({ value, label, icon: Icon }) => {
                  const selected = userType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setUserType(value)}
                      className={`flex h-12 items-center justify-center gap-2 rounded-xl border-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
                        selected
                          ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {statusMessage.type === "error" && (
                  <Alert variant="destructive" className={errorAlertClass}>
                    <AlertDescription>{statusMessage.message}</AlertDescription>
                  </Alert>
                )}
                {statusMessage.type === "success" && (
                  <Alert className="rounded-xl border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{statusMessage.message}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className={labelClass}>Email</Label>
                  <div className="relative">
                    <Mail className={fieldIconClass} />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      className={iconInputClass}
                      required
                      value={loginData.email}
                      onChange={(e) => {
                        setLoginData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }));
                        // Clear error message when user starts typing
                        if (statusMessage.type === "error") {
                          setStatusMessage({ type: null, message: "" });
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className={labelClass}>Password</Label>
                  <div className="relative">
                    <Lock className={fieldIconClass} />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={iconInputClass}
                      required
                      value={loginData.password}
                      onChange={(e) => {
                        setLoginData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }));
                        // Clear error message when user starts typing
                        if (statusMessage.type === "error") {
                          setStatusMessage({ type: null, message: "" });
                        }
                      }}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className={`${primaryButtonClass} !mt-6`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    `Sign In as ${
                      userType === "trainer" ? "Trainer" : "Client"
                    }`
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Create Account
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Sign up for a new account
                </p>
              </div>
              <form onSubmit={handleSignup}>
                <div className="grid w-full items-start gap-4">
                  {statusMessage.type === "error" && (
                    <Alert variant="destructive" className={errorAlertClass}>
                      <AlertDescription>
                        {statusMessage.message}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="first_name" className={labelClass}>First Name</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        autoComplete="given-name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                        className={inputClass}
                        required
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="last_name" className={labelClass}>Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        autoComplete="family-name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email" className={labelClass}>Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="phone" className={labelClass}>Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 555-5555"
                      className={inputClass}
                    />
                    <p className={hintClass}>
                      Optional - for scheduling updates and communication
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="password" className={labelClass}>Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
                      className={inputClass}
                      required
                    />
                    <p className={hintClass}>
                      Password must be at least 6 characters long.
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="confirmPassword" className={labelClass}>Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className={inputClass}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className={`${primaryButtonClass} mt-2`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Forgot your password?{" "}
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="rounded font-semibold text-red-600 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:text-red-400 dark:hover:text-red-300"
              >
                Reset it here
              </button>
            </p>
          </div>
        </div>

        {/* Platform features */}
        <ul className="mx-auto mt-16 hidden max-w-5xl grid-cols-4 gap-8 lg:grid">
          {platformFeatures.map((feature) => (
            <li
              key={feature.title}
              className="border-t-2 border-red-600 pt-5"
            >
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </main>

      {/* Status Dialog */}
      <Dialog
        open={statusMessage.type !== null}
        onOpenChange={(open) => {
          setStatusMessage({ type: null, message: "" });
          // If this was a successful signup (not login), redirect to client login
          if (!isLogin && statusMessage.type === "success" && !open) {
            window.location.href = "/login?tab=client";
          }
        }}
      >
        <DialogContent className="rounded-3xl sm:max-w-md dark:border-gray-800 dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              {statusMessage.type === "success" && isLogin
                ? "Welcome Back!"
                : statusMessage.type === "success"
                  ? `Welcome${formData.first_name ? `, ${formData.first_name}!` : "!"}`
                  : "Error"}
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              {statusMessage.type === "success" && !isLogin ? (
                <>
                  Thank you for signing up for Coach Kilday's fitness scheduling platform.<br /><br />
                  As a welcome gift, you have been given <b>1 complimentary In-Person Training session</b> to get started! 🎉<br /><br />
                  You can use this free session to book your first training appointment with your coach.
                </>
              ) : (
                statusMessage.message
              )}
            </DialogDescription>
          </DialogHeader>
          {statusMessage.type === "error" && (
            <Button
              onClick={() => setStatusMessage({ type: null, message: "" })}
              className="mt-4 rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              Dismiss
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </div>
  );
}
