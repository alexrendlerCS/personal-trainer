"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Search,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  QrCode,
  CreditCard,
  BarChart3,
  Dumbbell,
  Filter,
} from "lucide-react";
import { ContractFlowModal } from "@/components/ContractFlowModal";
import GoogleCalendarPopup from "@/components/GoogleCalendarPopup";
import GoogleCalendarSuccessDialog from "@/components/GoogleCalendarSuccessDialog";
import { GoogleCalendarBanner } from "@/components/GoogleCalendarBanner";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";

const mockClients = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@email.com",
    sessions: 8,
    nextSession: "2024-01-15 10:00",
    status: "active",
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@email.com",
    sessions: 3,
    nextSession: "2024-01-16 14:00",
    status: "active",
  },
  {
    id: 3,
    name: "Emma Davis",
    email: "emma@email.com",
    sessions: 0,
    nextSession: null,
    status: "payment_due",
  },
];

const mockSessions = [
  {
    id: 1,
    client: "Sarah Johnson",
    time: "10:00 AM",
    date: "2024-01-15",
    type: "Personal Training",
    status: "scheduled",
  },
  {
    id: 2,
    client: "Mike Chen",
    time: "2:00 PM",
    date: "2024-01-16",
    type: "Strength Training",
    status: "scheduled",
  },
  {
    id: 3,
    client: "Emma Davis",
    time: "11:00 AM",
    date: "2024-01-17",
    type: "Cardio Session",
    status: "pending_payment",
  },
];

interface ModalProps {
  onAccept?: () => Promise<void>;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

// Add URL parameter handler component
function URLParamHandler({
  onSuccess,
  onError,
}: {
  onSuccess: (calendarName: string) => void;
  onError: (error: string) => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Only run once on mount
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const calendarNameParam = searchParams.get("calendarName");

    if (success === "true" && calendarNameParam) {
      onSuccess(decodeURIComponent(calendarNameParam));
      // Use router.replace instead of window.history for better Next.js integration
      router.replace(window.location.pathname);
    } else if (error) {
      console.error("OAuth error:", error);
      onError(decodeURIComponent(error));
      router.replace(window.location.pathname);
    }
  }, []); // Empty dependency array since we only want this to run once on mount

  return null;
}

// Add Google Calendar section component
function GoogleCalendarSection({
  isConnected,
  onConnect,
}: {
  isConnected: boolean;
  onConnect: () => void;
}) {
  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <span className="text-sm text-muted-foreground">
          Google Calendar connected
        </span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center space-x-2"
      onClick={onConnect}
    >
      <Calendar className="h-4 w-4" />
      <span>Connect Google Calendar</span>
    </Button>
  );
}

export default function TrainerDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showContractModal, setShowContractModal] = useState(false);
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [showGoogleSuccess, setShowGoogleSuccess] = useState(false);
  const [userStatus, setUserStatus] = useState({
    contractAccepted: false,
    googleConnected: false,
    userName: "",
    avatarUrl: null as string | null,
  });
  const supabase = createClient();
  const router = useRouter();
  const [totalClients, setTotalClients] = useState<number | null>(null);
  const [clientsThisMonth, setClientsThisMonth] = useState<number>(0);
  const [clientsLastMonth, setClientsLastMonth] = useState<number>(0);
  const [todaysSessions, setTodaysSessions] = useState<any[]>([]);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [upcomingSessions, setUpcomingSessions] = useState<number>(0);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [sessionsThisMonth, setSessionsThisMonth] = useState<number>(0);
  const [sessionsLastMonth, setSessionsLastMonth] = useState<number>(0);
  const [revenueThisMonth, setRevenueThisMonth] = useState<number>(0);
  const [revenueLastMonth, setRevenueLastMonth] = useState<number>(0);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState<number>(0);
  const [pendingPaymentsAmount, setPendingPaymentsAmount] = useState<number>(0);
  const [clientsWithSessions, setClientsWithSessions] = useState<any[]>([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrClient, setQrClient] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [selectedClientFilter, setSelectedClientFilter] =
    useState<string>("all");
  const [availableClients, setAvailableClients] = useState<any[]>([]);

  // Add OAuth success and error handlers
  const handleOAuthSuccess = useCallback((calendarName: string) => {
    setShowGoogleSuccess(true);
    setUserStatus((prev) => ({ ...prev, googleConnected: true }));
  }, []);

  const handleOAuthError = useCallback((error: string) => {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    });
  }, []);

  const checkUserStatus = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/login");
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(
          "contract_accepted, google_account_connected, full_name, avatar_url, role"
        )
        .eq("id", session.user.id)
        .single();

      if (userError) {
        console.error("Error fetching trainer data:", userError);
        return;
      }

      if (userData.role !== "trainer") {
        router.push("/client/dashboard");
        return;
      }

      if (userData) {
        const contractAccepted = userData.contract_accepted || false;
        const googleConnected = userData.google_account_connected || false;

        // Process avatar URL to get public URL from Supabase storage
        let avatarUrl = userData.avatar_url;
        if (avatarUrl) {
          const { data: publicUrl } = supabase.storage
            .from("avatars")
            .getPublicUrl(avatarUrl);
          avatarUrl = publicUrl.publicUrl;
        }

        setUserStatus({
          contractAccepted,
          googleConnected,
          userName: userData.full_name || "",
          avatarUrl: avatarUrl,
        });

        if (!contractAccepted) {
          setShowContractModal(true);
        } else if (!googleConnected) {
          setShowGooglePopup(true);
        }
      }
    } catch (error) {
      console.error("Error checking trainer status:", error);
    }
  }, [router, supabase]);

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  useEffect(() => {
    // Fetch total clients from users table
    async function fetchTotalClients() {
      const { data, error, count } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .eq("role", "client");
      if (error) {
        console.error("Error fetching total clients:", error);
        setTotalClients(null);
      } else {
        setTotalClients(count ?? (data ? data.length : 0));
      }
    }
    fetchTotalClients();

    // Fetch client growth for this and last month
    async function fetchClientGrowth() {
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // This month
      const { count: thisMonthCount, error: thisMonthError } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .eq("role", "client")
        .gte("created_at", startOfThisMonth.toISOString());
      if (thisMonthError) {
        console.error("Error fetching this month clients:", thisMonthError);
        setClientsThisMonth(0);
      } else {
        setClientsThisMonth(thisMonthCount ?? 0);
      }

      // Last month
      const { count: lastMonthCount, error: lastMonthError } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .eq("role", "client")
        .gte("created_at", startOfLastMonth.toISOString())
        .lte("created_at", endOfLastMonth.toISOString());
      if (lastMonthError) {
        console.error("Error fetching last month clients:", lastMonthError);
        setClientsLastMonth(0);
      } else {
        setClientsLastMonth(lastMonthCount ?? 0);
      }
    }
    fetchClientGrowth();

    // Fetch today's sessions for this trainer
    async function fetchTodaysSessions() {
      // Get trainer id from session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        return;
      }
      setTrainerId(session.user.id);
      const now = new Date();
      // Use local date instead of UTC to avoid timezone issues
      const todayStr = now.toLocaleDateString("en-CA"); // Returns YYYY-MM-DD format

      // Fetch all sessions for today for this trainer, joining users to get client name
      const { data: sessions, error } = await supabase
        .from("sessions")
        .select(
          `
          id,
          date,
          start_time,
          end_time,
          duration_minutes,
          type,
          status,
          client_id,
          notes,
          users:users!sessions_client_id_fkey (full_name, avatar_url, email)
        `
        )
        .eq("trainer_id", session.user.id)
        .eq("date", todayStr)
        .order("start_time", { ascending: true });
      if (error) {
        console.error("Error fetching today's sessions:", error);
        setTodaysSessions([]);
        setCompletedSessions(0);
        setUpcomingSessions(0);
        return;
      }
      // Process avatar URLs for each session
      const processedSessions = await Promise.all(
        (sessions ?? []).map(async (s) => {
          let userObj: any = s.users;
          if (Array.isArray(userObj)) {
            userObj = userObj.length > 0 ? userObj[0] : {};
          }
          if (userObj && typeof userObj === "object" && userObj.avatar_url) {
            const { data: publicUrl } = supabase.storage
              .from("avatars")
              .getPublicUrl(userObj.avatar_url);
            return {
              ...s,
              users: {
                ...userObj,
                avatar_public_url: publicUrl?.publicUrl || null,
              } as any,
            };
          }
          return {
            ...s,
            users:
              userObj && typeof userObj === "object" ? (userObj as any) : {},
          };
        })
      );
      setTodaysSessions(processedSessions ?? []);
      // Calculate completed and upcoming
      const nowTime = now.getTime();
      let completed = 0;
      let upcoming = 0;
      (processedSessions ?? []).forEach((s) => {
        let endDateTime;
        if (s.end_time) {
          endDateTime = new Date(`${s.date}T${s.end_time}`);
        } else if (s.start_time && s.duration_minutes) {
          const [hour, minute] = s.start_time.split(":").map(Number);
          const start = new Date(`${s.date}T${s.start_time}`);
          endDateTime = new Date(start.getTime() + s.duration_minutes * 60000);
        } else if (s.start_time) {
          const start = new Date(`${s.date}T${s.start_time}`);
          endDateTime = new Date(start.getTime() + 60 * 60000);
        } else {
          endDateTime = new Date(`${s.date}`);
        }
        if (
          endDateTime instanceof Date &&
          !isNaN(endDateTime.getTime()) &&
          endDateTime.getTime() < nowTime
        )
          completed++;
        else upcoming++;
      });
      setCompletedSessions(completed);
      setUpcomingSessions(upcoming);
    }
    fetchTodaysSessions();

    // Fetch monthly sessions for this trainer
    async function fetchMonthlySessions() {
      // Get trainer id from session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        return;
      }

      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // This month sessions
      const { data: thisMonthSessions, error: thisMonthError } = await supabase
        .from("sessions")
        .select("*")
        .eq("trainer_id", session.user.id)
        .gte("date", startOfThisMonth.toLocaleDateString("en-CA"))
        .lte("date", endOfThisMonth.toLocaleDateString("en-CA"));

      if (thisMonthError) {
        console.error("Error fetching this month sessions:", thisMonthError);
        setSessionsThisMonth(0);
      } else {
        setSessionsThisMonth(thisMonthSessions?.length ?? 0);
      }

      // Last month sessions
      const { data: lastMonthSessions, error: lastMonthError } = await supabase
        .from("sessions")
        .select("*")
        .eq("trainer_id", session.user.id)
        .gte("date", startOfLastMonth.toLocaleDateString("en-CA"))
        .lte("date", endOfLastMonth.toLocaleDateString("en-CA"));

      if (lastMonthError) {
        console.error("Error fetching last month sessions:", lastMonthError);
        setSessionsLastMonth(0);
      } else {
        setSessionsLastMonth(lastMonthSessions?.length ?? 0);
      }
    }
    fetchMonthlySessions();

    // Fetch monthly revenue for this trainer
    async function fetchMonthlyRevenue() {
      // Get trainer id from session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        return;
      }

      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Helper to format date as YYYY-MM-DD HH:mm:ss
      function formatDateWithTime(date: Date, isEndOfDay = false) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        if (isEndOfDay) {
          return `${year}-${month}-${day} 23:59:59`;
        } else {
          return `${year}-${month}-${day} 00:00:00`;
        }
      }

      // This month revenue
      const thisMonthStart = formatDateWithTime(startOfThisMonth);
      const thisMonthEnd = formatDateWithTime(endOfThisMonth, true);

      const { data: thisMonthPayments, error: thisMonthError } = await supabase
        .from("payments")
        .select("amount")
        .gte("paid_at", thisMonthStart)
        .lte("paid_at", thisMonthEnd)
        .eq("status", "completed");

      if (thisMonthError) {
        console.error("Error fetching this month payments:", thisMonthError);
        setRevenueThisMonth(0);
      } else {
        const totalThisMonth = (thisMonthPayments || []).reduce(
          (sum, payment) => {
            const parsedAmount = parseFloat(payment.amount || 0);
            return sum + parsedAmount;
          },
          0
        );
        setRevenueThisMonth(totalThisMonth);
      }

      // Last month revenue
      const lastMonthStart = formatDateWithTime(startOfLastMonth);
      const lastMonthEnd = formatDateWithTime(endOfLastMonth, true);

      const { data: lastMonthPayments, error: lastMonthError } = await supabase
        .from("payments")
        .select("amount")
        .gte("paid_at", lastMonthStart)
        .lte("paid_at", lastMonthEnd)
        .eq("status", "completed");

      if (lastMonthError) {
        console.error("Error fetching last month payments:", lastMonthError);
        setRevenueLastMonth(0);
      } else {
        const totalLastMonth = (lastMonthPayments || []).reduce(
          (sum, payment) => {
            const parsedAmount = parseFloat(payment.amount || 0);
            return sum + parsedAmount;
          },
          0
        );
        setRevenueLastMonth(totalLastMonth);
      }
    }
    fetchMonthlyRevenue();

    // Fetch pending payments
    async function fetchPendingPayments() {
      const { data: pendingPayments, error: pendingError } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "pending");

      if (pendingError) {
        console.error("Error fetching pending payments:", pendingError);
        setPendingPaymentsCount(0);
        setPendingPaymentsAmount(0);
      } else {
        const totalPendingAmount = (pendingPayments || []).reduce(
          (sum, payment) => {
            const parsedAmount = parseFloat(payment.amount || 0);
            return sum + parsedAmount;
          },
          0
        );

        setPendingPaymentsCount(pendingPayments?.length || 0);
        setPendingPaymentsAmount(totalPendingAmount);
      }
    }
    fetchPendingPayments();

    // Fetch clients with sessions
    async function fetchClientsWithSessions() {
      const { data: clients, error: clientsError } = await supabase
        .from("users")
        .select(
          "id, full_name, email, avatar_url, contract_accepted, google_account_connected"
        )
        .eq("role", "client");
      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        setClientsWithSessions([]);
        return;
      }
      // For each client, fetch their packages and compute sessions remaining
      const processedClients = await Promise.all(
        (clients ?? []).map(async (client: any) => {
          let avatar_public_url = null;
          if (client.avatar_url) {
            const { data: publicUrl } = supabase.storage
              .from("avatars")
              .getPublicUrl(client.avatar_url);
            avatar_public_url = publicUrl?.publicUrl || null;
          }
          // Fetch packages for this client
          const { data: packages, error: packagesError } = await supabase
            .from("packages")
            .select("sessions_included, sessions_used")
            .eq("client_id", client.id);
          let total_included = 0;
          let total_used = 0;
          if (packages && Array.isArray(packages)) {
            for (const pkg of packages) {
              total_included += pkg.sessions_included || 0;
              total_used += pkg.sessions_used || 0;
            }
          }
          const sessions_remaining = total_included - total_used;
          return {
            ...client,
            avatar_public_url,
            sessions_remaining,
          };
        })
      );
      setClientsWithSessions(processedClients);
    }

    // Function to fetch recent payments and available clients
    async function fetchRecentPayments() {
      try {
        const { data: payments, error } = await supabase
          .from("payments")
          .select(
            `
            id,
            amount,
            session_count,
            package_type,
            method,
            status,
            transaction_id,
            paid_at,
            client_id,
            users!payments_client_id_fkey (
              full_name,
              email
            )
          `
          )
          .order("paid_at", { ascending: false })
          .limit(10); // Increased limit to get more payments for filtering

        if (error) {
          console.error("Error fetching recent payments:", error);
          return;
        }
        setRecentPayments(payments || []);

        // Extract unique clients from payments for the filter
        const clientsFromPayments = (payments || [])
          .filter((payment) => payment.users)
          .map((payment) => {
            const userData = Array.isArray(payment.users)
              ? payment.users[0]
              : payment.users;
            return {
              id: payment.client_id,
              full_name: userData?.full_name || "Unknown Client",
              email: userData?.email || "",
            };
          })
          .filter(
            (client, index, self) =>
              index === self.findIndex((c) => c.id === client.id)
          );

        setAvailableClients(clientsFromPayments);
      } catch (error) {
        console.error("Error in fetchRecentPayments:", error);
      }
    }

    fetchClientsWithSessions();
    fetchRecentPayments();
  }, [supabase]);

  const handleContractComplete = useCallback(async () => {
    setUserStatus((prev) => ({ ...prev, contractAccepted: true }));
    setShowContractModal(false);
    await router.refresh();
    // Use the callback form to ensure we have the latest state
    setShowGooglePopup(true);
  }, [router]);

  const handleGoogleSuccess = useCallback(() => {
    setUserStatus((prev) => ({ ...prev, googleConnected: true }));
    setShowGooglePopup(false);
    setShowGoogleSuccess(true);
  }, []);

  // Add function to handle calendar connection
  const handleConnectCalendar = useCallback(() => {
    setShowGooglePopup(true);
  }, []);

  // Memoize the filtered clients to prevent unnecessary recalculations
  const filteredClients = useMemo(
    () =>
      mockClients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );

  // Memoize the filtered payments based on selected client
  const filteredPayments = useMemo(() => {
    if (selectedClientFilter === "all") {
      return recentPayments.slice(0, 4); // Show first 4 for "all"
    }
    return recentPayments
      .filter((payment) => payment.client_id === selectedClientFilter)
      .slice(0, 4);
  }, [recentPayments, selectedClientFilter]);

  // Memoize the modals to prevent unnecessary re-renders
  const modals = useMemo(
    () => (
      <>
        <ContractFlowModal
          open={showContractModal}
          onOpenChange={(open) => {
            setShowContractModal(open);
            if (!open) {
              router.push("/login");
            }
          }}
          onComplete={handleContractComplete}
        />

        <GoogleCalendarPopup
          open={showGooglePopup}
          onOpenChange={setShowGooglePopup}
          onSuccess={handleGoogleSuccess}
        />

        <GoogleCalendarSuccessDialog
          open={showGoogleSuccess}
          onOpenChange={setShowGoogleSuccess}
          calendarName="Training Sessions"
        />

        {(showGooglePopup || showGoogleSuccess) && (
          <URLParamHandler
            onSuccess={handleOAuthSuccess}
            onError={handleOAuthError}
          />
        )}
      </>
    ),
    [
      showContractModal,
      showGooglePopup,
      showGoogleSuccess,
      handleContractComplete,
      handleGoogleSuccess,
      handleOAuthSuccess,
      handleOAuthError,
      router,
    ]
  );

  // If contract not accepted, only show the contract modal
  if (!userStatus.contractAccepted) {
    return modals;
  }

  const handleSendPayment = async (clientId: string) => {
    try {
      // For now, use 'In-Person Training' as the packageType and 1 session
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: clientId,
          packageType: "In-Person Training",
          sessionsIncluded: 1,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }
      const { url } = await response.json();
      if (url) {
        window.open(url, "_blank");
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Send Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  const handleShowQr = (client: any) => {
    setQrClient(client);
    setQrModalOpen(true);
  };

  return (
    <>
      {modals}
      <div className="flex-1">
        <header className="border-b">
          <div className="flex flex-col sm:flex-row h-auto sm:h-16 items-start sm:items-center px-3 sm:px-4 gap-3 sm:gap-4 py-3 sm:py-0">
            <div className="flex items-center w-full sm:w-auto">
              <SidebarTrigger />
              <div className="flex-1 sm:flex-none sm:ml-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    className="pl-8 w-full sm:w-auto"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <GoogleCalendarSection
                isConnected={userStatus.googleConnected}
                onConnect={handleConnectCalendar}
              />
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Welcome Banner */}
          <Card className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                  <AvatarImage
                    src={userStatus.avatarUrl || "/placeholder-user.jpg"}
                    alt={userStatus.userName}
                    onError={(e) => {
                      console.error(
                        "Dashboard avatar image failed to load:",
                        e
                      );
                      console.log(
                        "Attempted avatar URL:",
                        userStatus.avatarUrl
                      );
                      // Force fallback to initials
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <AvatarFallback className="bg-white text-red-600 text-lg sm:text-xl font-bold">
                    {userStatus.userName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h2 className="text-lg sm:text-2xl font-bold">
                    Welcome back, {userStatus.userName}!
                  </h2>
                  <p className="text-red-100 text-sm sm:text-base">
                    {todaysSessions.length > 0
                      ? `You have ${todaysSessions.length} session${todaysSessions.length === 1 ? "" : "s"} scheduled for today`
                      : "No sessions scheduled for today"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">
                  Total Clients
                </CardTitle>
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {totalClients !== null ? (
                    totalClients
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {clientsThisMonth - clientsLastMonth >= 0 ? "+" : ""}
                  {clientsThisMonth - clientsLastMonth} from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">
                  Today's Sessions
                </CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {todaysSessions.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {completedSessions} completed, {upcomingSessions} upcoming
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">
                  Monthly Sessions
                </CardTitle>
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {sessionsThisMonth}
                </div>
                <p className="text-xs text-muted-foreground">
                  {sessionsThisMonth - sessionsLastMonth >= 0 ? "+" : ""}
                  {sessionsThisMonth - sessionsLastMonth} from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">
                  Monthly Revenue
                </CardTitle>
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  ${revenueThisMonth.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {revenueLastMonth > 0 ? (
                    <>
                      {revenueThisMonth >= revenueLastMonth ? "+" : ""}
                      {Math.round(
                        ((revenueThisMonth - revenueLastMonth) /
                          revenueLastMonth) *
                        100
                      )}
                      % from last month
                    </>
                  ) : (
                    "No revenue last month"
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">
                  Pending Payments
                </CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {pendingPaymentsCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  ${pendingPaymentsAmount.toLocaleString()} total pending
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-red-600" />
                  <span>Today's Schedule</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({todaysSessions.length} total, {completedSessions} completed,{" "}
                  {upcomingSessions} upcoming)
                </span>
              </CardTitle>
              <CardDescription>Manage your sessions for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysSessions.length === 0 ? (
                  <div className="text-center text-gray-400">
                    No sessions scheduled for today.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <TooltipProvider>
                      {todaysSessions.map((session) => {
                        // Format start and end time as 10:00 AM - 11:00 AM
                        const start = session.start_time
                          ? new Date(`${session.date}T${session.start_time}`)
                          : null;
                        let end: Date | null = null;
                        if (session.end_time) {
                          end = new Date(`${session.date}T${session.end_time}`);
                        } else if (
                          session.start_time &&
                          session.duration_minutes
                        ) {
                          const startDate = new Date(
                            `${session.date}T${session.start_time}`
                          );
                          end = new Date(
                            startDate.getTime() +
                            session.duration_minutes * 60000
                          );
                        } else if (session.start_time) {
                          const startDate = new Date(
                            `${session.date}T${session.start_time}`
                          );
                          end = new Date(startDate.getTime() + 60 * 60000);
                        }
                        const formatTime = (date: Date | null) =>
                          date
                            ? date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                            : "";
                        const formattedTime = `${formatTime(start)} - ${formatTime(end)}`;
                        // Status badge color
                        let badgeVariant:
                          | "default"
                          | "secondary"
                          | "destructive" = "default";
                        let badgeClass = "";
                        if (session.status === "confirmed") {
                          badgeVariant = "default";
                          badgeClass = "bg-green-500 text-white";
                        } else if (session.status === "completed") {
                          badgeVariant = "secondary";
                          badgeClass = "bg-gray-400 text-white";
                        } else if (session.status === "canceled") {
                          badgeVariant = "destructive";
                          badgeClass = "bg-red-500 text-white";
                        }
                        // Client info
                        const client = session.users || {};
                        const clientName = client.full_name || "Unknown Client";
                        const clientEmail = client.email || null;
                        const clientAvatarUrl =
                          client.avatar_public_url || "/placeholder-user.jpg";
                        // Avatar fallback: initials
                        const initials = clientName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase();
                        // Session notes (if available)
                        const notes = session.notes || null;
                        // Session detail link
                        const sessionDetailUrl = `/trainer/schedule/session/${session.id}`;
                        return (
                          <Card
                            key={session.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-3 sm:gap-4 w-full shadow-md"
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                                <span className="flex items-center text-sm sm:text-base font-medium text-gray-700">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-gray-500" />
                                  {formattedTime}
                                </span>
                                <span className="flex items-center font-bold text-sm sm:text-lg text-gray-900">
                                  <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-red-600" />
                                  {session.type}
                                </span>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center gap-2 cursor-pointer">
                                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                                      <AvatarImage
                                        src={clientAvatarUrl}
                                        alt={clientName}
                                        onError={(e) => {
                                          e.currentTarget.style.display =
                                            "none";
                                        }}
                                      />
                                      <AvatarFallback className="bg-red-600 text-white text-xs sm:text-sm">
                                        {initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-gray-800 text-sm sm:text-base">
                                      {clientName}
                                    </span>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="flex flex-col">
                                    {clientEmail && <span>{clientEmail}</span>}
                                    {notes && (
                                      <span className="text-xs text-gray-500 mt-1">
                                        {notes}
                                      </span>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                              <Badge
                                variant={badgeVariant}
                                className={`${badgeClass} text-xs`}
                              >
                                {session.status.charAt(0).toUpperCase() +
                                  session.status.slice(1)}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto text-xs sm:text-sm px-3 py-1.5 h-8"
                              onClick={() => {
                                // Navigate to schedule page with client filter
                                const encodedClientName =
                                  encodeURIComponent(clientName);
                                router.push(
                                  `/trainer/schedule?client=${encodedClientName}`
                                );
                              }}
                            >
                              View
                            </Button>
                          </Card>
                        );
                      })}
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Client Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-red-600" />
                  <span>Client Management</span>
                </CardTitle>
                <CardDescription>
                  Search and manage your clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {clientsWithSessions
                      .filter(
                        (client) =>
                          client.full_name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          client.email
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      )
                      .map((client) => (
                        <div
                          key={client.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-red-100 hover:border-l-4 hover:border-l-red-500 hover:shadow-md dark:hover:bg-red-950/30 dark:hover:border-l-red-600 transition-all duration-200 cursor-pointer gap-3 sm:gap-4"
                        >
                          {/* Left side - Client info */}
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                              <AvatarImage
                                src={
                                  client.avatar_public_url ||
                                  "/placeholder-user.jpg"
                                }
                                alt={client.full_name}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              <AvatarFallback className="bg-red-600 text-white text-xs sm:text-sm">
                                {client.full_name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm sm:text-base truncate">
                                {client.full_name}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500 truncate">
                                {client.email}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                {client.sessions_remaining} sessions remaining
                              </p>
                            </div>
                          </div>

                          {/* Right side - Badges and button */}
                          <div className="flex flex-wrap sm:flex-col lg:flex-row items-start sm:items-end lg:items-center gap-2 sm:gap-1 lg:gap-2 flex-shrink-0">
                            <div className="flex gap-2">
                              <Badge
                                variant={
                                  client.google_account_connected
                                    ? "default"
                                    : "secondary"
                                }
                                className={`text-xs ${client.google_account_connected
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-400 text-white"
                                  }`}
                              >
                                Google
                              </Badge>
                              <Badge
                                variant={
                                  client.contract_accepted
                                    ? "default"
                                    : "secondary"
                                }
                                className={`text-xs ${client.contract_accepted
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-400 text-white"
                                  }`}
                              >
                                Contract
                              </Badge>
                            </div>
                            {client.sessions_remaining === 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleShowQr(client)}
                                className="text-xs px-2 py-1 h-7 mt-1 sm:mt-0"
                              >
                                <QrCode className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">
                                  Send Payment
                                </span>
                                <span className="sm:hidden">Pay</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-red-600" />
                    <span>Recent Payments</span>
                  </div>
                  {/* Client Filter */}
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select
                      value={selectedClientFilter}
                      onValueChange={setSelectedClientFilter}
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        {availableClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription>
                  Track your recent transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => {
                      const userData = Array.isArray(payment.users)
                        ? payment.users[0]
                        : payment.users;
                      return (
                        <div
                          key={payment.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg space-y-2 sm:space-y-0 hover:bg-red-100 hover:border-l-4 hover:border-l-red-500 hover:shadow-md dark:hover:bg-red-950/30 dark:hover:border-l-red-600 transition-all duration-200 cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">
                              {userData?.full_name || "Unknown Client"}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {payment.session_count} sessions •{" "}
                              {payment.package_type}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {new Date(payment.paid_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-1">
                            <p className="font-bold text-green-600 text-sm sm:text-base">
                              ${payment.amount}
                            </p>
                            <Badge
                              variant="default"
                              className={`text-xs ${payment.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                            >
                              {payment.status === "completed"
                                ? "Completed"
                                : payment.status === "pending"
                                  ? "Pending"
                                  : "Failed"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>
                        {selectedClientFilter === "all"
                          ? "No recent payments found"
                          : "No payments found for selected client"}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => router.push("/trainer/payments")}
                >
                  View All Payments
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      {/* QR Code Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="flex flex-col items-center">
          <DialogHeader>
            <DialogTitle>Scan to Pay for Sessions</DialogTitle>
          </DialogHeader>
          {qrClient && (
            <>
              <div className="mb-4">
                <QRCodeCanvas
                  value={`${window.location.origin}/client/checkout?clientId=${encodeURIComponent(qrClient.id)}&packageType=In-Person%20Training&sessionsIncluded=8`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center">
                <div className="font-medium mb-1">{qrClient.full_name}</div>
                <div className="text-sm text-gray-500 mb-2">
                  {qrClient.email}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Scan this QR code to purchase 8 In-Person Training sessions
                </div>
                <a
                  href={`/client/checkout?clientId=${encodeURIComponent(qrClient.id)}&packageType=In-Person%20Training&sessionsIncluded=8`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-xs"
                >
                  Or click here if scanning doesn't work
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
