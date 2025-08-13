"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Calendar as CalendarIcon,
  List,
  ArrowLeft,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Menu,
} from "lucide-react";
import Link from "next/link";

interface DatabaseSession {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
  };
  end: {
    dateTime: string;
  };
  status: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  _dbData?: {
    client_id: string;
    trainer_id: string;
    type: string;
    notes?: string;
  };
  users?: {
    full_name: string;
    email: string;
  };
}

// Helper function to format event time
function formatEventTime(dateTimeStr: string) {
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper function to format event duration
function formatEventDuration(startStr: string, endStr: string) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const durationMs = end.getTime() - start.getTime();
  const durationMins = Math.round(durationMs / (1000 * 60));

  if (durationMins < 60) {
    return `${durationMins} min`;
  }

  const hours = Math.floor(durationMins / 60);
  const mins = durationMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Add color palette for trainers
const trainerColorPalette = [
  {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    hover: "hover:bg-blue-100",
  },
  {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    hover: "hover:bg-purple-100",
  },
  {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    hover: "hover:bg-green-100",
  },
  {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    hover: "hover:bg-amber-100",
  },
  {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    hover: "hover:bg-rose-100",
  },
  {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    hover: "hover:bg-indigo-100",
  },
];

// Add a default color scheme
const defaultColorScheme = {
  bg: "bg-gray-50",
  border: "border-gray-200",
  text: "text-gray-700",
  hover: "hover:bg-gray-100",
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ClientCalendarPage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<DatabaseSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user's session
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setError("Please log in to view your sessions");
          setLoading(false);
          return;
        }

        // Fetch sessions from database for this client
        const { data: sessionsData, error } = await supabase
          .from("sessions")
          .select(
            `
            id,
            client_id,
            trainer_id,
            date,
            start_time,
            end_time,
            type,
            status,
            notes,
            session_notes,
            created_at,
            users!sessions_trainer_id_fkey (
              full_name,
              email
            )
          `
          )
          .eq("client_id", session.user.id)
          .in("status", ["confirmed", "pending"])
          .order("date", { ascending: true })
          .order("start_time", { ascending: true });

        if (error) {
          console.error("Error fetching sessions:", error);
          setError("Failed to load sessions");
          setLoading(false);
          return;
        }

        console.log("Fetched sessions from database:", sessionsData);

        // Convert database sessions to the format expected by the UI
        const convertedEvents =
          sessionsData?.map((session: any) => ({
            id: session.id,
            summary: `${session.type} with ${session.users?.full_name || "Unknown Trainer"}`,
            description: session.session_notes || session.notes || "",
            start: {
              dateTime: `${session.date}T${session.start_time}`,
            },
            end: {
              dateTime: `${session.date}T${session.end_time}`,
            },
            status: session.status,
            attendees: [
              {
                email: session.users?.email || "",
                displayName: session.users?.full_name || "Unknown Trainer",
                responseStatus: "accepted",
              },
            ],
            // Add database fields for reference
            _dbData: {
              client_id: session.client_id,
              trainer_id: session.trainer_id,
              type: session.type,
              notes: session.session_notes || session.notes,
            },
            users: session.users,
          })) || [];

        setEvents(convertedEvents);
      } catch (err) {
        setError("Failed to load sessions");
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // Add helper function to check if a day is today
  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const getSessionsForDate = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return events.filter((event) => {
      const eventDate = new Date(event.start.dateTime);
      return eventDate.toISOString().split("T")[0] === dateStr;
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);

  const renderEvent = (event: DatabaseSession) => {
    console.log("Rendering event:", event);

    // Default values
    let colors = defaultColorScheme;
    let sessionType = "Unknown Session";
    let trainerName = "Unknown Trainer";

    try {
      // Use database data if available, otherwise fall back to summary parsing
      if (event._dbData) {
        sessionType = event._dbData.type || "Unknown Session";
        trainerName = event.users?.full_name || "Unknown Trainer";
      } else {
        // Fallback to parsing summary (for backward compatibility)
        const parts = event?.summary?.split(" with ") || [];
        sessionType = parts[0]?.trim() || "Unknown Session";
        trainerName = parts[1]?.trim() || "Unknown Trainer";
      }

      // Generate a consistent hash for the trainer name to use as color index
      const getHashCode = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
      };

      // Use trainer name for color consistency
      const trainerHash = getHashCode(trainerName);
      colors = trainerColorPalette[trainerHash % trainerColorPalette.length];

      console.log("Event processing:", {
        summary: event?.summary,
        sessionType,
        trainerName,
        colors,
        dbData: event._dbData,
      });

      return (
        <div
          key={event.id}
          className={`group relative p-2 mb-1 rounded-lg border ${colors.border} ${colors.bg} ${colors.hover} transition-all duration-200 shadow-sm hover:shadow-md`}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${colors.text}`}>
                {formatEventTime(event.start.dateTime)}
              </span>
              <span className={`text-xs ${colors.text} opacity-75`}>
                {formatEventDuration(event.start.dateTime, event.end.dateTime)}
              </span>
            </div>
            <div className={`font-medium ${colors.text} text-sm truncate`}>
              {sessionType}
            </div>
            <div className="flex items-center gap-2">
              <User className={`h-3 w-3 ${colors.text} opacity-75`} />
              <span className={`text-xs ${colors.text} opacity-75 truncate`}>
                {trainerName}
              </span>
            </div>
          </div>

          {/* Status indicator dot */}
          <div
            className={`absolute top-2 right-2 h-2 w-2 rounded-full 
              ${
                event?.status?.toLowerCase() === "confirmed"
                  ? "bg-green-500"
                  : event?.status?.toLowerCase() === "pending"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
          />
        </div>
      );
    } catch (error) {
      console.error("Error rendering event:", error, event);
      // Render a fallback UI for failed events
      return (
        <div
          key={event.id}
          className="p-2 mb-1 rounded-lg border border-red-200 bg-red-50"
        >
          <div className="text-xs text-red-700">Error displaying event</div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-background dark:bg-gray-900 px-4 md:px-6">
          <SidebarTrigger>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SidebarTrigger>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading your sessions...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-background dark:bg-gray-900 px-4 md:px-6">
          <SidebarTrigger>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SidebarTrigger>
        </div>
        <div className="p-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Error Loading Sessions</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/client/dashboard">
                <Button className="bg-red-600 hover:bg-red-700">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-background dark:bg-gray-900 px-4 md:px-6">
        <SidebarTrigger>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SidebarTrigger>
        <div className="flex items-center justify-between w-full">
          <Link href="/client/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className={
                viewMode === "calendar" ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list" ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>
      </div>

      <main className="p-4">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold tracking-tight dark:text-gray-100">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden min-w-[600px]">
                {/* Day headers */}
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="bg-gray-50 dark:bg-gray-900/40 p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => (
                  <div
                    key={`day-${currentDate.getFullYear()}-${currentDate.getMonth()}-${index}`}
                    className={`relative p-1 sm:p-2 min-h-[90px] sm:min-h-[120px] ${
                      !day
                        ? "bg-gray-50 dark:bg-gray-900/40"
                        : isToday(day)
                          ? "bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500/70 dark:ring-red-700 ring-inset"
                          : "bg-white dark:bg-gray-900"
                    }`}
                  >
                    {day && (
                      <>
                        <div
                          className={`font-medium text-xs sm:text-sm mb-1 sm:mb-2 sticky top-0 z-10 ${
                            isToday(day) ? "text-red-900 dark:text-red-300 font-semibold" : "dark:text-gray-100"
                          }`}
                        >
                          {day}
                        </div>
                        <div className="space-y-1 sm:space-y-2 max-h-[80px] sm:max-h-[100px] overflow-y-auto">
                          {getSessionsForDate(day).map((event) =>
                            renderEvent(event)
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
