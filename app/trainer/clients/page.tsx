"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MoreHorizontal,
  MessageSquare,
  Loader2,
  Trash2,
  AlertTriangle,
  BarChart,
  Gift,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { startOfMonth } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Interface for real client data
interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  google_account_connected: boolean;
  contract_accepted: boolean;
  created_at: string;
  packages?: PackageInfo[];
}

interface PackageInfo {
  client_id: string;
  client_name?: string;
  package_type: string;
  sessions_included: number;
  sessions_used: number;
  remaining: number;
}

const mockClients = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@email.com",
    phone: "+1 (555) 123-4567",
    sessionsRemaining: 8,
    totalSessions: 24,
    lastSession: "2024-01-12",
    nextSession: "2024-01-15 10:00",
    status: "active",
    joinDate: "2023-12-01",
    totalSpent: 1440,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@email.com",
    phone: "+1 (555) 234-5678",
    sessionsRemaining: 3,
    totalSessions: 15,
    lastSession: "2024-01-10",
    nextSession: "2024-01-16 14:00",
    status: "active",
    joinDate: "2023-11-15",
    totalSpent: 900,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Emma Davis",
    email: "emma@email.com",
    phone: "+1 (555) 345-6789",
    sessionsRemaining: 0,
    totalSessions: 12,
    lastSession: "2024-01-08",
    nextSession: null,
    status: "payment_due",
    joinDate: "2023-10-20",
    totalSpent: 720,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "James Wilson",
    email: "james@email.com",
    phone: "+1 (555) 456-7890",
    sessionsRemaining: 12,
    totalSessions: 18,
    lastSession: "2024-01-11",
    nextSession: "2024-01-18 09:00",
    status: "active",
    joinDate: "2023-09-10",
    totalSpent: 1080,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Lisa Rodriguez",
    email: "lisa@email.com",
    phone: "+1 (555) 567-8901",
    sessionsRemaining: 5,
    totalSessions: 30,
    lastSession: "2024-01-13",
    nextSession: "2024-01-17 11:00",
    status: "active",
    joinDate: "2023-08-05",
    totalSpent: 1800,
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

export default function TrainerClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "no_upcoming" | "new_this_month"
  >("all");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  
  // Add Sessions Modal State
  const [showAddSessionsModal, setShowAddSessionsModal] = useState(false);
  const [selectedClientForSessions, setSelectedClientForSessions] = useState<Client | null>(null);
  const [sessionType, setSessionType] = useState("");
  const [numSessions, setNumSessions] = useState("1");
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  const [clientsWithNoUpcoming, setClientsWithNoUpcoming] = useState<number>(0);
  const [newClientsThisMonth, setNewClientsThisMonth] = useState<number>(0);
  const sessionsDataRef = useRef<any[]>([]);

  // Fetch package information for clients
  const fetchPackageInfo = async (clientIds: string[]) => {
    try {
      const { data: packageData, error: packageError } = await supabase
        .from("packages")
        .select(
          `
          client_id,
          package_type,
          sessions_included,
          sessions_used
        `
        )
        .in("client_id", clientIds);

      if (packageError) {
        console.error("Error fetching package info:", packageError);
        return [];
      }

      // Calculate remaining sessions for each package
      const packagesWithRemaining = (packageData || []).map((pkg) => ({
        ...pkg,
        remaining: Math.max(0, pkg.sessions_included - pkg.sessions_used),
      }));

      return packagesWithRemaining;
    } catch (error) {
      console.error("Error in fetchPackageInfo:", error);
      return [];
    }
  };

  // Fetch clients data
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current trainer's session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/login");
        return;
      }

      // Fetch all clients with their info
      const { data: clientsData, error: clientsError } = await supabase
        .from("users")
        .select(
          `
          id,
          full_name,
          email,
          avatar_url,
          google_account_connected,
          contract_accepted,
          created_at
        `
        )
        .eq("role", "client")
        .order("created_at", { ascending: false });

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        setError("Failed to fetch clients");
        return;
      }

      // Process avatar URLs for each client
      const processedClients = await Promise.all(
        (clientsData || []).map(async (client) => {
          let avatarUrl = client.avatar_url;
          if (avatarUrl) {
            const { data: publicUrl } = supabase.storage
              .from("avatars")
              .getPublicUrl(avatarUrl);
            avatarUrl = publicUrl.publicUrl;
          }

          return {
            ...client,
            avatar_url: avatarUrl,
          };
        })
      );

      // Fetch package information for all clients
      const clientIds = processedClients.map((client) => client.id);
      const packageData = await fetchPackageInfo(clientIds);

      // Group packages by client_id
      const packagesByClient: Record<string, PackageInfo[]> = {};
      packageData.forEach((pkg) => {
        if (!packagesByClient[pkg.client_id]) {
          packagesByClient[pkg.client_id] = [];
        }
        packagesByClient[pkg.client_id].push(pkg);
      });

      // Add packages to each client
      const clientsWithPackages = processedClients.map((client) => ({
        ...client,
        packages: packagesByClient[client.id] || [],
      }));

      setClients(clientsWithPackages);

      // New Clients This Month
      const now = new Date();
      const monthStart = startOfMonth(now);
      setNewClientsThisMonth(
        processedClients.filter((c) => new Date(c.created_at) >= monthStart)
          .length
      );

      // Clients With No Upcoming Sessions
      // Fetch all sessions for this trainer
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("id, client_id, date")
        .eq("trainer_id", session.user.id);
      if (sessionsError) {
        setClientsWithNoUpcoming(0);
      } else {
        const today = new Date().toISOString().slice(0, 10);
        // Map client_id to array of future sessions
        const clientFutureSessions: Record<string, boolean> = {};
        for (const c of processedClients) clientFutureSessions[c.id] = false;
        (sessionsData || []).forEach((s) => {
          if (s.date >= today) clientFutureSessions[s.client_id] = true;
        });
        const noUpcomingCount = Object.values(clientFutureSessions).filter(
          (v) => !v
        ).length;
        setClientsWithNoUpcoming(noUpcomingCount);
      }

      sessionsDataRef.current = sessionsData || [];
    } catch (error) {
      console.error("Error in fetchClients:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Filter clients based on search and status
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = client.google_account_connected;
    } else if (statusFilter === "no_upcoming") {
      matchesStatus = !clientHasUpcomingSession(client.id);
    } else if (statusFilter === "new_this_month") {
      const now = new Date();
      const monthStart = startOfMonth(now);
      matchesStatus = new Date(client.created_at) >= monthStart;
    }

    return matchesSearch && matchesStatus;
  });

  // Helper to check if a client has an upcoming session
  function clientHasUpcomingSession(clientId: string) {
    // Use the same logic as the stat card
    if (!sessionsDataRef.current) return false;
    const today = new Date().toISOString().slice(0, 10);
    return sessionsDataRef.current.some(
      (s) => s.client_id === clientId && s.date >= today
    );
  }

  const getStatusColor = (client: Client) => {
    if (client.google_account_connected) {
      return "bg-green-100 text-green-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (client: Client) => {
    if (client.google_account_connected) {
      return "Active";
    } else {
      return "Inactive";
    }
  };

  // Helper function to render package information
  const renderPackageInfo = (client: Client) => {
    if (!client.packages || client.packages.length === 0) {
      return (
        <div className="text-sm text-gray-500 mt-1">No active packages</div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
        {client.packages.map((pkg, index) => (
          <div
            key={`${pkg.package_type}-${index}`}
            className="flex items-center space-x-1 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs"
          >
            <span className="font-medium text-gray-700">
              {pkg.package_type}:
            </span>
            <span
              className={`font-bold ${
                pkg.remaining > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {pkg.remaining} remaining
            </span>
            <span className="text-gray-500">
              ({pkg.sessions_used}/{pkg.sessions_included})
            </span>
          </div>
        ))}
      </div>
    );
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    try {
      setDeletingClientId(clientId);

      const response = await fetch("/api/trainer/delete-client", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete client");
      }

      // Remove the client from the local state
      setClients((prevClients) =>
        prevClients.filter((client) => client.id !== clientId)
      );

      toast({
        title: "Client Deleted",
        description: `Successfully deleted ${clientName} and all associated data.`,
      });
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete client",
        variant: "destructive",
      });
    } finally {
      setDeletingClientId(null);
    }
  };

  // Handle opening Add Sessions modal for a specific client
  const handleOpenAddSessions = (client: Client) => {
    setSelectedClientForSessions(client);
    setSessionType("");
    setNumSessions("1");
    setShowAddSessionsModal(true);
  };

  // Handle submitting Add Sessions
  const handleSubmitAddSessions = async () => {
    if (!selectedClientForSessions) return;
    
    setIsAddingSession(true);
    try {
      const numSessionsNum = parseInt(numSessions);

      // Check for existing package
      const { data: existing, error: pkgError } = await supabase
        .from("packages")
        .select("id, sessions_included, original_sessions")
        .eq("client_id", selectedClientForSessions.id)
        .eq("package_type", sessionType)
        .eq("status", "active")
        .single();
      
      if (pkgError && pkgError.code !== "PGRST116") throw pkgError;
      
      if (existing) {
        // Add sessions to existing package
        const { error: updateError } = await supabase
          .from("packages")
          .update({
            sessions_included: existing.sessions_included + numSessionsNum,
            original_sessions: (existing.original_sessions || 0) + numSessionsNum,
          })
          .eq("id", existing.id);
        
        if (updateError) throw updateError;
        
        setSuccessMessage(
          `Added ${numSessionsNum} session(s) to ${selectedClientForSessions.full_name}'s existing package.`
        );
      } else {
        // Create new package
        const { error: createError } = await supabase.from("packages").insert({
          client_id: selectedClientForSessions.id,
          package_type: sessionType,
          sessions_included: numSessionsNum,
          original_sessions: numSessionsNum,
          status: "active",
          purchase_date: new Date().toISOString().split("T")[0],
        });
        
        if (createError) throw createError;
        
        setSuccessMessage(
          `Created new package and added ${numSessionsNum} session(s) to ${selectedClientForSessions.full_name}.`
        );
      }
      
      setShowSuccessDialog(true);
      setShowAddSessionsModal(false);
      setShowConfirmDialog(false);
      
      // Refresh client data to show updated packages
      await fetchClients();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAddingSession(false);
    }
  };

  return (
    <>
      <header className="border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2.5 sm:space-y-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 lg:space-x-4">
            <SidebarTrigger />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Clients
            </h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Add a new client to your training roster
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="john@email.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input placeholder="+1 (555) 123-4567" />
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Add Client
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-3 sm:p-4 lg:p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Clients
                  </p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {loading ? (
                      <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin" />
                    ) : (
                      clients.length
                    )}
                  </p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Active Clients
                  </p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {loading ? (
                      <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin" />
                    ) : (
                      clients.filter((c) => c.google_account_connected).length
                    )}
                  </p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    New This Month
                  </p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {loading ? (
                      <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin" />
                    ) : (
                      newClientsThisMonth
                    )}
                  </p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    No Sessions
                  </p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {loading ? (
                      <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin" />
                    ) : (
                      clientsWithNoUpcoming
                    )}
                  </p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-3 sm:mb-4 lg:mb-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Client Management
            </CardTitle>
            <CardDescription>Search and filter your clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  className={`text-xs sm:text-sm px-3 py-1.5 h-8 ${
                    statusFilter === "all" ? "bg-red-600 hover:bg-red-700" : ""
                  }`}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  onClick={() => setStatusFilter("active")}
                  className={`text-xs sm:text-sm px-3 py-1.5 h-8 ${
                    statusFilter === "active"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }`}
                >
                  Active
                </Button>
                <Button
                  variant={
                    statusFilter === "no_upcoming" ? "default" : "outline"
                  }
                  onClick={() => setStatusFilter("no_upcoming")}
                  className={`text-xs sm:text-sm px-3 py-1.5 h-8 ${
                    statusFilter === "no_upcoming"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }`}
                >
                  <span className="hidden sm:inline">No Upcoming Sessions</span>
                  <span className="sm:hidden">No Sessions</span>
                </Button>
                <Button
                  variant={
                    statusFilter === "new_this_month" ? "default" : "outline"
                  }
                  onClick={() => setStatusFilter("new_this_month")}
                  className={`text-xs sm:text-sm px-3 py-1.5 h-8 ${
                    statusFilter === "new_this_month"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }`}
                >
                  <span className="hidden sm:inline">New This Month</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client List */}
        <Card>
          <CardHeader>
            <CardTitle>Clients ({filteredClients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                <span className="ml-2 text-gray-600">Loading clients...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchClients} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No clients found</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors space-y-2.5 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-2.5 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                        <AvatarImage
                          src={client.avatar_url || "/placeholder-user.jpg"}
                          alt={client.full_name}
                        />
                        <AvatarFallback className="bg-red-600 text-white text-sm">
                          {client.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-base sm:text-lg truncate">
                          {client.full_name}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          <span className="hidden sm:inline">
                            Joined:{" "}
                            {new Date(client.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="sm:hidden text-xs text-gray-500 mt-1">
                          <span>
                            Joined:{" "}
                            {new Date(client.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {renderPackageInfo(client)}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1.5 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                      <Badge className={`text-xs ${getStatusColor(client)}`}>
                        {getStatusText(client)}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            router.push("/trainer/messages");
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                const encodedClientName = encodeURIComponent(
                                  client.full_name
                                );
                                router.push(
                                  `/trainer/schedule?client=${encodedClientName}`
                                );
                              }}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              View Sessions
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const encodedClientName = encodeURIComponent(
                                  client.full_name
                                );
                                router.push(
                                  `/trainer/payments?client=${encodedClientName}`
                                );
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              View Payments
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                router.push(
                                  `/trainer/analytics?client=${client.id}`
                                );
                              }}
                            >
                              <BarChart className="h-4 w-4 mr-2" />
                              Past Sessions
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenAddSessions(client)}
                            >
                              <Gift className="h-4 w-4 mr-2" />
                              Add Free Sessions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                  disabled={deletingClientId === client.id}
                                >
                                  {deletingClientId === client.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                  )}
                                  Delete Client
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    Delete Client
                                  </AlertDialogTitle>
                                </AlertDialogHeader>
                                <div className="text-sm text-muted-foreground">
                                  <p>
                                    Are you sure you want to delete{" "}
                                    <strong>{client.full_name}</strong>? This
                                    action will permanently remove:
                                  </p>
                                  <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>All client profile data</li>
                                    <li>All training sessions</li>
                                    <li>All payment records</li>
                                    <li>All package information</li>
                                    <li>All contracts and agreements</li>
                                  </ul>
                                  <p className="mt-3 font-semibold text-red-600">
                                    This action cannot be undone.
                                  </p>
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteClient(
                                        client.id,
                                        client.full_name
                                      )
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Client
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Sessions Modal */}
      <Dialog open={showAddSessionsModal} onOpenChange={setShowAddSessionsModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Add Sessions to {selectedClientForSessions?.full_name}</DialogTitle>
            <DialogDescription>
              Select session type and number of sessions to add to this client's package.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Session Type</Label>
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select session type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-Person Training">In-Person Training</SelectItem>
                  <SelectItem value="Virtual Training">Virtual Training</SelectItem>
                  <SelectItem value="Partner Training">Partner Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Number of Sessions</Label>
              <Input
                type="number"
                min={1}
                value={numSessions}
                onChange={(e) => setNumSessions(e.target.value)}
                placeholder="Enter number of sessions"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowAddSessionsModal(false)}
              className="w-full"
              disabled={isAddingSession}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={
                isAddingSession ||
                !sessionType ||
                !numSessions ||
                parseInt(numSessions) < 1
              }
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Add Sessions
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Confirm Add Sessions</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              <span className="font-bold text-blue-700">
                give {numSessions} free session(s)
              </span>{" "}
              of{" "}
              <span className="font-bold">
                {sessionType}
              </span>{" "}
              to{" "}
              <span className="font-bold">
                {selectedClientForSessions?.full_name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="w-full"
              disabled={isAddingSession}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAddSessions}
              disabled={isAddingSession}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isAddingSession ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <Gift className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-green-800 text-center">
              Sessions Added Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2 text-center">
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              onClick={() => setShowSuccessDialog(false)}
            >
              Great! Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
