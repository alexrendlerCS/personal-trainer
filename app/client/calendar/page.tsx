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
  ChevronDown,
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
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

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

      return (
        <div
          key={event.id}
          className={`group relative px-1 py-0.5 mb-0 rounded text-left cursor-pointer ${colors.bg} ${colors.text} hover:${colors.hover} transition-all duration-150`}
          onClick={() => {
            setSelectedEvent(event);
            setShowEventModal(true);
          }}
        >
          <div className="flex items-center gap-0.5 truncate">
            <span
              className={`text-[10px] font-medium ${colors.text} whitespace-nowrap`}
            >
              {formatEventTime(event.start.dateTime)}
            </span>
            <span className={`text-[10px] ${colors.text} opacity-90 truncate`}>
              {sessionType}
            </span>
          </div>

          {/* Status indicator dot */}
          <div
            className={`absolute top-1 right-1 h-1.5 w-1.5 rounded-full 
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
          className="p-2 mb-1 rounded-lg border border-red-200 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
          onClick={() => {
            setSelectedEvent(event);
            setShowEventModal(true);
          }}
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

        {/* Event Details Modal */}
        {console.log("Modal render check:", { showEventModal, selectedEvent })}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Session Details
                  </h3>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Time
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatEventTime(selectedEvent.start.dateTime)} -{" "}
                      {formatEventTime(selectedEvent.end.dateTime)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Session Type
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedEvent._dbData?.type ||
                        selectedEvent.summary ||
                        "Training Session"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Trainer
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedEvent.users?.full_name ||
                        selectedEvent.trainerName ||
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </label>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {selectedEvent._dbData?.status ||
                        selectedEvent.status ||
                        "Confirmed"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Date
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedEvent._dbData?.date ||
                        new Date(
                          selectedEvent.start.dateTime
                        ).toLocaleDateString()}
                    </p>
                  </div>

                  {selectedEvent._dbData?.session_notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Session Notes
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedEvent._dbData.session_notes}
                      </p>
                    </div>
                  )}

                  {selectedEvent.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}

                  {selectedEvent._dbData?.is_recurring && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Recurring
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedEvent._dbData.is_recurring ? "Yes" : "No"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
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
        {viewMode === "calendar" ? (
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-2xl font-bold tracking-tight dark:text-gray-100">
                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    onClick={() => navigateMonth("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    onClick={() => navigateMonth("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden w-full min-w-0">
                  {/* Day headers */}
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="bg-gray-50 dark:bg-gray-900/40 p-1 sm:p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar days */}
                  {days.map((day, index) => (
                    <div
                      key={`day-${currentDate.getFullYear()}-${currentDate.getMonth()}-${index}`}
                      className={`relative p-1 sm:p-2 min-h-[100px] sm:min-h-[120px] ${
                        !day
                          ? "bg-gray-50 dark:bg-gray-900/40"
                          : isToday(day)
                            ? "bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500/70 dark:ring-red-700 ring-inset"
                            : "bg-white dark:bg-gray-900"
                      }`}
                    >
                      {day && (
                        <>
                          <div
                            className={`font-medium text-xs mb-1 sticky top-0 z-10 ${
                              isToday(day)
                                ? "text-red-900 dark:text-red-300 font-bold"
                                : "dark:text-gray-100"
                            }`}
                          >
                            {day}
                          </div>
                          <div className="space-y-0 max-h-[80px] sm:max-h-[90px] overflow-y-auto">
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
        ) : (
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-2xl font-bold tracking-tight dark:text-gray-100">
                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    (
                    {(() => {
                      const currentMonth = currentDate.getMonth();
                      const currentYear = currentDate.getFullYear();
                      const monthEvents = events.filter((event) => {
                        const eventDate = new Date(event.start.dateTime);
                        return (
                          eventDate.getMonth() === currentMonth &&
                          eventDate.getFullYear() === currentYear
                        );
                      });
                      return `${monthEvents.length} session${monthEvents.length !== 1 ? "s" : ""}`;
                    })()}
                    )
                  </span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    onClick={() => navigateMonth("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    onClick={() => navigateMonth("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  // Filter events for the current month
                  const currentMonth = currentDate.getMonth();
                  const currentYear = currentDate.getFullYear();

                  const monthEvents = events.filter((event) => {
                    const eventDate = new Date(event.start.dateTime);
                    return (
                      eventDate.getMonth() === currentMonth &&
                      eventDate.getFullYear() === currentYear
                    );
                  });

                  if (monthEvents.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No sessions found for {months[currentDate.getMonth()]}{" "}
                        {currentDate.getFullYear()}
                      </div>
                    );
                  }

                  // Group events by date
                  const groupedEvents = monthEvents.reduce(
                    (groups, event) => {
                      const eventDate = new Date(event.start.dateTime);
                      const dateKey = eventDate.toDateString();

                      if (!groups[dateKey]) {
                        groups[dateKey] = [];
                      }
                      groups[dateKey].push(event);
                      return groups;
                    },
                    {} as Record<string, typeof monthEvents>
                  );

                  // Sort dates and render grouped events
                  return Object.entries(groupedEvents)
                    .sort(
                      ([dateA], [dateB]) =>
                        new Date(dateA).getTime() - new Date(dateB).getTime()
                    )
                    .map(([dateString, dayEvents]) => {
                      const date = new Date(dateString);
                      const isToday =
                        date.toDateString() === new Date().toDateString();

                      return (
                        <div key={dateString} className="mb-6">
                          {/* Date Header */}
                          <div
                            className={`sticky top-0 z-10 py-3 px-4 rounded-lg mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                              isToday
                                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                                : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            onClick={() => {
                              const newExpandedDates = new Set(expandedDates);
                              if (newExpandedDates.has(dateString)) {
                                newExpandedDates.delete(dateString);
                              } else {
                                newExpandedDates.add(dateString);
                              }
                              setExpandedDates(newExpandedDates);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform duration-200 ${
                                    expandedDates.has(dateString)
                                      ? "rotate-180"
                                      : ""
                                  } ${
                                    isToday
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                />
                                <div>
                                  <h3
                                    className={`font-semibold ${
                                      isToday
                                        ? "text-red-900 dark:text-red-100"
                                        : "text-gray-900 dark:text-gray-100"
                                    }`}
                                  >
                                    {date.toLocaleDateString("en-US", {
                                      weekday: "long",
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </h3>
                                  {isToday && (
                                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                                      Today
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {dayEvents.length} session
                                {dayEvents.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>

                          {/* Sessions for this date */}
                          {expandedDates.has(dateString) && (
                            <div className="space-y-2">
                              {dayEvents
                                .sort(
                                  (a, b) =>
                                    new Date(a.start.dateTime).getTime() -
                                    new Date(b.start.dateTime).getTime()
                                )
                                .map((event) => {
                                  // Get session details
                                  let sessionType = "Unknown Session";
                                  let trainerName = "Unknown Trainer";
                                  let colors = defaultColorScheme;

                                  if (event._dbData) {
                                    sessionType =
                                      event._dbData.type || "Unknown Session";
                                    trainerName =
                                      event.users?.full_name ||
                                      "Unknown Trainer";
                                  } else {
                                    const parts =
                                      event?.summary?.split(" with ") || [];
                                    sessionType =
                                      parts[0]?.trim() || "Unknown Session";
                                    trainerName =
                                      parts[1]?.trim() || "Unknown Trainer";
                                  }

                                  // Generate consistent colors
                                  const getHashCode = (str: string) => {
                                    let hash = 0;
                                    for (let i = 0; i < str.length; i++) {
                                      const char = str.charCodeAt(i);
                                      hash = (hash << 5) - hash + char;
                                      hash = hash & hash;
                                    }
                                    return Math.abs(hash);
                                  };

                                  const trainerHash = getHashCode(trainerName);
                                  colors =
                                    trainerColorPalette[
                                      trainerHash % trainerColorPalette.length
                                    ];

                                  return (
                                    <div
                                      key={event.id}
                                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${colors.bg} ${colors.border} ${colors.hover}`}
                                      onClick={() => {
                                        setSelectedEvent(event);
                                        setShowEventModal(true);
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-3 mb-1">
                                            <div
                                              className={`w-2 h-2 rounded-full ${
                                                event?.status?.toLowerCase() ===
                                                "confirmed"
                                                  ? "bg-green-500"
                                                  : event?.status?.toLowerCase() ===
                                                      "pending"
                                                    ? "bg-yellow-500"
                                                    : "bg-red-500"
                                              }`}
                                            />
                                            <h4
                                              className={`font-medium ${colors.text}`}
                                            >
                                              {formatEventTime(
                                                event.start.dateTime
                                              )}{" "}
                                              -{" "}
                                              {formatEventTime(
                                                event.end.dateTime
                                              )}
                                            </h4>
                                          </div>
                                          <div
                                            className={`text-sm ${colors.text} opacity-90 mb-1`}
                                          >
                                            {sessionType}
                                          </div>
                                          <div
                                            className={`text-sm ${colors.text} opacity-75`}
                                          >
                                            with {trainerName}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} opacity-75`}
                                          >
                                            {event?.status?.toLowerCase() ||
                                              "confirmed"}
                                          </span>
                                          <ChevronRight className="h-4 w-4 text-gray-400" />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      );
                    });
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Session Details
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Time
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatEventTime(selectedEvent.start.dateTime)} -{" "}
                    {formatEventTime(selectedEvent.end.dateTime)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Session Type
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedEvent._dbData?.type ||
                      selectedEvent.summary ||
                      "Training Session"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Trainer
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedEvent.users?.full_name ||
                      selectedEvent.trainerName ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </label>
                  <p className="text-gray-900 dark:text-white capitalize">
                    {selectedEvent._dbData?.status ||
                      selectedEvent.status ||
                      "Confirmed"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedEvent._dbData?.date ||
                      new Date(
                        selectedEvent.start.dateTime
                      ).toLocaleDateString()}
                  </p>
                </div>

                {selectedEvent._dbData?.session_notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Session Notes
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedEvent._dbData.session_notes}
                    </p>
                  </div>
                )}

                {selectedEvent.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                {selectedEvent._dbData?.is_recurring && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Recurring
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedEvent._dbData.is_recurring ? "Yes" : "No"}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
