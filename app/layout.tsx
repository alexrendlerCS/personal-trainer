import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Footer } from "@/components/ui/footer";
import Script from "next/script";

export const metadata = {
  title: "Coach Kilday - Personal Training | Thornton, CO",
  description:
    "Transform your fitness journey with Coach Kilday. Personal training in Thornton, Colorado. Book sessions, track progress, and achieve your fitness goals.",
  keywords:
    "personal training, fitness coach, Thornton Colorado, Coach Kilday, personal trainer, fitness training, workout coach, strength training, weight loss, muscle building",
  openGraph: {
    title: "Coach Kilday - Personal Training | Thornton, CO",
    description:
      "Transform your fitness journey with Coach Kilday. Personal training in Thornton, Colorado. Book sessions, track progress, and achieve your fitness goals.",
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
    title: "Coach Kilday - Personal Training | Thornton, CO",
    description:
      "Transform your fitness journey with Coach Kilday. Personal training in Thornton, Colorado.",
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
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Coach Kilday",
              description:
                "Personal training and fitness coaching in Thornton, Colorado",
              url: "https://www.coachkilday.com",
              telephone: "+1-720-979-2808",
              address: {
                "@type": "PostalAddress",
                streetAddress: "397 W 148th Ave",
                addressLocality: "Thornton",
                addressRegion: "CO",
                postalCode: "80023",
                addressCountry: "US",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 39.8822,
                longitude: -104.9816,
              },
              openingHours: "Mo-Su 11:00-21:00",
              priceRange: "$$",
              currenciesAccepted: "USD",
              paymentAccepted: "Cash, Credit Card",
              areaServed: {
                "@type": "City",
                name: "Thornton, Colorado",
              },
              serviceArea: {
                "@type": "GeoCircle",
                geoMidpoint: {
                  "@type": "GeoCoordinates",
                  latitude: 39.8822,
                  longitude: -104.9816,
                },
                geoRadius: "50000",
              },
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Personal Training Services",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Personal Training Session",
                      description: "One-on-one personal training session",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Fitness Coaching",
                      description:
                        "Comprehensive fitness coaching and lifestyle guidance",
                    },
                  },
                ],
              },
              sameAs: ["https://www.instagram.com/coachkilday"],
            }),
          }}
        />
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
