"use client";

import type React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  full_name: string;
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
    full_name: "",
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
    if (formData.password !== formData.confirmPassword) {
      setStatusMessage({
        type: "error",
        message: "Passwords do not match",
      });
      return false;
    }
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
          full_name: formData.full_name,
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
        full_name: "",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-red-700 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top-right decorative circle */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute top-40 -right-10 w-20 h-20 bg-white/5 rounded-full"></div>
        
        {/* Bottom-left decorative elements */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/5 rounded-full"></div>
        
        {/* Center decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-white/20 rounded-full"></div>
        <div className="absolute top-3/4 right-1/3 w-12 h-12 bg-white/10 rounded-full"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </div>

      {/* Back Button - Fixed to top left of page */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          size="sm"
          onClick={() => router.push("/")}
          className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back to Home</span>
        </Button>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* Left side decorative content */}
        <div className="hidden lg:block absolute left-8 top-1/2 transform -translate-y-1/2 w-80">
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Google Calendar Integration</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Seamlessly sync your training sessions with Google Calendar for effortless scheduling and automatic reminders.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Integrated Payments</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Secure payment processing built right into the platform for hassle-free transactions and package purchases.
              </p>
            </div>
          </div>
        </div>

        {/* Right side decorative content */}
        <div className="hidden xl:block absolute right-8 top-1/2 transform -translate-y-1/2 w-80">
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Multiple Training Options</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Choose from virtual sessions, in-person training, or partner workouts to fit your lifestyle and preferences.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Session Tracking</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Easy scheduling and comprehensive session tracking to monitor your progress and manage your fitness journey.
              </p>
            </div>
          </div>
        </div>

        {/* Center Login Card */}
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white">
        <CardHeader className="text-center space-y-4">
          <div className="flex flex-col items-center">
            <Image
              src="/logo.jpg"
              alt="FitCoach Pro Logo"
              width={180}
              height={180}
              className="rounded-full shadow-lg mb-4"
              priority
            />
            <h1 className="text-3xl font-bold text-gray-900">
                Coach Kilday
            </h1>
            <CardDescription className="text-gray-600 text-lg">
              Professional fitness coaching platform
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={isLogin ? "login" : "signup"}
            onValueChange={(value) => {
              setIsLogin(value === "login");
              // Clear messages when switching tabs
              setStatusMessage({ type: null, message: "" });
            }}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                I am a:
              </Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={userType === "client" ? "default" : "outline"}
                  className={`flex-1 ${
                    userType === "client"
                      ? "bg-red-600 hover:bg-red-700"
                      : "border-gray-300"
                  }`}
                  onClick={() => setUserType("client")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Client
                </Button>
                <Button
                  type="button"
                  variant={userType === "trainer" ? "default" : "outline"}
                  className={`flex-1 ${
                    userType === "trainer"
                      ? "bg-red-600 hover:bg-red-700"
                      : "border-gray-300"
                  }`}
                  onClick={() => setUserType("trainer")}
                >
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Trainer
                </Button>
              </div>
            </div>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {statusMessage.type === "error" && (
                  <Alert variant="destructive">
                    <AlertDescription>{statusMessage.message}</AlertDescription>
                  </Alert>
                )}
                {statusMessage.type === "success" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{statusMessage.message}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
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
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
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
                  className="w-full bg-red-600 hover:bg-red-700"
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

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Sign up for a new account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup}>
                    <div className="grid w-full items-center gap-4">
                      {statusMessage.type === "error" && (
                        <Alert variant="destructive">
                          <AlertDescription>
                            {statusMessage.message}
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Create a password"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Password must be at least 6 characters long.
                        </p>
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700"
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Forgot your password?{" "}
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Reset it here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusMessage.type === "success" && isLogin
                ? "Welcome Back!"
                : statusMessage.type === "success"
                    ? `Welcome${formData.full_name ? `, ${formData.full_name.split(" ")[0]}!` : "!"}`
                  : "Error"}
            </DialogTitle>
              <DialogDescription>
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
              className="mt-4"
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
    </div>
  );
}
