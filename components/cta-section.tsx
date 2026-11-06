"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle, Check } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";

export default function CtaSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email: email.toLowerCase().trim() }]);

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          setError("This email is already subscribed!");
        } else {
          setError("Failed to subscribe. Please try again.");
        }
        console.error("Newsletter subscription error:", error);
      } else {
        setSubmitted(true);
        setEmail("");
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      setError("Failed to subscribe. Please try again.");
      console.error("Newsletter subscription error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative isolate overflow-hidden bg-gray-900 py-24 text-white lg:py-32">
      <Image
        src="/back.JPG"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-[50%_30%] opacity-40"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900/60 via-gray-900/80 to-gray-900" />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-extrabold leading-[0.95] tracking-tight md:text-6xl">
            Ready to transform your fitness?
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl">
            Take the first step toward your strongest self. Get your first
            session free when you sign up today, or join Coach Haley's
            newsletter for tips and advice.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          {/* Primary offer */}
          <div className="flex flex-col rounded-3xl bg-red-600 p-8 shadow-2xl shadow-red-950/40 md:p-10">
            <span className="self-start rounded-full bg-white px-3 py-1 text-sm font-bold text-red-600">
              Free with signup
            </span>
            <h3 className="mt-6 text-3xl font-extrabold tracking-tight md:text-4xl">
              Book First Session
            </h3>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-red-50">
              Sign up today and get your first training session absolutely
              free! Choose from virtual, in-person, or partner training.
            </p>
            <Button
              asChild
              className="mt-8 self-start rounded-full bg-white px-8 py-6 text-base font-semibold text-red-600 hover:bg-gray-100 lg:mt-auto"
            >
              <Link href="/login">
                Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Newsletter */}
          <div className="rounded-3xl bg-white/10 p-8 ring-1 ring-white/15 backdrop-blur-md md:p-10">
            <h3 className="text-2xl font-bold">Join the Newsletter</h3>
            <p className="mt-3 leading-relaxed text-gray-300">
              Get weekly training tips, nutrition advice, and exclusive offers.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-3">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                aria-invalid={!!error}
                aria-describedby={error ? "newsletter-error" : undefined}
                className="h-12 rounded-full border-white/20 bg-white/10 px-5 text-base text-white placeholder:text-gray-400 focus-visible:ring-white"
              />
              {error && (
                <p id="newsletter-error" role="alert" className="px-2 text-sm text-red-300">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className={`h-12 w-full rounded-full text-base disabled:cursor-not-allowed disabled:opacity-60 ${
                  submitted
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                }`}
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                    Subscribing...
                  </>
                ) : submitted ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" /> Subscribed!
                  </>
                ) : (
                  "Subscribe Now"
                )}
              </Button>
            </form>
          </div>
        </div>

        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-gray-300">
          {["First Session Free", "Personalized Approach", "Results Guaranteed"].map(
            (item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-red-500" aria-hidden="true" />
                {item}
              </li>
            )
          )}
        </ul>
      </div>
    </section>
  );
}
