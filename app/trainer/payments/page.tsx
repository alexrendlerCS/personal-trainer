"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Download,
  Search,
  Calendar,
  CreditCard,
  TrendingUp,
  Filter,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { startOfMonth, subMonths, endOfMonth } from "date-fns";

interface Payment {
  id: string;
  client_id: string;
  amount: number;
  method: string;
  session_count: number;
  status: string;
  transaction_id: string;
  paid_at: string;
}

interface ClientMap {
  [clientId: string]: string;
}

export default function TrainerPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending" | "failed"
  >("all");
  const [dateRange, setDateRange] = useState("all");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clientMap, setClientMap] = useState<ClientMap>({});
  const [loading, setLoading] = useState(true);
  const [selectedClientFilter, setSelectedClientFilter] =
    useState<string>("all");
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [deletingPayment, setDeletingPayment] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  // Check authentication and user role
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userError || userData?.role !== "trainer") {
        return;
      }

      setUser(user);
    };

    checkAuth();
  }, [supabase]);

  // Debug: Log availableClients when it changes
  useEffect(() => {
    console.log("🔍 Available clients updated:", availableClients);
  }, [availableClients]);

  // Handle client search from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientParam = urlParams.get("client");
    if (clientParam) {
      const decodedClient = decodeURIComponent(clientParam);
      setSearchTerm(decodedClient);
    }
  }, []);

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      // Fetch all payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(
          "id, client_id, amount, method, session_count, status, transaction_id, paid_at"
        );
      if (paymentsError) {
        console.error("❌ Error fetching payments:", paymentsError);
        setPayments([]);
        setLoading(false);
        return;
      }
      console.log("✅ Payments data fetched:", paymentsData);
      setPayments(paymentsData || []);
      // Fetch all clients referenced in payments
      const clientIds = Array.from(
        new Set((paymentsData || []).map((p) => p.client_id))
      );
      console.log("🔍 Unique client IDs found:", clientIds);
      if (clientIds.length > 0) {
        console.log("🔍 Fetching clients for IDs:", clientIds);
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, full_name")
          .in("id", clientIds);

        if (usersError) {
          console.error("❌ Error fetching users:", usersError);
        } else {
          console.log("✅ Users data fetched:", usersData);
        }

        const map: ClientMap = {};
        const clientsList: any[] = [];
        (usersData || []).forEach((u) => {
          map[u.id] = u.full_name;
          clientsList.push({
            id: u.id,
            full_name: u.full_name,
          });
        });
        console.log("📋 Client map:", map);
        console.log("📋 Available clients list:", clientsList);
        setClientMap(map);
        setAvailableClients(clientsList);
      } else {
        console.log("⚠️ No client IDs found in payments");
      }
      setLoading(false);
    }
    fetchPayments();
  }, [supabase]);

  const filteredPayments = payments.filter((payment) => {
    const clientName = clientMap[payment.client_id] || "Unknown Client";
    const matchesSearch = clientName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    const matchesClientFilter =
      selectedClientFilter === "all" ||
      payment.client_id === selectedClientFilter;
    return matchesSearch && matchesStatus && matchesClientFilter;
  });

  // Calculate revenue for this month and last month
  const now = new Date();
  const monthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const revenueThisMonth = payments
    .filter(
      (p) =>
        p.status === "completed" &&
        p.paid_at &&
        new Date(p.paid_at) >= monthStart
    )
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const revenueLastMonth = payments
    .filter(
      (p) =>
        p.status === "completed" &&
        p.paid_at &&
        new Date(p.paid_at) >= lastMonthStart &&
        new Date(p.paid_at) <= lastMonthEnd
    )
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const revenueDiff = revenueThisMonth - revenueLastMonth;

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const completedPayments = payments.filter(
    (p) => p.status === "completed"
  ).length;
  const failedPayments = payments.filter((p) => p.status === "failed").length;

  // Calculate post-tax revenue for Colorado-based trainer
  const calculatePostTaxRevenue = (grossRevenue: number) => {
    // Stripe fees: 2.9% + 30 cents per transaction
    // For simplicity, we'll use an average fee rate of 3.2% (including the 30 cent flat fee)
    const stripeFeeRate = 0.032;
    const revenueAfterStripe = grossRevenue * (1 - stripeFeeRate);

    // Federal taxes for Colorado middle-income self-employed person (2024 rates)
    // Self-employment tax: 15.3% (12.4% Social Security + 2.9% Medicare)
    const selfEmploymentTaxRate = 0.153;

    // Income tax: Assuming 22% bracket for middle income ($47,151 - $100,525)
    // Note: This is simplified - actual rate depends on total annual income
    const federalIncomeTaxRate = 0.22;

    // Combined federal tax rate
    const federalTaxRate = selfEmploymentTaxRate + federalIncomeTaxRate; // 37.3%
    const revenueAfterFederalTax = revenueAfterStripe * (1 - federalTaxRate);

    // Colorado state tax: 4.4% flat rate (2024)
    const coloradoStateTaxRate = 0.044;
    const postTaxRevenue = revenueAfterFederalTax * (1 - coloradoStateTaxRate);

    return postTaxRevenue;
  };

  const postTaxRevenueThisMonth = calculatePostTaxRevenue(revenueThisMonth);
  const postTaxRevenueLastMonth = calculatePostTaxRevenue(revenueLastMonth);
  const postTaxRevenueDiff = postTaxRevenueThisMonth - postTaxRevenueLastMonth;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Client",
      "Date",
      "Amount",
      "Method",
      "Sessions",
      "Status",
      "Transaction ID",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredPayments.map((payment) =>
        [
          clientMap[payment.client_id] || "Unknown Client",
          payment.paid_at,
          payment.amount,
          payment.method,
          payment.session_count,
          payment.status,
          payment.transaction_id,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeletePayment = async (payment: Payment) => {
    setPaymentToDelete(payment);
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    if (!user) {
      setErrorMessage("You must be logged in to delete payments.");
      setShowErrorModal(true);
      return;
    }

    setDeletingPayment(paymentToDelete.id);
    try {
      const response = await fetch("/api/trainer/delete-payment", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentId: paymentToDelete.id }),
      });

      const result = await response.json();

      if (response.ok) {
        // Remove the payment from the local state
        setPayments((prev) => prev.filter((p) => p.id !== paymentToDelete.id));

        // Show success modal
        setSuccessMessage(
          `Payment deleted successfully. ${result.deletedSessions} sessions were removed and package was updated.`
        );
        setShowSuccessModal(true);
      } else {
        // Show error modal
        setErrorMessage(`Error deleting payment: ${result.error}`);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      setErrorMessage("Failed to delete payment. Please try again.");
      setShowErrorModal(true);
    } finally {
      setDeletingPayment(null);
      setPaymentToDelete(null);
    }
  };

  return (
    <div className="flex-1">
      <header className="border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Payments
            </h1>
          </div>
          <Button onClick={exportToCSV} className="bg-red-600 hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </header>

      <main className="p-6">
        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${revenueThisMonth.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {revenueLastMonth === 0
                      ? "No revenue last month"
                      : revenueDiff >= 0
                        ? `+$${revenueDiff.toLocaleString()} from last month`
                        : `-$${Math.abs(revenueDiff).toLocaleString()} from last month`}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Post-Tax Revenue
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    $
                    {postTaxRevenueThisMonth.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {postTaxRevenueLastMonth === 0
                      ? "No revenue last month"
                      : postTaxRevenueDiff >= 0
                        ? `+$${postTaxRevenueDiff.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} from last month`
                        : `-$${Math.abs(postTaxRevenueDiff).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} from last month`}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {completedPayments}
                  </p>
                  <p className="text-xs text-gray-500">Successful payments</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {failedPayments}
                  </p>
                  <p className="text-xs text-gray-500">Need attention</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Filters</CardTitle>
            <CardDescription>Search and filter payment records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value: any) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Payment Records ({filteredPayments.length})
                </CardTitle>
                <CardDescription>
                  Complete history of all payment transactions
                </CardDescription>
              </div>
              {/* Client Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select
                  value={selectedClientFilter}
                  onValueChange={setSelectedClientFilter}
                >
                  <SelectTrigger className="w-[200px]">
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
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {clientMap[payment.client_id] || "Unknown Client"}
                    </TableCell>
                    <TableCell>
                      {new Date(payment.paid_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-bold">
                      ${payment.amount}
                    </TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.session_count}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusText(payment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.transaction_id}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        {payment.status === "failed" && (
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Retry
                          </Button>
                        )}
                        <AlertDialog
                          open={paymentToDelete?.id === payment.id}
                          onOpenChange={(open) =>
                            !open && setPaymentToDelete(null)
                          }
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                              disabled={deletingPayment === payment.id}
                              onClick={() => handleDeletePayment(payment)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {deletingPayment === payment.id
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Payment
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this payment?
                                This action cannot be undone and will:
                              </AlertDialogDescription>

                              <div className="mt-4 space-y-4">
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                  <li>Remove the payment record</li>
                                  <li>Delete any associated sessions</li>
                                  <li>Update package session counts</li>
                                  <li>
                                    Potentially cancel the package if no
                                    sessions remain
                                  </li>
                                </ul>

                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                  <p className="text-sm text-blue-800 font-medium">
                                    📋 Payment Details:
                                  </p>
                                  <div className="text-xs text-blue-700 mt-1 space-y-1">
                                    <p>
                                      <strong>Client:</strong>{" "}
                                      {clientMap[payment.client_id] ||
                                        "Unknown Client"}
                                    </p>
                                    <p>
                                      <strong>Amount:</strong> ${payment.amount}
                                    </p>
                                    <p>
                                      <strong>Sessions:</strong>{" "}
                                      {payment.session_count}
                                    </p>
                                    <p>
                                      <strong>Method:</strong> {payment.method}
                                    </p>
                                    <p>
                                      <strong>Date:</strong>{" "}
                                      {new Date(
                                        payment.paid_at
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                  <p className="text-sm text-yellow-800 font-medium">
                                    ⚠️ Impact Warning:
                                  </p>
                                  <p className="text-xs text-yellow-700 mt-1">
                                    Deleting this payment will affect the
                                    client's session availability and package
                                    status. This action is irreversible and
                                    should only be used for correcting errors or
                                    refunds.
                                  </p>
                                </div>
                              </div>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setPaymentToDelete(null)}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => confirmDeletePayment()}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deletingPayment === payment.id}
                              >
                                {deletingPayment === payment.id
                                  ? "Deleting..."
                                  : "Delete Payment"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Payment Deleted Successfully
            </DialogTitle>
            <DialogDescription>{successMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Error Deleting Payment
            </DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
