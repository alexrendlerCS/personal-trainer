"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/store/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Menu,
  CheckCircle,
  Loader2,
  PlusCircle,
  Search,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CountUp from "react-countup";
import { useRef } from "react";
import { useCallback } from "react";

interface Package {
  id: string;
  name: string;
  sessionsPerWeek: number;
  hourlyRate: number;
  monthlyPrice: number;
  monthlySessionCount: number;
  priceId: string;
}

interface PackageSection {
  title: string;
  description: string;
  icon: string;
  packages: Package[];
}

interface PackageTypeCount {
  type: string;
  remaining: number;
  total: number;
}

type PackageType =
  | "In-Person Training"
  | "Virtual Training"
  | "Partner Training"
  | "Posing Package";

type PackageTypeCounts = {
  [K in PackageType]: PackageTypeCount;
};

type PurchaseOption = "current_month" | "next_month";

const packageSections: PackageSection[] = [
  {
    title: "In-Person Training",
    description: "Get personalized attention with face-to-face sessions",
    icon: "🏋️",
    packages: [
      {
        id: "inperson-1",
        name: "1x Per Week",
        sessionsPerWeek: 1,
        hourlyRate: 130,
        monthlySessionCount: 4,
        monthlyPrice: 520,
        priceId: "price_PLACEHOLDER_1",
      },
      {
        id: "inperson-2",
        name: "2x Per Week",
        sessionsPerWeek: 2,
        hourlyRate: 125,
        monthlySessionCount: 8,
        monthlyPrice: 1000,
        priceId: "price_1Re6vXEKMzESB1YewPm98DzS",
      },
      {
        id: "inperson-3",
        name: "3x Per Week",
        sessionsPerWeek: 3,
        hourlyRate: 115,
        monthlySessionCount: 12,
        monthlyPrice: 1380,
        priceId: "price_1Re6vXEKMzESB1YebU76tDfH",
      },
      {
        id: "inperson-4",
        name: "4x Per Week",
        sessionsPerWeek: 4,
        hourlyRate: 110,
        monthlySessionCount: 16,
        monthlyPrice: 1760,
        priceId: "price_1Re6vXEKMzESB1YerK6MPNU9",
      },
      {
        id: "inperson-5",
        name: "5x Per Week",
        sessionsPerWeek: 5,
        hourlyRate: 100,
        monthlySessionCount: 20,
        monthlyPrice: 2000,
        priceId: "price_1Re6vXEKMzESB1YehCkpeMxB",
      },
    ],
  },
  {
    title: "Virtual Training",
    description: "Train from anywhere with our expert virtual coaching",
    icon: "💻",
    packages: [
      {
        id: "virtual-1",
        name: "1x Per Week",
        sessionsPerWeek: 1,
        hourlyRate: 120,
        monthlySessionCount: 4,
        monthlyPrice: 480,
        priceId: "price_PLACEHOLDER_2",
      },
      {
        id: "virtual-2",
        name: "2x Per Week",
        sessionsPerWeek: 2,
        hourlyRate: 115,
        monthlySessionCount: 8,
        monthlyPrice: 920,
        priceId: "price_1ReKRuEKMzESB1YeSGoCqnWe",
      },
      {
        id: "virtual-3",
        name: "3x Per Week",
        sessionsPerWeek: 3,
        hourlyRate: 105,
        monthlySessionCount: 12,
        monthlyPrice: 1260,
        priceId: "price_PLACEHOLDER_6",
      },
      {
        id: "virtual-4",
        name: "4x Per Week",
        sessionsPerWeek: 4,
        hourlyRate: 100,
        monthlySessionCount: 16,
        monthlyPrice: 1600,
        priceId: "price_PLACEHOLDER_7",
      },
      {
        id: "virtual-5",
        name: "5x Per Week",
        sessionsPerWeek: 5,
        hourlyRate: 90,
        monthlySessionCount: 20,
        monthlyPrice: 1800,
        priceId: "price_PLACEHOLDER_8",
      },
    ],
  },
  {
    title: "Partner Training",
    description: "Train with a friend and share the journey (Price per person)",
    icon: "👫",
    packages: [
      {
        id: "partner-1",
        name: "1x Per Week",
        sessionsPerWeek: 1,
        hourlyRate: 100,
        monthlySessionCount: 4,
        monthlyPrice: 400,
        priceId: "price_PLACEHOLDER_3",
      },
      {
        id: "partner-2",
        name: "2x Per Week",
        sessionsPerWeek: 2,
        hourlyRate: 85,
        monthlySessionCount: 8,
        monthlyPrice: 680,
        priceId: "price_PLACEHOLDER_9",
      },
      {
        id: "partner-3",
        name: "3x Per Week",
        sessionsPerWeek: 3,
        hourlyRate: 80,
        monthlySessionCount: 12,
        monthlyPrice: 960,
        priceId: "price_PLACEHOLDER_10",
      },
      {
        id: "partner-4",
        name: "4x Per Week",
        sessionsPerWeek: 4,
        hourlyRate: 75,
        monthlySessionCount: 16,
        monthlyPrice: 1200,
        priceId: "price_PLACEHOLDER_11",
      },
      {
        id: "partner-5",
        name: "5x Per Week",
        sessionsPerWeek: 5,
        hourlyRate: 70,
        monthlySessionCount: 20,
        monthlyPrice: 1400,
        priceId: "price_PLACEHOLDER_12",
      },
    ],
  },
  {
    title: "Posing Package",
    description: "Perfect your posing technique with specialized coaching",
    icon: "💃",
    packages: [
      {
        id: "posing-1",
        name: "1 Pack",
        sessionsPerWeek: 0, // No commitment
        hourlyRate: 80,
        monthlySessionCount: 1,
        monthlyPrice: 80,
        priceId: "price_PLACEHOLDER_POSING_1",
      },
      {
        id: "posing-4",
        name: "4 Pack - 1x/Week",
        sessionsPerWeek: 1,
        hourlyRate: 70,
        monthlySessionCount: 4,
        monthlyPrice: 280,
        priceId: "price_PLACEHOLDER_POSING_4",
      },
      {
        id: "posing-8",
        name: "8 Pack - 2x/Week",
        sessionsPerWeek: 2,
        hourlyRate: 60,
        monthlySessionCount: 8,
        monthlyPrice: 480,
        priceId: "price_PLACEHOLDER_POSING_8",
      },
    ],
  },
];

interface PurchasedPackageInfo {
  type: string;
  sessions: number;
}

function PackagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showCanceledDialog, setShowCanceledDialog] = useState(false);
  const [hasShownMessage, setHasShownMessage] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [sessionsByType, setSessionsByType] = useState<PackageTypeCount[]>([]);
  const [purchasedPackage, setPurchasedPackage] =
    useState<PurchasedPackageInfo | null>(null);
  const [shouldFetchPackages, setShouldFetchPackages] = useState(false);
  const { user, setUser } = useUser();
  const supabase = createClient();
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  const [showSingleSessionModal, setShowSingleSessionModal] = useState(false);
  const [selectedSessionType, setSelectedSessionType] =
    useState<PackageType | null>(null);
  
  // Package filter state
  const [selectedPackageType, setSelectedPackageType] = useState<PackageType>("In-Person Training");
  
  const singleSessionPrice = 150;
  const singleSessionSection: PackageSection = {
    title: selectedSessionType || "In-Person Training",
    description: "Single session purchase",
    icon: "✨",
    packages: [],
  };
  const singleSessionPkg: Package = {
    id: "single-session",
    name: "Single Session",
    sessionsPerWeek: 1,
    hourlyRate: singleSessionPrice,
    monthlyPrice: singleSessionPrice,
    monthlySessionCount: 1,
    priceId: "single-session",
  };

  // Purchase options modal state
  const [showPurchaseOptionsModal, setShowPurchaseOptionsModal] =
    useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedSection, setSelectedSection] = useState<PackageSection | null>(
    null
  );
  const [selectedPurchaseOption, setSelectedPurchaseOption] =
    useState<PurchaseOption | null>(null);

  // Promo code state per package
  const [promoCodes, setPromoCodes] = useState<{ [pkgId: string]: string }>({});
  const [promoErrors, setPromoErrors] = useState<{ [pkgId: string]: string }>({});
  const [discountedPrices, setDiscountedPrices] = useState<{ [pkgId: string]: number | null }>({});
  const [validatingPromo, setValidatingPromo] = useState<string | null>(null);

  // Promo code state for single session
  const [singleSessionPromoCode, setSingleSessionPromoCode] = useState("");
  const [singleSessionPromoError, setSingleSessionPromoError] = useState("");
  const [singleSessionDiscountedPrice, setSingleSessionDiscountedPrice] = useState<number | null>(null);
  const [validatingSingleSessionPromo, setValidatingSingleSessionPromo] = useState(false);

  // User-friendly error message for invalid promo codes
  const FRIENDLY_PROMO_ERROR = "Sorry, that promo code isn't valid. Please check and try again.";

  // Validate promo code for single session
  const validateSingleSessionPromoCode = useCallback(async () => {
    const code = singleSessionPromoCode.trim();
    if (!code) {
      setSingleSessionPromoError("");
      setSingleSessionDiscountedPrice(null);
      return;
    }
    setValidatingSingleSessionPromo(true);
    setSingleSessionPromoError("");
    try {
      const res = await fetch("/api/discount-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          packageType: selectedSessionType ? selectedSessionType : "Single Session",
          baseAmount: 15000, // Send in cents to match database
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        let friendlyError = FRIENDLY_PROMO_ERROR;
        if (data.error && data.error.toLowerCase().includes("expired")) {
          friendlyError = "This promo code has expired. Please try another one.";
        } else if (data.error && data.error.toLowerCase().includes("server")) {
          friendlyError = "There was a problem validating your code. Please try again later.";
        }
        setSingleSessionPromoError(friendlyError);
        setSingleSessionDiscountedPrice(null);
      } else {
        setSingleSessionPromoError("");
        setSingleSessionDiscountedPrice(data.discountedAmount);
      }
    } catch (e) {
      setSingleSessionPromoError(FRIENDLY_PROMO_ERROR);
      setSingleSessionDiscountedPrice(null);
    } finally {
      setValidatingSingleSessionPromo(false);
    }
  }, [singleSessionPromoCode, selectedSessionType]);

  // Function to fetch user's package information
  const fetchPackageInformation = async () => {
    console.log("=== Starting fetchPackageInformation ===");
    console.log("Current user state:", {
      userId: user?.id,
      isAuthenticated: !!user,
      email: user?.email,
    });

    if (!user?.id) {
      console.log(
        "❌ No user ID found for fetching packages - will retry when user is available"
      );
      setShouldFetchPackages(true);
      return false;
    }

    setLoadingPackages(true);
    try {
      const sessionIdFromUrl = searchParams.get("session_id");

      console.log("🔍 Fetching all payments...");
      const { data: payments, error: paymentError } = await supabase
        .from("payments")
        .select("*")
        .eq("client_id", user.id)
        .order("paid_at", { ascending: false }); // ✅ CORRECT

      if (paymentError) {
        console.error("❌ Error fetching payments:", paymentError);
        return false;
      }

      console.log("💰 All payments:", payments);

      let targetPayment = payments?.[0]; // fallback
      if (sessionIdFromUrl) {
        const match = payments?.find((p) => p.session_id === sessionIdFromUrl);
        if (match) {
          console.log("🎯 Matched payment using session_id:", sessionIdFromUrl);
          targetPayment = match;
        } else {
          console.warn(
            "⚠️ No matching payment for session_id:",
            sessionIdFromUrl
          );
        }
      }

      if (!targetPayment) {
        console.log("ℹ️ No valid payment found");
        return false;
      }

      let packageType = targetPayment.package_type;

      if (!packageType) {
        console.log("🔍 package_type missing, looking it up...");
        const { data: packageFromTransaction } = await supabase
          .from("packages")
          .select("package_type")
          .eq("transaction_id", targetPayment.transaction_id)
          .single();

        if (packageFromTransaction) {
          console.log(
            "✅ Found package_type via transaction:",
            packageFromTransaction.package_type
          );
          packageType = packageFromTransaction.package_type;
        }
      }

      if (packageType) {
        setPurchasedPackage({
          type: packageType,
          sessions: targetPayment.session_count,
        });

        console.log("🎁 Set purchased package:", {
          type: packageType,
          sessions: targetPayment.session_count,
        });
      }

      // Load all package sessions and calculate remaining
      const { data: packages, error: packagesError } = await supabase
        .from("packages")
        .select("*")
        .eq("client_id", user.id)
        .order("purchase_date", { ascending: false });

      if (packagesError) {
        console.error("❌ Failed to fetch all packages:", packagesError);
        return false;
      }

      const packageTypes: Record<string, PackageTypeCount> = {
        "In-Person Training": {
          type: "In-Person Training",
          remaining: 0,
          total: 0,
        },
        "Virtual Training": {
          type: "Virtual Training",
          remaining: 0,
          total: 0,
        },
        "Partner Training": {
          type: "Partner Training",
          remaining: 0,
          total: 0,
        },
        "Posing Package": {
          type: "Posing Package",
          remaining: 0,
          total: 0,
        },
      };

      packages.forEach((pkg) => {
        const type = pkg.package_type;
        if (packageTypes[type]) {
          const remaining =
            (pkg.sessions_included || 0) - (pkg.sessions_used || 0);
          packageTypes[type].remaining += remaining;
          packageTypes[type].total += pkg.sessions_included || 0;
        }
      });

      const sessionTypesArray = Object.values(packageTypes);
      setSessionsByType(sessionTypesArray);

      return true;
    } catch (error) {
      console.error("❌ Error in fetchPackageInformation:", error);
      return false;
    } finally {
      setLoadingPackages(false);
      setShouldFetchPackages(false);
    }
  };

  // Effect to handle initial mount and URL parameters
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    setIsClient(true);

    if (!hasShownMessage) {
      if (success === "true") {
        setShowSuccessDialog(true);
        setHasShownMessage(true);
        setShouldFetchPackages(true);
      } else if (canceled === "true") {
        setShowCanceledDialog(true);
        setHasShownMessage(true);
      }
    }
  }, []);

  // Effect to watch for user data and fetch packages when ready
  useEffect(() => {
    if (user?.id && shouldFetchPackages) {
      fetchPackageInformation().then((foundPackages) => {
        // If no packages found and we haven't exceeded retries, try again
        if (
          !foundPackages &&
          retryCount < MAX_RETRIES &&
          searchParams.get("success") === "true"
        ) {
          console.log(
            `🔄 No packages found, scheduling retry ${retryCount + 1} of ${MAX_RETRIES}...`
          );
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            setShouldFetchPackages(true);
          }, RETRY_DELAY);
        }
      });
    }
  }, [user, shouldFetchPackages, retryCount]);

  // Effect to handle URL parameter changes
  useEffect(() => {
    if (!isClient) return;

    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (!hasShownMessage) {
      if (success === "true") {
        setShowSuccessDialog(true);
        setHasShownMessage(true);
        setShouldFetchPackages(true);
      } else if (canceled === "true") {
        setShowCanceledDialog(true);
        setHasShownMessage(true);
      }
    }
  }, [searchParams, isClient]);

  // Clean up URL when dialog is closed
  useEffect(() => {
    if (!isClient) return;

    // Only clean up if we've shown the message and the dialog is now closed
    if (hasShownMessage && !showSuccessDialog && !showCanceledDialog) {
      const success = searchParams.get("success");
      const canceled = searchParams.get("canceled");

      if (success === "true" || canceled === "true") {
        console.log("Cleaning up URL parameters");
        window.history.replaceState({}, "", "/client/packages");
      }
    }
  }, [hasShownMessage, showSuccessDialog, showCanceledDialog, isClient]);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          router.push("/login");
          return;
        }

        if (!session?.user) {
          console.log("No session found, redirecting to login");
          router.push("/login");
          return;
        }

        setUser(session.user);
      } catch (error) {
        console.error("Error initializing user:", error);
        router.push("/login");
      }
    };

    initializeUser();
  }, []);

  // Validate promo code and fetch discount
  const validatePromoCode = useCallback(
    async (pkg: Package, section: PackageSection) => {
      const code = promoCodes[pkg.id]?.trim();
      if (!code) {
        setPromoErrors((prev) => ({ ...prev, [pkg.id]: "" }));
        setDiscountedPrices((prev) => ({ ...prev, [pkg.id]: null }));
        return;
      }
      setValidatingPromo(pkg.id);
      setPromoErrors((prev) => ({ ...prev, [pkg.id]: "" }));
      try {
        // Call a new API endpoint to validate and calculate discount
        const res = await fetch("/api/discount-codes/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            packageType: section.title.endsWith("Training")
              ? section.title
              : `${section.title} Training`,
            baseAmount: pkg.monthlyPrice * 100, // Convert to cents to match database
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.valid) {
          let friendlyError = FRIENDLY_PROMO_ERROR;
          if (data.error && data.error.toLowerCase().includes("expired")) {
            friendlyError =
              "This promo code has expired. Please try another one.";
          } else if (
            data.error &&
            data.error.toLowerCase().includes("server")
          ) {
            friendlyError =
              "There was a problem validating your code. Please try again later.";
          }
          setPromoErrors((prev) => ({ ...prev, [pkg.id]: friendlyError }));
          setDiscountedPrices((prev) => ({ ...prev, [pkg.id]: null }));
        } else {
          setPromoErrors((prev) => ({ ...prev, [pkg.id]: "" }));
          setDiscountedPrices((prev) => ({
            ...prev,
            [pkg.id]: data.discountedAmount,
          }));
        }
      } catch (e) {
        setPromoErrors((prev) => ({ ...prev, [pkg.id]: FRIENDLY_PROMO_ERROR }));
        setDiscountedPrices((prev) => ({ ...prev, [pkg.id]: null }));
      } finally {
        setValidatingPromo(null);
      }
    },
    [promoCodes]
  );

  const handleSingleSessionCheckout = async (sessionType: PackageType) => {
    if (!user?.id) {
      return;
    }

    try {
      setIsLoading('single-session');

      console.log("🛍️ Creating single session checkout with:", {
        userId: user.id,
        packageType: sessionType,
        sessionsIncluded: 1, // Single session
        purchaseOption: 'single_session', // Special option for single sessions
        promoCode: singleSessionPromoCode?.trim() || undefined,
      });

      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          packageType: sessionType,
          sessionsIncluded: 1, // Single session
          purchaseOption: 'single_session', // Special identifier
          promoCode: singleSessionPromoCode?.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Single session checkout error:", error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(null);
    }
  };

  const handleCheckout = async (pkg: Package, section: PackageSection) => {
    // Show purchase options modal instead of going directly to checkout
    setSelectedPackage(pkg);
    setSelectedSection(section);
    setSelectedPurchaseOption("current_month"); // Default to current month
    setShowPurchaseOptionsModal(true);
  };

  const handlePurchaseOption = async (purchaseOption: PurchaseOption) => {
    if (!selectedPackage || !selectedSection || !user?.id) {
      return;
    }

    try {
      setIsLoading(selectedPackage.id);

      // Ensure the package type is correctly formatted
      const packageType = selectedSection.title.endsWith("Training") || selectedSection.title === "Posing Package"
        ? selectedSection.title
        : `${selectedSection.title} Training`;

      console.log("🛍️ Creating checkout session with:", {
        userId: user.id,
        packageType,
        sessionsIncluded: selectedPackage.monthlySessionCount,
        purchaseOption,
        sectionTitle: selectedSection.title,
        validTypes: [
          "In-Person Training",
          "Virtual Training",
          "Partner Training",
          "Posing Package",
        ],
        promoCode: promoCodes[selectedPackage.id],
      });

      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          packageType: packageType,
          sessionsIncluded: selectedPackage.monthlySessionCount,
          purchaseOption: purchaseOption,
          promoCode: promoCodes[selectedPackage.id]?.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Checkout session error:", errorData);
        throw new Error(`Failed to create checkout session: ${errorData.error || response.statusText}`);
      }

      const { url } = await response.json();
      if (url) {
        console.log("✅ Redirecting to Stripe checkout:", url);
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      // Don't redirect to login for checkout errors, just show the error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Checkout failed: ${errorMessage}`);
    } finally {
      setIsLoading(null);
      setShowPurchaseOptionsModal(false);
      setSelectedPackage(null);
      setSelectedSection(null);
      setSelectedPurchaseOption(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Single Session Modal */}
      <Dialog
        open={showSingleSessionModal}
        onOpenChange={setShowSingleSessionModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2">
              Try a Single Session
            </DialogTitle>
            <DialogDescription className="text-center text-base text-gray-700 mb-4">
              Not ready to commit? Try one session for now and if you enjoy it,
              come back and try one of our many package options.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="text-lg font-semibold text-gray-800 text-center mb-2">
              Select Session Type
            </div>
            {(
              [
                "In-Person Training",
                "Virtual Training",
                "Partner Training",
              ] as PackageType[]
            ).map((type) => (
              <Button
                key={type}
                variant={selectedSessionType === type ? "default" : "outline"}
                className="w-full justify-start text-base py-3"
                onClick={() => setSelectedSessionType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-2 py-2">
            <div className="text-center text-lg font-semibold">
              Price: {singleSessionDiscountedPrice != null ? (
                <>
                  <span className="line-through text-gray-400 mr-2">$150</span>
                  <span className="text-green-700">${singleSessionDiscountedPrice}</span>
                </>
              ) : (
                <span className="text-green-700">$150</span>
              )}
            </div>
            <div className="flex flex-col gap-1 items-center mt-2">
              <label htmlFor="single-session-promo" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Promo Code (optional)
              </label>
              <div className="relative flex items-center w-full max-w-xs">
                <input
                  id="single-session-promo"
                  type="text"
                  value={singleSessionPromoCode}
                  onChange={e => {
                    setSingleSessionPromoCode(e.target.value);
                  }}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 pr-10 placeholder:text-xs dark:bg-gray-900 dark:text-gray-100"
                  placeholder="Enter Promo Code"
                  disabled={validatingSingleSessionPromo}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 focus:outline-none"
                  onClick={validateSingleSessionPromoCode}
                  disabled={validatingSingleSessionPromo || !singleSessionPromoCode.trim()}
                >
                  {validatingSingleSessionPromo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : singleSessionDiscountedPrice != null ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-300" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </button>
              </div>
              {singleSessionPromoError && (
                <div className="text-red-600 dark:text-red-400 text-xs mt-1">{singleSessionPromoError}</div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
              disabled={!selectedSessionType || isLoading === 'single-session'}
              onClick={() => {
                if (selectedSessionType) {
                  handleSingleSessionCheckout(selectedSessionType as PackageType);
                  setShowSingleSessionModal(false);
                  setSelectedSessionType(null);
                  setSingleSessionPromoCode("");
                  setSingleSessionPromoError("");
                  setSingleSessionDiscountedPrice(null);
                }
              }}
            >
              {isLoading === 'single-session' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Continue to Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Options Modal */}
      <Dialog
        open={showPurchaseOptionsModal}
        onOpenChange={setShowPurchaseOptionsModal}
      >
        <DialogContent className="sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col p-3 sm:p-6 m-4 sm:m-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle className="text-lg sm:text-2xl font-bold text-center mb-1 sm:mb-2 dark:text-gray-100">
              Choose Your Package Option
            </DialogTitle>
            <DialogDescription className="text-center text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-2 sm:mb-4">
              {selectedPackage && selectedSection && (
                <>
                  <strong className="dark:text-gray-100">
                    {selectedPackage.name}
                  </strong>{" "}
                  - {selectedSection.title}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 sm:gap-4 overflow-y-auto flex-1 min-h-0 pb-2">
            {/* Option 1: Full Package for Current Month */}
            <div
              className={`p-2 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedPurchaseOption === "current_month"
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
              onClick={() => setSelectedPurchaseOption("current_month")}
            >
              <div className="flex justify-between items-start mb-1 sm:mb-2">
                <div className="font-semibold text-sm sm:text-lg dark:text-gray-100">
                  Full Package - This Month
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                  Best Value
                </div>
              </div>
              <div className="text-xs sm:text-base text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Get all sessions for the current month. Great for intensive
                training.
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
                Sessions: {selectedPackage?.monthlySessionCount} sessions
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-1.5 sm:p-2 rounded border border-amber-200 dark:border-amber-700">
                ⚠️ Note: If purchased mid-month, you'll have less time to use
                all of your sessions for the month.
              </div>
            </div>

            {/* Option 2: Full Package for Next Month */}
            <div
              className={`p-2 sm:p-4 border-2 rounded-lg cursor-pointer transition-all mb-2 ${
                selectedPurchaseOption === "next_month"
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
              onClick={() => setSelectedPurchaseOption("next_month")}
            >
              <div className="flex justify-between items-start mb-1 sm:mb-2">
                <div className="font-semibold text-sm sm:text-lg dark:text-gray-100">
                  Full Package - Next Month
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                  Full Month
                </div>
              </div>
              <div className="text-xs sm:text-base text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Purchase the full package for the upcoming month. Perfect for
                planning ahead.
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Sessions: {selectedPackage?.monthlySessionCount} sessions
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 pt-2 sm:pt-4 border-t border-gray-200 dark:border-gray-700 mt-2 sm:mt-0">
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-sm sm:text-lg py-2.5 sm:py-4"
              disabled={
                !selectedPurchaseOption || isLoading === selectedPackage?.id
              }
              onClick={() =>
                selectedPurchaseOption &&
                handlePurchaseOption(selectedPurchaseOption)
              }
            >
              {isLoading === selectedPackage?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to Checkout"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowSuccessDialog(false);
            window.history.replaceState({}, "", "/client/packages");
            router.push("/client/booking");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl">
              <span className="text-2xl">🎉</span>
              Successful Purchase!
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Thank you for investing in your fitness journey!
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            {loadingPackages ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Newly Purchased Package Highlight */}
                {purchasedPackage && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center animate-fade-in">
                    <div className="text-green-600 text-sm font-medium mb-1">
                      Just Added
                    </div>
                    <div className="text-2xl font-bold text-green-700 mb-2">
                      +<CountUp end={purchasedPackage.sessions} duration={5} />{" "}
                      Sessions
                    </div>
                    <div className="text-green-600 font-medium">
                      {purchasedPackage.type}
                    </div>
                  </div>
                )}

                {/* Session summary */}
                <div className="space-y-3">
                  <div className="text-gray-600 text-sm font-medium text-center mb-2">
                    Your Available Sessions
                  </div>
                  {sessionsByType.map((packageType) => {
                    const isNewlyPurchased =
                      purchasedPackage?.type === packageType.type;
                    return (
                      <div
                        key={packageType.type}
                        className={`p-4 rounded-lg ${
                          isNewlyPurchased
                            ? "bg-green-50 border-2 border-green-200"
                            : packageType.remaining > 0
                              ? "bg-gray-50 border border-gray-200"
                              : "bg-gray-50 border border-gray-100"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="text-gray-700 font-medium">
                            {packageType.type}
                          </div>
                          <div className="text-sm">
                            <span
                              className={`font-semibold ${
                                isNewlyPurchased
                                  ? "text-green-600"
                                  : packageType.remaining > 0
                                    ? "text-gray-700"
                                    : "text-gray-500"
                              }`}
                            >
                              {isNewlyPurchased ? (
                                <CountUp
                                  end={packageType.remaining}
                                  duration={5}
                                />
                              ) : (
                                packageType.remaining
                              )}{" "}
                              sessions
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600 font-medium">
                    Time to crush those fitness goals! 💪
                  </p>
                  <p className="text-xs text-gray-500">
                    Your trainer can't wait to get started with you
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                router.push("/client/dashboard");
              }}
            >
              Go to Dashboard
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setShowSuccessDialog(false);
                router.push("/client/booking");
              }}
            >
              Book Your First Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Canceled Dialog */}
      <Dialog
        open={showCanceledDialog}
        onOpenChange={(open) => {
          setShowCanceledDialog(open);
          if (!open) {
            router.push("/client/packages");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Canceled</DialogTitle>
            <DialogDescription>
              Your package purchase was canceled. No charges have been made to
              your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowCanceledDialog(false);
                router.push("/client/packages");
              }}
            >
              Return to Packages
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-background dark:bg-gray-900 px-4 md:px-6">
        <SidebarTrigger>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SidebarTrigger>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Link href="/client/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Training Packages
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Package Type Filter */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col items-center space-y-4">
            {/* Try a Single Session Button - Always visible at top */}
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded shadow-lg font-semibold transition-all duration-150"
              onClick={() => {
                setSelectedSessionType(selectedPackageType); // Default to current filter
                setShowSingleSessionModal(true);
              }}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Try a Single Session
            </Button>

            {/* Package Type Slider */}
            <div className="w-full max-w-5xl">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 text-center mb-4">
                Choose Your Training Type
              </h3>
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-1 overflow-hidden">
                {/* Glossy red background slider */}
                <div 
                  className="absolute top-1 bottom-1 rounded-xl shadow-lg transition-all duration-500 ease-in-out transform bg-red-600"
                  style={{
                    width: `${100 / packageSections.length}%`,
                    left: `${(packageSections.findIndex(s => s.title === selectedPackageType) * 100) / packageSections.length}%`,
                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3), 0 4px 12px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Glossy highlight overlay */}
                  <div 
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(0, 0, 0, 0.1) 100%)'
                    }}
                  />
                </div>
                
                {/* Filter buttons */}
                <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-0">
                  {packageSections.map((section, index) => (
                    <button
                      key={section.title}
                      onClick={() => setSelectedPackageType(section.title as PackageType)}
                      className={`relative px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 rounded-xl z-10 hover:scale-[1.02] active:scale-[0.98] ${
                        selectedPackageType === section.title
                          ? 'text-white drop-shadow-sm transform scale-[1.01]'
                          : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <span className="font-medium leading-tight text-center tracking-wide">
                          {section.title === "In-Person Training" ? (
                            <>
                              <span className="block sm:hidden text-xs">In-Person</span>
                              <span className="hidden sm:block lg:hidden text-sm">In-Person</span>
                              <span className="hidden lg:block">In-Person Training</span>
                            </>
                          ) : section.title === "Virtual Training" ? (
                            <>
                              <span className="block sm:hidden text-xs">Virtual</span>
                              <span className="hidden sm:block lg:hidden text-sm">Virtual</span>
                              <span className="hidden lg:block">Virtual Training</span>
                            </>
                          ) : section.title === "Partner Training" ? (
                            <>
                              <span className="block sm:hidden text-xs">Partner</span>
                              <span className="hidden sm:block lg:hidden text-sm">Partner</span>
                              <span className="hidden lg:block">Partner Training</span>
                            </>
                          ) : section.title === "Posing Package" ? (
                            <>
                              <span className="block sm:hidden text-xs">Posing</span>
                              <span className="hidden sm:block lg:hidden text-sm">Posing</span>
                              <span className="hidden lg:block">Posing Package</span>
                            </>
                          ) : section.title}
                        </span>
                        
                        {/* Active indicator line */}
                        <div className={`w-8 sm:w-12 h-0.5 rounded-full transition-all duration-300 ${
                          selectedPackageType === section.title 
                            ? 'bg-white/60 shadow-sm' 
                            : 'bg-transparent'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 sm:space-y-12">
          {packageSections
            .filter((section) => section.title === selectedPackageType)
            .map((section) => (
            <div key={section.title} className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {section.title}
                  </h2>
                  <p className="mt-1 sm:mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-400">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                {section.packages.map((pkg) => (
                  <div key={pkg.id} className="relative pt-3">
                    {/* Top center badge - positioned above the card */}
                    {(pkg.sessionsPerWeek === 4 || (pkg.sessionsPerWeek > 2 && pkg.sessionsPerWeek !== 4)) && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                        {pkg.sessionsPerWeek === 4 && (
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse whitespace-nowrap">
                            ⭐ MOST POPULAR
                          </span>
                        )}
                        {pkg.sessionsPerWeek > 2 && pkg.sessionsPerWeek !== 4 && (
                          <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                            Popular
                          </span>
                        )}
                      </div>
                    )}

                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden group hover:scale-[1.02]">
                      {/* Header with package name */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white leading-tight text-center">
                          {pkg.name}
                        </h3>
                      </div>

                    {/* Price section */}
                    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 lg:py-6">
                      <div className="text-center mb-4 sm:mb-5 lg:mb-6">
                        <div className="flex items-baseline justify-center gap-1">
                          {discountedPrices[pkg.id] != null ? (
                            <>
                              <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-red-600 dark:text-red-400">
                                ${discountedPrices[pkg.id]}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-500 line-through ml-1 sm:ml-2">
                                ${pkg.monthlyPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 dark:text-white">
                              ${pkg.monthlyPrice}
                            </span>
                          )}
                          <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">
                            {section.title === "Posing Package" && pkg.sessionsPerWeek === 0 
                              ? "total" 
                              : "/month"}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                          ${pkg.hourlyRate}/hour • {pkg.monthlySessionCount} sessions/month
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 lg:mb-6">
                        <div className="flex items-center justify-center text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          {section.title === "Posing Package" && pkg.sessionsPerWeek === 0 ? (
                            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center">
                              No Commitment
                            </div>
                          ) : (
                            <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center">
                              {pkg.sessionsPerWeek}x per week
                            </div>
                          )}
                        </div>
                        <div className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {pkg.monthlySessionCount} session{pkg.monthlySessionCount > 1 ? 's' : ''} 
                          {section.title === "Posing Package" && pkg.sessionsPerWeek === 0 ? " included" : " per month"}
                        </div>
                      </div>

                      {/* Detailed features list */}
                      <div className="space-y-3 mb-4 sm:mb-5 lg:mb-6">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                                {pkg.sessionsPerWeek}x sessions per week
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                                {pkg.monthlySessionCount} sessions per month
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                                ${pkg.hourlyRate} per hour
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Promo code section */}
                      <div className="mb-4 sm:mb-5 lg:mb-6">
                        <label htmlFor={`promo-code-${pkg.id}`} className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                          Promo Code (optional)
                        </label>
                        <div className="relative">
                          <input
                            id={`promo-code-${pkg.id}`}
                            type="text"
                            value={promoCodes[pkg.id] || ""}
                            onChange={(e) => {
                              setPromoCodes((prev) => ({
                                ...prev,
                                [pkg.id]: e.target.value,
                              }));
                            }}
                            className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-red-500 dark:focus:border-red-400 placeholder:text-gray-400 dark:bg-gray-800 dark:text-gray-100 text-xs sm:text-sm transition-colors"
                            placeholder="Enter Promo Code"
                            disabled={
                              isLoading === pkg.id || validatingPromo === pkg.id
                            }
                            autoComplete="off"
                          />
                          <button
                            type="button"
                            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 focus:outline-none transition-colors"
                            onClick={() => validatePromoCode(pkg, section)}
                            disabled={
                              isLoading === pkg.id ||
                              validatingPromo === pkg.id ||
                              !promoCodes[pkg.id]?.trim()
                            }
                          >
                            {validatingPromo === pkg.id ? (
                              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                            ) : discountedPrices[pkg.id] != null ? (
                              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </button>
                        </div>
                        {promoErrors[pkg.id] && (
                          <div className="text-red-500 dark:text-red-400 text-xs mt-2 text-center bg-red-50 dark:bg-red-900/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                            {promoErrors[pkg.id]}
                          </div>
                        )}
                      </div>

                      {/* Purchase button */}
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-[1.02]"
                        onClick={() => handleCheckout(pkg, section)}
                        disabled={isLoading === pkg.id}
                      >
                        {isLoading === pkg.id ? (
                          <>
                            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          "Purchase Package"
                        )}
                      </Button>
                    </div>
                  </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading packages...
            </p>
          </div>
        </div>
      }
    >
      <PackagesContent />
    </Suspense>
  );
}
