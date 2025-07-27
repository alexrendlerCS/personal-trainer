import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Footer } from "@/components/ui/footer";
import Script from "next/script";

export const metadata = {
  title: "Coach Kilday - Personal Training | Westminster, CO",
  description:
    "Transform your fitness journey with Coach Kilday. Personal training in Westminster, Colorado. Book sessions, track progress, and achieve your fitness goals.",
  keywords:
    "personal training, fitness coach, Westminster Colorado, Coach Kilday, personal trainer, fitness training, workout coach, strength training, weight loss, muscle building",
  openGraph: {
    title: "Coach Kilday - Personal Training | Westminster, CO",
    description:
      "Transform your fitness journey with Coach Kilday. Personal training in Westminster, Colorado. Book sessions, track progress, and achieve your fitness goals.",
    url: "https://www.coachkilday.com",
    siteName: "Coach Kilday",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Coach Kilday Personal Training",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coach Kilday - Personal Training | Westminster, CO",
    description:
      "Transform your fitness journey with Coach Kilday. Personal training in Westminster, Colorado.",
    images: ["/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual verification code
  },
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body className={`${GeistSans.className} flex min-h-screen flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster />
          <Sonner />
        </ThemeProvider>
      </body>
    </html>
  );
}
