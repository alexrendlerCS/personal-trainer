"use client";

import { useRef, useState } from "react";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  LifeBuoy,
  Bug,
  Lightbulb,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_FILE_BYTES = 4 * 1024 * 1024;

const REASONS = [
  { value: "help", label: "I need help", icon: LifeBuoy },
  { value: "bug", label: "Report a bug", icon: Bug },
  { value: "feedback", label: "Share feedback or suggest a feature", icon: Lightbulb },
];

// Shared field styling: soft fill at rest, white with a red ring on focus.
const fieldClass =
  "h-12 rounded-xl border-gray-200 bg-gray-50 px-4 text-base transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:bg-white focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-0 focus:ring-2 focus:ring-red-600 focus:ring-offset-0 dark:border-gray-700 dark:bg-gray-800 dark:focus:bg-gray-900 md:text-sm";

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-sm font-semibold text-gray-900 dark:text-gray-100"
    >
      {children}
      {optional ? (
        <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">(optional)</span>
      ) : (
        <span className="ml-0.5 text-red-600" aria-hidden="true">
          *
        </span>
      )}
    </Label>
  );
}

export default function AppSupportForm() {
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const setScreenshot = (next: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setError(null);
    if (selected && selected.size > MAX_FILE_BYTES) {
      setError("Screenshot must be smaller than 4MB.");
      e.target.value = "";
      setScreenshot(null);
      return;
    }
    setScreenshot(selected);
  };

  const clearFile = () => {
    setScreenshot(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!reason) {
      setError("Please choose what brings you here.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("reason", reason);
    if (!file) formData.delete("screenshot");

    setStatus("sending");
    try {
      const res = await fetch("/api/app-support", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "We couldn't send your message.");
      }
      setStatus("sent");
      formRef.current?.reset();
      setReason("");
      clearFile();
    } catch (err) {
      setStatus("idle");
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  const shell =
    "overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-900/[0.06] ring-1 ring-gray-200 dark:bg-gray-900 dark:shadow-none dark:ring-gray-800";

  if (status === "sent") {
    return (
      <div className={`${shell} px-6 py-14 text-center sm:px-12`} role="status">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
          <CheckCircle2 className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Message sent
        </h3>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-gray-600 dark:text-gray-300">
          Thanks for reaching out! Your message has been received. If you need
          support, I&apos;ll follow up by email.
        </p>
        <Button
          variant="outline"
          className="mt-8 rounded-full border-gray-300 px-6 hover:border-red-600 hover:bg-transparent hover:text-red-600"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={shell}>
      <div className="h-1.5 bg-gradient-to-r from-red-600 to-red-500" />

      <div className="space-y-7 p-6 sm:p-10">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-5">
          <div className="space-y-2">
            <FieldLabel htmlFor="support-name">Name</FieldLabel>
            <Input
              id="support-name"
              name="name"
              required
              autoComplete="name"
              maxLength={200}
              placeholder="Your name"
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="support-email">Email</FieldLabel>
            <Input
              id="support-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              maxLength={320}
              placeholder="you@example.com"
              aria-describedby="support-email-hint"
              className={fieldClass}
            />
            <p id="support-email-hint" className="text-xs text-gray-500 dark:text-gray-400">
              Use the email linked to your app account.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="support-reason">What brings you here?</FieldLabel>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger
              id="support-reason"
              aria-required="true"
              className={`${fieldClass} data-[placeholder]:text-gray-400`}
            >
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectContent className="rounded-xl p-1">
              {REASONS.map(({ value, label, icon: Icon }) => (
                <SelectItem
                  key={value}
                  value={value}
                  className="cursor-pointer rounded-lg py-2.5 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-900/20 dark:focus:text-red-300"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-red-600" />
                    {label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="support-message">Tell me more</FieldLabel>
          <Textarea
            id="support-message"
            name="message"
            required
            rows={6}
            maxLength={5000}
            placeholder="What happened, or what would you like help with? If something isn't working, include your device and what you were trying to do."
            className={`${fieldClass} h-auto min-h-[150px] resize-y py-3 leading-relaxed`}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="support-screenshot" optional>
            Upload a screenshot
          </FieldLabel>
          <input
            ref={fileInputRef}
            id="support-screenshot"
            name="screenshot"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="peer sr-only"
          />
          {file ? (
            <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-white hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:hover:bg-gray-900"
                aria-label="Remove screenshot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="support-screenshot"
              className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center transition-colors hover:border-red-300 hover:bg-red-50/50 peer-focus-visible:border-red-600 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-red-900/10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 transition-colors group-hover:text-red-600 dark:bg-gray-900 dark:ring-gray-700">
                <ImagePlus className="h-5 w-5 text-gray-500 group-hover:text-red-600" />
              </span>
              <span className="text-sm">
                <span className="font-semibold text-red-600">Choose an image</span>
                <span className="text-gray-500 dark:text-gray-400"> to attach</span>
              </span>
              <span className="text-xs text-gray-400">PNG, JPG, or HEIC up to 4MB</span>
            </label>
          )}
        </div>

        {error && (
          <p
            className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={status === "sending"}
          className="h-14 w-full rounded-full bg-red-600 text-base font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-700 hover:shadow-red-600/35 active:scale-[0.99]"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Message
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
