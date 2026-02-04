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
        )
        .order("paid_at", { ascending: false });
      if (paymentsError) {
        console.error("❌ Error fetching payments:", paymentsError);
        setPayments([]);
        setLoading(false);
        return;
      }
      setPayments(paymentsData || []);
      // Fetch all clients referenced in payments
      const clientIds = Array.from(
        new Set((paymentsData || []).map((p) => p.client_id))
      );
      if (clientIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, full_name")
          .in("id", clientIds);

        if (usersError) {
          console.error("❌ Error fetching users:", usersError);
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
        setClientMap(map);
        setAvailableClients(clientsList);
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
      <header className="border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <SidebarTrigger />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Payments
            </h1>
          </div>
          <Button
            onClick={exportToCSV}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Revenue Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 truncate">
                    Total Revenue
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    ${revenueThisMonth.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {revenueLastMonth === 0
                      ? "No revenue last month"
                      : revenueDiff >= 0
                        ? `+$${revenueDiff.toLocaleString()} from last month`
                        : `-$${Math.abs(revenueDiff).toLocaleString()} from last month`}
                  </p>
                </div>
                <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 truncate">
                    Post-Tax Revenue
                  </p>
                  <p className="text-lg font-bold text-purple-600">
                    $
                    {postTaxRevenueThisMonth.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {postTaxRevenueLastMonth === 0
                      ? "No revenue last month"
                      : postTaxRevenueDiff >= 0
                        ? `+$${postTaxRevenueDiff.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} from last month`
                        : `-$${Math.abs(postTaxRevenueDiff).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} from last month`}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-purple-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 truncate">
                    Completed
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {completedPayments}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Successful payments
                  </p>
                </div>
                <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 truncate">
                    Failed
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    {failedPayments}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Need attention
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-red-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-3 sm:mb-4">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">
              Payment Filters
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Search and filter payment records
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full h-9"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Select
                  value={statusFilter}
                  onValueChange={(value: any) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-full sm:w-40 h-9">
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
                  <SelectTrigger className="w-full sm:w-40 h-9">
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
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Payment Records ({filteredPayments.length})
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Complete history of all payment transactions
                </CardDescription>
              </div>
              {/* Client Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <Select
                  value={selectedClientFilter}
                  onValueChange={setSelectedClientFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-9">
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
          <CardContent className="p-2 sm:p-6">
            {/* Mobile Card Layout */}
            <div className="block sm:hidden space-y-3">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-3 bg-white"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {clientMap[payment.client_id] || "Unknown Client"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.paid_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">${payment.amount}</p>
                      <Badge
                        className={`${getStatusColor(payment.status)} text-xs px-2 py-1`}
                      >
                        {getStatusText(payment.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                    <span>Method: {payment.method}</span>
                    <span>Sessions: {payment.session_count}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6 px-2 flex-1"
                    >
                      View
                    </Button>
                    {payment.status === "failed" && (
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-xs h-6 px-2 flex-1"
                      >
                        Retry
                      </Button>
                    )}
                    <AlertDialog
                      open={paymentToDelete?.id === payment.id}
                      onOpenChange={(open) => !open && setPaymentToDelete(null)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 text-xs h-6 px-2"
                          disabled={deletingPayment === payment.id}
                          onClick={() => handleDeletePayment(payment)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {deletingPayment === payment.id
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-lg">
                            Delete Payment
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            Are you sure you want to delete this payment? This
                            action cannot be undone and will:
                          </AlertDialogDescription>
                          <div className="mt-4 space-y-4">
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                              <li>Remove the payment record</li>
                              <li>Delete any associated sessions</li>
                              <li>Update package session counts</li>
                              <li>
                                Potentially cancel the package if no sessions
                                remain
                              </li>
                            </ul>
                            <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800 font-medium">
                                📋 Payment Details:
                              </p>
                              <div className="text-xs sm:text-sm text-blue-700 mt-1 space-y-1">
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
                            <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                              <p className="text-sm text-yellow-800 font-medium">
                                ⚠️ Impact Warning:
                              </p>
                              <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                                Deleting this payment will affect the client's
                                session availability and package status. This
                                action is irreversible and should only be used
                                for correcting errors or refunds.
                              </p>
                            </div>
                          </div>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                          <AlertDialogCancel
                            onClick={() => setPaymentToDelete(null)}
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => confirmDeletePayment()}
                            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
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
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden sm:block overflow-x-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-2">Client</TableHead>
                    <TableHead className="text-xs py-2">Date</TableHead>
                    <TableHead className="text-xs py-2">Amount</TableHead>
                    <TableHead className="text-xs py-2">Method</TableHead>
                    <TableHead className="text-xs py-2">Sessions</TableHead>
                    <TableHead className="text-xs py-2">Status</TableHead>
                    <TableHead className="text-xs py-2 hidden sm:table-cell">
                      Transaction ID
                    </TableHead>
                    <TableHead className="text-xs py-2">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-red-100 hover:border-l-4 hover:border-l-red-500 hover:shadow-md dark:hover:bg-red-950/30 dark:hover:border-l-red-600 transition-all duration-200">
                      <TableCell className="font-medium text-xs py-2">
                        <div className="truncate max-w-[100px] sm:max-w-none">
                          {clientMap[payment.client_id] || "Unknown Client"}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs py-2">
                        {new Date(payment.paid_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-bold text-xs py-2">
                        ${payment.amount}
                      </TableCell>
                      <TableCell className="text-xs py-2">
                        {payment.method}
                      </TableCell>
                      <TableCell className="text-xs py-2">
                        {payment.session_count}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          className={`${getStatusColor(payment.status)} text-xs px-2 py-1`}
                        >
                          {getStatusText(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs hidden sm:table-cell py-2">
                        <div className="truncate max-w-[80px]">
                          {payment.transaction_id}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-6 px-2"
                          >
                            View
                          </Button>
                          {payment.status === "failed" && (
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-xs h-6 px-2"
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
                                className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 text-xs h-6 px-2"
                                disabled={deletingPayment === payment.id}
                                onClick={() => handleDeletePayment(payment)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                {deletingPayment === payment.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-lg">
                                  Delete Payment
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-sm">
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

                                  <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-sm text-blue-800 font-medium">
                                      📋 Payment Details:
                                    </p>
                                    <div className="text-xs sm:text-sm text-blue-700 mt-1 space-y-1">
                                      <p>
                                        <strong>Client:</strong>{" "}
                                        {clientMap[payment.client_id] ||
                                          "Unknown Client"}
                                      </p>
                                      <p>
                                        <strong>Amount:</strong> $
                                        {payment.amount}
                                      </p>
                                      <p>
                                        <strong>Sessions:</strong>{" "}
                                        {payment.session_count}
                                      </p>
                                      <p>
                                        <strong>Method:</strong>{" "}
                                        {payment.method}
                                      </p>
                                      <p>
                                        <strong>Date:</strong>{" "}
                                        {new Date(
                                          payment.paid_at
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-sm text-yellow-800 font-medium">
                                      ⚠️ Impact Warning:
                                    </p>
                                    <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                                      Deleting this payment will affect the
                                      client's session availability and package
                                      status. This action is irreversible and
                                      should only be used for correcting errors
                                      or refunds.
                                    </p>
                                  </div>
                                </div>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                                <AlertDialogCancel
                                  onClick={() => setPaymentToDelete(null)}
                                  className="w-full sm:w-auto"
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => confirmDeletePayment()}
                                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
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
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Payment Deleted Successfully
            </DialogTitle>
            <DialogDescription className="text-sm">
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <XCircle className="h-5 w-5 text-red-600" />
              Error Deleting Payment
            </DialogTitle>
            <DialogDescription className="text-sm">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setShowErrorModal(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
