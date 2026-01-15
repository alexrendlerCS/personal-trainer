"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle,
  Menu,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { Database } from "@/lib/database.types";
import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfToday,
  addDays,
} from "date-fns";
import { Calendar as RadixCalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/DatePicker";
import { useUser } from "@/lib/store/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CountUp from "react-countup";
import { formatLocalDate, getTodayString } from "@/lib/utils";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

interface RecurringSession {
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  time: string; // HH:MM format
  weeks: number; // Number of weeks to repeat
  startDate: string; // YYYY-MM-DD format
}

const mockAvailableSlots = [
  { date: "2024-01-15", slots: ["9:00 AM", "10:00 AM", "2:00 PM", "4:00 PM"] },
  { date: "2024-01-16", slots: ["10:00 AM", "11:00 AM", "3:00 PM"] },
  { date: "2024-01-17", slots: ["9:00 AM", "1:00 PM", "2:00 PM", "5:00 PM"] },
  { date: "2024-01-18", slots: ["8:00 AM", "10:00 AM", "3:00 PM"] },
  { date: "2024-01-19", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
];

const sessionTypes = [
  {
    id: "In-Person Training",
    name: "In-Person Training",
    duration: "60 min",
    description: "One-on-one personal training sessions at our facility",
  },
  {
    id: "Virtual Training",
    name: "Virtual Training",
    duration: "60 min",
    description: "Live online training sessions from the comfort of your home",
  },
  {
    id: "Partner Training",
    name: "Partner Training",
    duration: "60 min",
    description: "Train with a partner for a more engaging workout experience",
  },
];

interface Trainer {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface TrainerAvailability {
  id: string;
  trainer_id: string;
  weekday: number; // 0-6 for Sunday-Saturday
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  created_at: string;
}

interface TrainerUnavailability {
  id: string;
  trainer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
  created_at: string;
}

interface Session {
  id: string;
  trainer_id: string;
  client_id: string;
  date: string;
  start_time: string;
  end_time: string;
  type: string;
  status: string;
  created_at: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface PackageTypeCount {
  type: string;
  remaining: number;
  total: number;
}

type PackageType =
  | "In-Person Training"
  | "Virtual Training"
  | "Partner Training";

type PackageTypeCounts = {
  [K in PackageType]: PackageTypeCount;
};

// Helper function to convert time string to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map((num) => parseInt(num, 10));
  return hours * 60 + minutes;
};

// Helper function to check if a time slot overlaps with any blocked periods
const isSlotUnavailable = (
  slotStart: string,
  slotEnd: string,
  unavailablePeriods: Array<{ start_time: string; end_time: string }>,
  existingSessions: Array<{ start_time: string; end_time: string }>
): boolean => {
  const slotStartMins = timeToMinutes(slotStart);
  const slotEndMins = timeToMinutes(slotEnd);

  // Check unavailable periods
  const hasUnavailableConflict = unavailablePeriods.some((period) => {
    const periodStartMins = timeToMinutes(period.start_time);
    const periodEndMins = timeToMinutes(period.end_time);
    return !(slotEndMins <= periodStartMins || slotStartMins >= periodEndMins);
  });

  // Check existing sessions
  const hasSessionConflict = existingSessions.some((session) => {
    const sessionStartMins = timeToMinutes(session.start_time);
    const sessionEndMins = timeToMinutes(session.end_time);
    return !(
      slotEndMins <= sessionStartMins || slotStartMins >= sessionEndMins
    );
  });

  return hasUnavailableConflict || hasSessionConflict;
};

// Constants
const TRAINER_TIMEZONE = "America/Denver"; // Colorado timezone

// Helper to get timezone offset in minutes for a timezone on a specific date
const getTimeZoneOffsetMinutes = (timeZone: string, date: Date): number => {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
  return (utcDate.getTime() - tzDate.getTime()) / (1000 * 60);
};

// Simplified timezone conversion using direct offset calculation
const convertTrainerTimeToUserTime = (
  timeString: string,
  selectedDate: string,
  userTimezone: string
): string => {
  if (userTimezone === TRAINER_TIMEZONE) {
    return timeString;
  }

  try {
    // Create a date representing the trainer's time
    const dateTimeString = `${selectedDate}T${timeString}`;
    
    // Create two date objects representing the same moment in time
    const referenceDate = new Date();
    
    // Get the time in trainer's timezone
    const trainerTime = new Date(referenceDate.toLocaleString("sv-SE", {timeZone: TRAINER_TIMEZONE}));
    
    // Get the time in user's timezone 
    const userTime = new Date(referenceDate.toLocaleString("sv-SE", {timeZone: userTimezone}));
    
    // Calculate the offset in minutes
    const offsetMinutes = (trainerTime.getTime() - userTime.getTime()) / (1000 * 60);
    
    // Apply the offset to the trainer's scheduled time
    const [hours, minutes, seconds = '00'] = timeString.split(':');
    const scheduledTime = new Date(`${selectedDate}T${hours}:${minutes}:${seconds}`);
    const convertedTime = new Date(scheduledTime.getTime() - (offsetMinutes * 60 * 1000));
    
    const result = format(convertedTime, 'HH:mm:ss');
    
    return result;
  } catch (error) {
    console.warn('Timezone conversion failed, using original time:', error);
    return timeString;
  }
};

// Helper function to get user's timezone
const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || TRAINER_TIMEZONE;
};

// Helper function to format time for email recipients based on session type and recipient
const formatTimeForEmail = (
  timeString: string,
  selectedDate: string,
  sessionType: string,
  isTrainerEmail: boolean,
  userTimezone: string
): string => {
  const isInPerson = sessionType === "In-Person Training";
  
  if (isTrainerEmail) {
    // Trainer always gets Colorado time
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    const timeDisplay = format(date, "h:mm a");
    
    if (isInPerson) {
      return `${timeDisplay} MT`; // Mountain Time for in-person
    } else {
      return `${timeDisplay} MT`; // Still Mountain Time for trainer
    }
  } else {
    // Client gets appropriate timezone based on session type
    if (isInPerson) {
      // For in-person, show Colorado time to client
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      const timeDisplay = format(date, "h:mm a");
      return `${timeDisplay} MT (Colorado time)`;
    } else {
      // For virtual, convert to client's timezone
      const convertedTime = convertTrainerTimeToUserTime(timeString, selectedDate, userTimezone);
      const [hours, minutes] = convertedTime.split(":");
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      const timeDisplay = format(date, "h:mm a");
      const userTzAbbr = getTimezoneAbbreviation(userTimezone);
      return `${timeDisplay} ${userTzAbbr}`;
    }
  }
};

// Helper function to get timezone abbreviation
const getTimezoneAbbreviation = (timezone: string): string => {
  const now = new Date();
  const timeZoneNames: { [key: string]: string } = {
    'America/Denver': 'MT', // Mountain Time
    'America/Los_Angeles': 'PT', // Pacific Time
    'America/New_York': 'ET', // Eastern Time
    'America/Chicago': 'CT', // Central Time
    'America/Phoenix': 'MST', // Mountain Standard Time (no DST)
  };

  // Check for common timezone mappings first
  if (timeZoneNames[timezone]) {
    return timeZoneNames[timezone];
  }

  // For other timezones, use Intl.DateTimeFormat to get the short name
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(now);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    return timeZonePart?.value || timezone.split('/').pop() || 'Local';
  } catch {
    return timezone.split('/').pop() || 'Local';
  }
};

// Helper function to format time for display (now timezone-aware)
const formatTimeForDisplay = (
  timeString: string, 
  selectedDate?: string, 
  sessionType?: string
) => {
  if (selectedDate) {
    const userTimezone = getUserTimezone();
    const isInPerson = sessionType === "In-Person Training";
    
    if (isInPerson) {
      // For in-person sessions, show trainer's time (Colorado time)
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      
      const timeDisplay = format(date, "h:mm a");
      if (userTimezone !== TRAINER_TIMEZONE) {
        const trainerTzAbbr = getTimezoneAbbreviation(TRAINER_TIMEZONE);
        return `${timeDisplay} ${trainerTzAbbr}`;
      }
      return timeDisplay;
    } else {
      // For virtual sessions, convert trainer time to user timezone
      const convertedTime = convertTrainerTimeToUserTime(timeString, selectedDate, userTimezone);
      const [hours, minutes] = convertedTime.split(":");
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      
      const timeDisplay = format(date, "h:mm a");
      if (userTimezone !== TRAINER_TIMEZONE) {
        const userTzAbbr = getTimezoneAbbreviation(userTimezone);
        return `${timeDisplay} ${userTzAbbr}`;
      }
      return timeDisplay;
    }
  } else {
    // Fallback to original behavior
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return format(date, "h:mm a");
  }
};

// Helper function to generate time slots
const generateTimeSlots = (
  startTime: string,
  endTime: string,
  unavailablePeriods: Array<{ start_time: string; end_time: string }> = [],
  existingSessions: Array<{ start_time: string; end_time: string }> = []
): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  // Parse start and end times
  const [startHours, startMinutes] = startTime
    .split(":")
    .map((num) => parseInt(num, 10));
  const [endHours, endMinutes] = endTime
    .split(":")
    .map((num) => parseInt(num, 10));

  // Create Date objects for comparison
  const start = new Date();
  start.setHours(startHours, startMinutes, 0);

  const end = new Date();
  end.setHours(endHours, endMinutes, 0);

  let current = new Date(start);

  // Generate slots in 30-minute increments
  while (current < end) {
    // Calculate the start and end times for this 60-minute session
    const slotStartTime = format(current, "HH:mm:ss");
    const sessionEnd = new Date(current.getTime() + 60 * 60000); // 60 minutes later

    // Only add the slot if the full 60-minute session fits within the availability window
    if (sessionEnd <= end) {
      const slotEndTime = format(sessionEnd, "HH:mm:ss");

      // Check if this slot overlaps with any unavailable periods or existing sessions
      const isUnavailable = isSlotUnavailable(
        slotStartTime,
        slotEndTime,
        unavailablePeriods,
        existingSessions
      );

      slots.push({
        startTime: slotStartTime,
        endTime: slotEndTime,
        isAvailable: !isUnavailable,
      });
    }

    // Move to next 30-minute increment
    current = new Date(current.getTime() + 30 * 60000);
  }

  return slots;
};

// Helper function to get day name
const getDayName = (index: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[index] || "";
};

// Helper function to safely parse a YYYY-MM-DD string to a date at start of day in user's timezone
function parseLocalDateString(dateStr: string): Date {
  // Parse the date components
  const [year, month, day] = dateStr.split("-").map(Number);
  
  // Create date string with time set to noon to avoid timezone edge cases
  const dateWithTime = `${dateStr}T12:00:00`;
  
  // Parse as ISO string which will respect the user's timezone
  return new Date(dateWithTime);
}

export default function BookingPage() {
  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [showNoSessionsDialog, setShowNoSessionsDialog] = useState(false);
  const [showCurrentSessionsDialog, setShowCurrentSessionsDialog] =
    useState(false);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const [trainerAvailability, setTrainerAvailability] = useState<
    TrainerAvailability[]
  >([]);
  const { user } = useUser();
  const [isBooking, setIsBooking] = useState(false);
  const router = useRouter();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCalendarWarning, setShowCalendarWarning] = useState(false);
  const [showCalendarWarningAfterSuccess, setShowCalendarWarningAfterSuccess] = useState(false);
  const [overlapWarning, setOverlapWarning] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionsRemaining, setSessionsRemaining] = useState<number>(0);
  const [sessionsByType, setSessionsByType] = useState<PackageTypeCount[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringSessions, setRecurringSessions] = useState<
    RecurringSession[]
  >([]);
  const [totalRecurringSessions, setTotalRecurringSessions] = useState(0);
  const [recurringWeeks, setRecurringWeeks] = useState(0);

  // Additional session states
  const [isAddingAnotherSession, setIsAddingAnotherSession] = useState(false);
  const [additionalSessionDate, setAdditionalSessionDate] = useState<
    string | null
  >(null);
  const [additionalSessionDateObj, setAdditionalSessionDateObj] =
    useState<Date | null>(null);
  const [additionalSessionTimeSlot, setAdditionalSessionTimeSlot] =
    useState<TimeSlot | null>(null);
  const [additionalSessionWeeks, setAdditionalSessionWeeks] = useState(0);
  const [additionalSessionAvailableSlots, setAdditionalSessionAvailableSlots] =
    useState<TimeSlot[]>([]);
  const [loadingAdditionalTimeSlots, setLoadingAdditionalTimeSlots] =
    useState(false);

  const supabase = createClient();

  // Check for overlaps when recurring sessions change
  useEffect(() => {
    const checkOverlaps = async () => {
      if (
        isRecurring &&
        selectedTrainer &&
        (recurringSessions.length > 0 || recurringWeeks > 0)
      ) {
        const overlapCheck = await checkRecurringSessionOverlaps();
        if (overlapCheck.hasOverlaps) {
          const overlapDetails = overlapCheck.overlaps
            .map((overlap) => `${overlap.date} at ${overlap.time}`)
            .join("\n");
          setOverlapWarning(overlapDetails);
        } else {
          setOverlapWarning("");
        }
      } else {
        setOverlapWarning("");
      }
    };

    checkOverlaps();
  }, [
    recurringSessions,
    recurringWeeks,
    selectedTrainer,
    isRecurring,
    selectedDate,
    selectedTimeSlot,
  ]);

  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      if (!selectedTrainer || !selectedDate) return;

      try {
        setLoadingTimeSlots(true);

        // Parse selectedDate as local date
        const dateObj = parseLocalDateString(selectedDate);
        const jsDay = dateObj.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        const selectedDayOfWeek = jsDay;

        // 1. Get trainer's regular availability for this day
        const { data: availabilityData, error: availabilityError } =
          await supabase
            .from("trainer_availability")
            .select("*")
            .eq("trainer_id", selectedTrainer.id)
            .eq("weekday", selectedDayOfWeek);

        if (availabilityError) throw availabilityError;

        // 2. Get trainer's unavailability for the specific date
        const { data: unavailabilityData, error: unavailabilityError } =
          await supabase
            .from("trainer_unavailable_slots")
            .select("*")
            .eq("trainer_id", selectedTrainer.id)
            .eq("date", selectedDate);

        if (unavailabilityError) throw unavailabilityError;

        // 3. Get existing sessions for the selected date
        // FIXED: Remove trainer_id filter to check all sessions for time slot conflicts
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("start_time, end_time")
          .eq("date", selectedDate)
          .neq("status", "cancelled"); // Exclude cancelled sessions

        if (sessionError) throw sessionError;

        if (!availabilityData?.length) {
          setAvailableTimeSlots([]);
          setLoadingTimeSlots(false);
          return;
        }

        // Handle multiple availability windows for the same day
        let allSlots: TimeSlot[] = [];

        // Sort availability windows by start time
        const sortedAvailability = availabilityData.sort((a, b) =>
          a.start_time.localeCompare(b.start_time)
        );

        // Generate slots for each availability window
        for (const availability of sortedAvailability) {
          const windowSlots = generateTimeSlots(
            availability.start_time,
            availability.end_time,
            unavailabilityData || [],
            sessionData || []
          );
          allSlots = [...allSlots, ...windowSlots];
        }

        setAvailableTimeSlots(allSlots);
        setLoadingTimeSlots(false);
      } catch (error) {
        console.error("[DEBUG] Error fetching time slots:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load time slots"
        );
        setLoadingTimeSlots(false);
      }
    };

    fetchAvailableTimeSlots();
  }, [selectedTrainer, selectedDate]);

  // Load time slots for additional sessions
  useEffect(() => {
    const fetchAdditionalTimeSlots = async () => {
      if (!selectedTrainer || !additionalSessionDate) return;

      try {
        setLoadingAdditionalTimeSlots(true);

        // Parse additionalSessionDate as local date
        const dateObj = parseLocalDateString(additionalSessionDate);
        const dateString = formatLocalDate(dateObj);

        // Get trainer availability for this date
        const jsDay = dateObj.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        const selectedDayOfWeek = jsDay;

        const { data: availabilityData, error: availabilityError } =
          await supabase
            .from("trainer_availability")
            .select("*")
            .eq("trainer_id", selectedTrainer.id)
            .eq("weekday", selectedDayOfWeek);

        if (availabilityError) throw availabilityError;

        // Get trainer unavailability for this specific date
        const { data: unavailabilityData, error: unavailabilityError } =
          await supabase
            .from("trainer_unavailable_slots")
            .select("*")
            .eq("trainer_id", selectedTrainer.id)
            .eq("date", dateString);

        if (unavailabilityError) throw unavailabilityError;

        // Get existing sessions for this date
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("start_time, end_time")
          .eq("date", dateString)
          .neq("status", "cancelled");

        if (sessionError) throw sessionError;

        if (!availabilityData?.length) {
          setAdditionalSessionAvailableSlots([]);
          setLoadingAdditionalTimeSlots(false);
          return;
        }

        // Generate time slots for each availability window
        let allSlots: TimeSlot[] = [];
        const sortedAvailability = availabilityData.sort((a, b) =>
          a.start_time.localeCompare(b.start_time)
        );

        // Generate slots for each availability window
        for (const availability of sortedAvailability) {
          const windowSlots = generateTimeSlots(
            availability.start_time,
            availability.end_time,
            unavailabilityData || [],
            sessionData || []
          );
          allSlots = [...allSlots, ...windowSlots];
        }

        setAdditionalSessionAvailableSlots(allSlots);
        setLoadingAdditionalTimeSlots(false);
      } catch (error) {
        console.error("[DEBUG] Error fetching additional time slots:", error);
        console.error(
          "[DEBUG] Additional session date:",
          additionalSessionDate
        );
        console.error("[DEBUG] Selected trainer:", selectedTrainer?.id);
        setError(
          error instanceof Error ? error.message : "Failed to load time slots"
        );
        setLoadingAdditionalTimeSlots(false);
      }
    };

    fetchAdditionalTimeSlots();
  }, [selectedTrainer, additionalSessionDate]);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        setError(null);

        // First check if user is authenticated
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Authentication error details:", {
            message: authError.message,
            status: authError.status,
            name: authError.name,
            stack: authError.stack,
          });
          throw new Error("Authentication failed: " + authError.message);
        }

        if (!user) {
          throw new Error("Not authenticated - no user found");
        }

        // Get current user's role first
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (userError) {
          console.error("Error fetching user role:", userError);
          throw new Error("Failed to verify user role: " + userError.message);
        }

        // Then fetch trainers
        const { data: trainersData, error: trainersError } = await supabase
          .from("users")
          .select("id, full_name, email, avatar_url")
          .eq("role", "trainer");

        if (trainersError) {
          console.error("Trainers fetch error details:", {
            message: trainersError.message,
            code: trainersError.code,
            details: trainersError.details,
            hint: trainersError.hint,
          });
          throw new Error("Failed to fetch trainers: " + trainersError.message);
        }

        // Filter out Alex Trainer and ensure required fields
        const validTrainers = (trainersData || []).filter(
          (trainer) => trainer.full_name && trainer.email && trainer.full_name !== "Alex Trainer"
        );

        setTrainers(validTrainers);
      } catch (err) {
        console.error("Error fetching trainers (full error):", {
          error: err,
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
          type: typeof err,
        });
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load trainers. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, [supabase]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        return;
      }

      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (!profile) {
        console.error("No profile found for user:", user.id);
        return;
      }

      console.log("Successfully fetched user profile:", {
        id: profile.id,
        full_name: profile.full_name,
        role: profile.role,
      });

      setUserProfile(profile);
    };

    fetchUserProfile();
  }, [user, supabase]);

  // Add an additional effect to monitor profile state
  useEffect(() => {}, [userProfile]);

  useEffect(() => {
    const checkRemainingSession = async () => {
      setIsCheckingSession(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsCheckingSession(false);
          return;
        }

        // Get all active packages for the user
        const { data: packages, error: packagesError } = await supabase
          .from("packages")
          .select("*")
          .eq("client_id", user.id)
          .order("purchase_date", { ascending: false });

        if (packagesError) {
          console.error("Failed to fetch packages:", packagesError);
          setSessionsRemaining(0);
          setSessionsByType([]);
          setShowNoSessionsDialog(true);
          setIsCheckingSession(false);
          return;
        }

        // Group packages by type and calculate remaining sessions
        const packageTypes: PackageTypeCounts = {
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
        };

        if (packages && packages.length > 0) {
          packages.forEach((pkg) => {
            const type = pkg.package_type as PackageType;
            if (packageTypes[type]) {
              const remaining =
                (pkg.sessions_included || 0) - (pkg.sessions_used || 0);
              packageTypes[type].remaining += remaining;
              packageTypes[type].total += pkg.sessions_included || 0;
            }
          });
        }

        // Convert to array and include all types
        const sessionSummary = Object.values(packageTypes);

        setSessionsByType(sessionSummary);

        // Calculate total remaining sessions
        const totalRemaining = sessionSummary.reduce(
          (total, type) => total + type.remaining,
          0
        );
        setSessionsRemaining(totalRemaining);

        if (totalRemaining === 0) {
          setShowNoSessionsDialog(true);
        } else {
          setShowCurrentSessionsDialog(true);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setSessionsRemaining(0);
        setSessionsByType([]);
        setShowNoSessionsDialog(true);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkRemainingSession();
  }, [supabase]);

  const handleTrainerSelect = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setShowTrainerModal(false);
    // Set initial date to today when trainer is selected
    setSelectedDate(getTodayString());
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    if (!timeSlot.isAvailable) return;
    setSelectedTime(timeSlot.startTime);
  };

  // Group time slots by date for the existing UI
  const timeSlotsByDate: Record<string, TimeSlot[]> = Object.fromEntries([
    [selectedDate, availableTimeSlots],
  ]);

  const handleBooking = () => {
    // Mock booking logic
    alert(
      `Session booked: ${selectedType} on ${selectedDate} at ${selectedTime}`
    );
  };

  // Update selectedDate when date changes (from DatePicker)
  useEffect(() => {
    if (date) {
      // Always set as local YYYY-MM-DD string
      setSelectedDate(formatLocalDate(date));
    }
  }, [date]);

  // Update selectedDate when selectedDateObj changes
  useEffect(() => {
    if (selectedDateObj) {
      setSelectedDate(formatLocalDate(selectedDateObj));
    }
  }, [selectedDateObj]);

  // When displaying the selected date in the input field, always use local parsing
  // (handled in DatePicker component already)

  // When using selectedDate for logic, always parse as local
  const getFormattedBookingDate = () => {
    if (!selectedDate) return "";
    const dateObj = parseLocalDateString(selectedDate);
    return format(dateObj, "EEEE, MMMM d, yyyy");
  };

  // Format the booking time in 12-hour format
  const getFormattedBookingTime = () => {
    if (!selectedTimeSlot) return "";
    const timeDate = new Date(`2000-01-01T${selectedTimeSlot.startTime}`);
    return format(timeDate, "h:mm a");
  };

  // Get the selected session type details
  const getSelectedSessionType = () => {
    return sessionTypes.find((type) => type.id === selectedType);
  };

  // Helper functions for recurring sessions
  const getDayName = (dayIndex: number): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayIndex];
  };

  const getDayShortName = (dayIndex: number): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[dayIndex];
  };

  const calculateTotalRecurringSessions = (
    sessions: RecurringSession[]
  ): number => {
    return sessions.reduce((total, session) => total + session.weeks, 0);
  };

  const validateRecurringSessions = (): {
    isValid: boolean;
    message: string;
  } => {
    if (recurringSessions.length === 0) {
      return {
        isValid: false,
        message: "Please add at least one recurring session",
      };
    }

    const totalSessions = calculateTotalRecurringSessions(recurringSessions);
    const selectedPackageType = getSelectedSessionType()?.name;

    if (!selectedPackageType) {
      return { isValid: false, message: "Please select a session type" };
    }

    const packageType = sessionsByType.find(
      (pkg) => pkg.type === selectedPackageType
    );
    if (!packageType) {
      return {
        isValid: false,
        message: "No package found for selected session type",
      };
    }

    if (totalSessions > packageType.remaining) {
      return {
        isValid: false,
        message: `You only have ${packageType.remaining} sessions remaining for ${selectedPackageType}. You're trying to book ${totalSessions} sessions.`,
      };
    }

    return { isValid: true, message: "" };
  };

  // Check for overlapping sessions with existing sessions
  const checkRecurringSessionOverlaps = async (): Promise<{
    hasOverlaps: boolean;
    overlaps: Array<{ date: string; time: string; reason: string }>;
  }> => {
    if (!selectedTrainer || (!isRecurring && recurringSessions.length === 0)) {
      return { hasOverlaps: false, overlaps: [] };
    }

    const overlaps: Array<{ date: string; time: string; reason: string }> = [];

    // Determine what to check for overlaps
    let sessionsToCheck: Array<{
      dayOfWeek: number;
      time: string;
      weeks: number;
      startDate: string;
    }> = [];

    if (recurringSessions.length > 0) {
      // Use confirmed recurring sessions
      sessionsToCheck = recurringSessions;
    } else if (
      isRecurring &&
      recurringWeeks > 0 &&
      selectedDate &&
      selectedTimeSlot
    ) {
      // Use configured recurring weeks (not yet confirmed)
      sessionsToCheck = [
        {
          dayOfWeek: parseLocalDateString(selectedDate).getDay(),
          time: selectedTimeSlot.startTime,
          weeks: recurringWeeks,
          startDate: selectedDate,
        },
      ];
    }

    // Generate all the individual session dates and times
    for (const recurringSession of sessionsToCheck) {
      const startDate = parseLocalDateString(recurringSession.startDate);

      for (let week = 0; week < recurringSession.weeks; week++) {
        const sessionDate = new Date(startDate);
        sessionDate.setDate(startDate.getDate() + week * 7);

        const dateString = formatLocalDate(sessionDate);
        const startTime = recurringSession.time;
        const endTime = addMinutes(new Date(`2000-01-01T${startTime}`), 60)
          .toTimeString()
          .slice(0, 5);

        // Check for overlaps with existing sessions
        // FIXED: Remove trainer_id filter to check all sessions for time slot conflicts
        const { data: existingSessions, error } = await supabase
          .from("sessions")
          .select("date, start_time, end_time, client_id, trainer_id")
          .eq("date", dateString)
          .neq("status", "cancelled");

        if (error) {
          console.error("Error checking for overlaps:", error);
          continue;
        }

        // Check if any existing session overlaps with this time slot
        const hasOverlap = existingSessions?.some((existingSession) => {
          const existingStart = timeToMinutes(existingSession.start_time);
          const existingEnd = timeToMinutes(existingSession.end_time);
          const newStart = timeToMinutes(startTime);
          const newEnd = timeToMinutes(endTime);

          // Check for time overlap
          const timeOverlaps = !(
            newEnd <= existingStart || newStart >= existingEnd
          );

          if (timeOverlaps) {
            // Check if it's the same client (allow client to book multiple sessions)
            if (existingSession.client_id === userProfile?.id) {
              return false; // Same client, no conflict
            }
            return true; // Different client, conflict
          }

          return false;
        });

        if (hasOverlap) {
          overlaps.push({
            date: dateString,
            time: startTime,
            reason: "Time slot already booked by another client",
          });
        }
      }
    }

    return {
      hasOverlaps: overlaps.length > 0,
      overlaps,
    };
  };

  const removeRecurringSession = (index: number) => {
    const newSessions = recurringSessions.filter((_, i) => i !== index);
    setRecurringSessions(newSessions);
    setTotalRecurringSessions(calculateTotalRecurringSessions(newSessions));
  };

  // Additional session functions
  const startAddingAnotherSession = () => {
    setIsAddingAnotherSession(true);
    setAdditionalSessionDate(null);
    setAdditionalSessionDateObj(null);
    setAdditionalSessionTimeSlot(null);
    setAdditionalSessionWeeks(0);
  };

  const confirmAdditionalSession = () => {
    if (
      additionalSessionDate &&
      additionalSessionTimeSlot &&
      additionalSessionWeeks > 0 &&
      additionalSessionDateObj
    ) {
      const newSession: RecurringSession = {
        dayOfWeek: additionalSessionDateObj.getDay(),
        time: additionalSessionTimeSlot.startTime,
        weeks: additionalSessionWeeks,
        startDate: additionalSessionDate,
      };

      // Check if this day/time combination already exists
      const exists = recurringSessions.some(
        (session) =>
          session.dayOfWeek === newSession.dayOfWeek &&
          session.time === newSession.time
      );

      if (exists) {
        alert(
          "A session with this day and time already exists. Please choose a different combination."
        );
        return;
      }

      // Check if adding this session would exceed available sessions
      const totalSessionsAfterAdding = calculateTotalRecurringSessions([
        ...recurringSessions,
        newSession,
      ]);
      const selectedPackageType = getSelectedSessionType()?.name;

      if (selectedPackageType) {
        const packageInfo = sessionsByType.find(
          (pkg) => pkg.type === selectedPackageType
        );

        if (packageInfo && totalSessionsAfterAdding > packageInfo.remaining) {
          alert(
            `You cannot book ${totalSessionsAfterAdding} sessions. You only have ${packageInfo.remaining} sessions remaining in your package.`
          );
          return;
        }
      }

      setRecurringSessions([...recurringSessions, newSession]);
      setTotalRecurringSessions(
        calculateTotalRecurringSessions([...recurringSessions, newSession])
      );

      // Reset additional session state
      setIsAddingAnotherSession(false);
      setAdditionalSessionDate(null);
      setAdditionalSessionDateObj(null);
      setAdditionalSessionTimeSlot(null);
      setAdditionalSessionWeeks(0);
      setAdditionalSessionAvailableSlots([]);
    }
  };

  const cancelAddingAnotherSession = () => {
    setIsAddingAnotherSession(false);
    setAdditionalSessionDate(null);
    setAdditionalSessionDateObj(null);
    setAdditionalSessionTimeSlot(null);
    setAdditionalSessionWeeks(0);
    setAdditionalSessionAvailableSlots([]);
  };

  // Calculate maximum weeks available for additional sessions
  const getMaxWeeksForAdditionalSession = () => {
    const selectedPackageType = getSelectedSessionType()?.name;
    if (!selectedPackageType) return 1;

    const packageInfo = sessionsByType.find(
      (pkg) => pkg.type === selectedPackageType
    );

    if (!packageInfo) return 1;

    // Debug logging
    console.log("[DEBUG] Package info:", packageInfo);
    console.log(
      "[DEBUG] Confirmed sessions:",
      calculateTotalRecurringSessions(recurringSessions)
    );

    // Calculate total sessions already confirmed in this booking flow
    const totalConfirmedSessions =
      calculateTotalRecurringSessions(recurringSessions);

    // Calculate remaining sessions available for additional sessions
    // Original remaining minus sessions confirmed in this flow
    const remainingSessions = Math.max(
      0,
      packageInfo.remaining - totalConfirmedSessions
    );

    console.log(
      "[DEBUG] Remaining sessions for additional:",
      remainingSessions
    );

    // Return the minimum of remaining sessions or a reasonable max (like 12 weeks)
    return Math.min(remainingSessions, 12);
  };

  const handleRecurringSessions = async (
    clientId: string,
    trainer: Trainer,
    profile: UserProfile,
    timezone: string
  ) => {
    const selectedPackageType = getSelectedSessionType()?.name;
    if (!selectedPackageType) {
      throw new Error("Invalid session type");
    }

    // Determine the correct timezone for sessions
    // For in-person sessions, always use trainer timezone regardless of input
    const sessionTimezone = (selectedPackageType === "In-Person Training") 
      ? TRAINER_TIMEZONE 
      : timezone;

    // Get the user's packages for this session type
    const { data: userPackages, error: packagesError } = await supabase
      .from("packages")
      .select("*")
      .eq("client_id", clientId)
      .eq("package_type", selectedPackageType)
      .eq("status", "active")
      .order("purchase_date", { ascending: false });

        if (packagesError) {
          throw new Error(`Failed to fetch packages: ${packagesError.message}`);
        }

        // Calculate total available sessions across all packages
        const availablePackages = (userPackages || [])
          .filter((pkg) => (pkg.sessions_included || 0) - (pkg.sessions_used || 0) > 0)
          .sort((a, b) => new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime()); // Sort by oldest first

        if (!availablePackages.length) {
          throw new Error("No available packages found for this session type");
        }

        // Calculate total available sessions
        const totalAvailableSessions = availablePackages.reduce(
          (total, pkg) => total + ((pkg.sessions_included || 0) - (pkg.sessions_used || 0)),
          0
        );

        // Calculate total sessions needed
        const totalSessions = calculateTotalRecurringSessions(recurringSessions);    // Check if we have enough sessions across all packages
    if (totalAvailableSessions < totalSessions) {
      throw new Error(
        `You only have ${totalAvailableSessions} sessions remaining, but you're trying to book ${totalSessions} sessions`
      );
    }

    // Store created session IDs for potential rollback
    const createdSessionIds: string[] = [];
    const updatedPackages = new Map<string, { package: any; sessionsToAdd: number }>();

    try {
      // Distribute sessions across available packages
      const sessionDistribution = new Map<string, { 
        pkg: any, 
        sessions: Array<RecurringSession>
      }>();
      
      let sessionsToAllocate = [...recurringSessions];
      
      // Allocate sessions to packages
      for (const pkg of availablePackages) {
        if (sessionsToAllocate.length === 0) break;
        
        const packageAvailable = (pkg.sessions_included || 0) - (pkg.sessions_used || 0);
        const sessionsForThisPackage = Math.min(packageAvailable, sessionsToAllocate.length);
        
        if (sessionsForThisPackage <= 0) continue;
        
        // Get sessions for this package
        const allocatedSessions = sessionsToAllocate.slice(0, sessionsForThisPackage);
        sessionDistribution.set(pkg.id, { 
          pkg, 
          sessions: allocatedSessions 
        });
        
        updatedPackages.set(pkg.id, { 
          package: pkg, 
          sessionsToAdd: sessionsForThisPackage 
        });
        
        // Update remaining sessions
        sessionsToAllocate = sessionsToAllocate.slice(sessionsForThisPackage);
      }
      
      // Create sessions for each package
      for (const [packageId, { pkg, sessions }] of sessionDistribution.entries()) {
        for (const session of sessions) {
          // Create multiple sessions for each recurring session (session.weeks times)
          for (let weekIndex = 0; weekIndex < session.weeks; weekIndex++) {
            // Format session date based on start date + week offset
            const sessionDate = format(
              addDays(parseISO(session.startDate), weekIndex * 7),
              'yyyy-MM-dd'
            );
            
            const { data, error } = await supabase
              .from("sessions")
              .insert({
                trainer_id: trainer.id,
                client_id: clientId,
                date: sessionDate,
                start_time: session.time,
                end_time: format(addMinutes(parseISO(`${sessionDate}T${session.time}`), 60), 'HH:mm:ss'),
                type: selectedPackageType,
                timezone: sessionTimezone,
                status: "confirmed"
              })
              .select()
              .single();
              
            if (error) {
              throw new Error(`Failed to create session: ${error.message}`);
            }
            
            if (data) {
              createdSessionIds.push(data.id);
            }
          }
        }
        
        // Update package sessions used count - sum up total individual sessions created
        const totalSessionsCreated = sessions.reduce((sum, session) => sum + session.weeks, 0);
        const { error: updateError } = await supabase
          .from("packages")
          .update({
            sessions_used: (pkg.sessions_used || 0) + totalSessionsCreated,
          })
          .eq("id", packageId);

        if (updateError) {
          throw new Error(`Failed to update package ${packageId}: ${updateError.message}`);
        }
      }
      // Create calendar events for all sessions
      for (const sessionId of createdSessionIds) {
        const { data: session } = await supabase
          .from("sessions")
          .select("*")
          .eq("id", sessionId)
          .single();
          
        if (session) {
          await createCalendarEvents(
            session,
            trainer,
            profile,
            selectedPackageType
          );
        }
      }

      // Send email notifications
      await sendRecurringSessionEmails(
        trainer,
        profile,
        recurringSessions,
        selectedPackageType
      );
    } catch (error) {
      console.error("Error in handleRecurringSessions:", error);

      // Rollback: Delete all created sessions
      if (createdSessionIds.length > 0) {
        console.log("Rolling back created sessions:", createdSessionIds);
        const { error: rollbackError } = await supabase
          .from("sessions")
          .delete()
          .in("id", createdSessionIds);

        if (rollbackError) {
          console.error("Failed to rollback sessions:", rollbackError);
        }
        
        // Rollback all package updates
        for (const [packageId, { package: pkg }] of updatedPackages.entries()) {
          console.log(`Rolling back package ${packageId} update`);
          const { error: packageRollbackError } = await supabase
            .from("packages")
            .update({
              sessions_used: pkg.sessions_used || 0,
            })
            .eq("id", packageId);

          if (packageRollbackError) {
            console.error(
              `Failed to rollback package ${packageId} update:`,
              packageRollbackError
            );
          }
        }
      }

      // Re-throw the error to be handled by the caller
      throw error;
    }
  };

  const createCalendarEvents = async (
    session: any,
    trainer: Trainer,
    profile: UserProfile,
    sessionType: string
  ) => {
    // Determine timezone based on session type
    const isInPerson = sessionType === "In-Person Training";
    const trainerTimezone = TRAINER_TIMEZONE;
    const clientTimezone = isInPerson ? TRAINER_TIMEZONE : getUserTimezone();

    // Create dates in appropriate timezone
    const sessionDate = new Date(`${session.date}T${session.start_time}`);
    const endDate = new Date(`${session.date}T${session.end_time}`);

    // Create trainer calendar event
    try {
      const trainerEventDetails = {
        summary: `${sessionType} with ${profile.full_name}`,
        description: `${sessionType} training session`,
        start: {
          dateTime: sessionDate.toISOString(),
          timeZone: trainerTimezone,
        },
        end: {
          dateTime: endDate.toISOString(), 
          timeZone: trainerTimezone,
        },
        attendees: [{ email: profile.email }, { email: trainer.email }],
        reminders: {
          useDefault: true,
        },
      };

      const trainerEventResponse = await fetch(
        `/api/google/calendar/event?trainerId=${trainer.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trainerEventDetails),
        }
      );

      if (trainerEventResponse.ok) {
        const trainerEventData = await trainerEventResponse.json();
        await supabase
          .from("sessions")
          .update({ google_event_id: trainerEventData.eventId })
          .eq("id", session.id);
      }
    } catch (error) {
      console.warn("Failed to create trainer calendar event:", error);
    }

    // Create client calendar event
    try {
      const clientEventDetails = {
        summary: `${sessionType} with ${trainer.full_name}`,
        description: `${sessionType} training session`,
        start: {
          dateTime: sessionDate.toISOString(),
          timeZone: clientTimezone,
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: clientTimezone,
        },
        attendees: [{ email: profile.email }, { email: trainer.email }],
        reminders: {
          useDefault: true,
        },
      };

      const clientEventResponse = await fetch(
        `/api/google/calendar/client-event?clientId=${session.client_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientEventDetails),
        }
      );

      if (clientEventResponse.ok) {
        const clientEventData = await clientEventResponse.json();
        if (clientEventData.eventId) {
          await supabase
            .from("sessions")
            .update({ client_google_event_id: clientEventData.eventId })
            .eq("id", session.id);
        } else if (clientEventData.error === 'calendar_auth_failed') {
          console.warn('Client calendar sync failed:', clientEventData.message);
          setShowCalendarWarningAfterSuccess(true);
          // Session is still successfully created, just without client calendar sync
        }
      }
    } catch (error) {
      console.warn("Failed to create client calendar event:", error);
    }
  };

  const sendRecurringSessionEmails = async (
    trainer: Trainer,
    profile: UserProfile,
    sessions: RecurringSession[],
    sessionType: string
  ) => {
    const totalSessions = calculateTotalRecurringSessions(sessions);

    const emailPayload = {
      trainer_email: trainer.email,
      trainer_name: trainer.full_name,
      client_name: profile.full_name,
      session_type: sessionType,
      total_sessions: totalSessions,
      recurring_sessions: sessions.map((s) => ({
        day_of_week: getDayShortName(s.dayOfWeek),
        time: s.time,
        weeks: s.weeks,
        start_date: s.startDate,
      })),
    };

    try {
      await fetch("/api/email/recurring-sessions-created", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });
    } catch (error) {
      console.warn("Failed to send recurring session email:", error);
    }
  };

  // Check if we can show the booking button
  const canShowBookingButton = isRecurring
    ? selectedTrainer &&
      selectedType &&
      selectedDate &&
      selectedTimeSlot &&
      recurringSessions.length > 0 &&
      calculateTotalRecurringSessions(recurringSessions) <=
        (sessionsByType.find(
          (pkg) => pkg.type === getSelectedSessionType()?.name
        )?.remaining || 0)
    : selectedTrainer && selectedDate && selectedTimeSlot && selectedType;

  // Fetch trainer availability when trainer is selected
  useEffect(() => {
    const fetchTrainerAvailability = async () => {
      if (!selectedTrainer) return;

      const { data, error } = await supabase
        .from("trainer_availability")
        .select("*")
        .eq("trainer_id", selectedTrainer.id);

      if (error) {
        console.error("Error fetching trainer availability:", error);
        return;
      }

      setTrainerAvailability(data || []);
    };

    fetchTrainerAvailability();
  }, [selectedTrainer, supabase]);

  const handleBookingConfirmation = async () => {
    console.log("Starting booking process...");
    setIsBooking(true);

    // Declare variables at function level for rollback access
    let sessionData: any = null;
    let packageUpdated = false;
    let currentPackage: any = null;
    let packageToUpdate: any = null;

    try {
      // Get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("No authenticated user found");
      }

      // If profile is missing, fetch it
      let currentProfile = userProfile;
      if (!currentProfile) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          throw new Error(`Failed to load profile: ${profileError.message}`);
        }

        if (profile) {
          console.log("Successfully fetched user profile:", profile);
          currentProfile = profile;
          setUserProfile(profile);
        } else {
          throw new Error("No profile found");
        }
      }

      // Validate based on booking type
      if (isRecurring) {
        const validation = validateRecurringSessions();
        if (!validation.isValid) {
          throw new Error(validation.message);
        }

        if (!selectedTrainer || !selectedType || !currentProfile) {
          throw new Error(
            "Required booking data is missing for recurring sessions"
          );
        }
      } else {
        // Single session validation
        const errorDetails = {
          missingTrainer: !selectedTrainer,
          missingDate: !selectedDate,
          missingTimeSlot: !selectedTimeSlot,
          missingType: !selectedType,
          missingUser: !session?.user,
          missingProfile: !currentProfile,
        };

        const missingFields = Object.entries(errorDetails)
          .filter(([_, isMissing]) => isMissing)
          .map(([field]) => field.replace("missing", "").toLowerCase());

        if (missingFields.length > 0) {
          throw new Error(
            `Missing required fields: ${missingFields.join(", ")}`
          );
        }

        if (!selectedTrainer || !selectedTimeSlot || !currentProfile) {
          throw new Error(
            "Required booking data is missing for single session"
          );
        }

        // Ensure selectedTimeSlot is not null for single sessions
        if (!selectedTimeSlot) {
          throw new Error("Please select a time slot for your session");
        }
      }

      // Determine timezone based on session type
      const userTimezone = getUserTimezone();
      const sessionTimezone = (selectedType === "In-Person Training") 
        ? TRAINER_TIMEZONE  // Always use trainer's timezone for in-person
        : userTimezone;     // Use user's timezone for virtual sessions

      if (isRecurring) {
        // Check for overlapping sessions before booking
        const overlapCheck = await checkRecurringSessionOverlaps();
        if (overlapCheck.hasOverlaps) {
          const overlapDetails = overlapCheck.overlaps
            .map((overlap) => `${overlap.date} at ${overlap.time}`)
            .join(", ");

          throw new Error(
            `Cannot book recurring sessions due to conflicts: ${overlapDetails}. ` +
              `These time slots are already booked by other clients. Please choose different dates or times.`
          );
        }

        // Handle recurring sessions
        await handleRecurringSessions(
          session.user.id,
          selectedTrainer,
          currentProfile,
          sessionTimezone
        );

        // Show success dialog for recurring sessions
        setShowBookingDialog(false);
        setShowSuccessDialog(true);
      } else {
        // Handle single session
        if (!selectedTimeSlot) {
          throw new Error("Time slot is required for single sessions");
        }

        const { data: newSessionData, error: sessionError } = await supabase
          .from("sessions")
          .insert({
            client_id: session.user.id,
            trainer_id: selectedTrainer.id,
            date: selectedDate,
            start_time: selectedTimeSlot.startTime,
            end_time: selectedTimeSlot.endTime,
            type: selectedType,
            status: "confirmed",
            timezone: sessionTimezone,
            is_recurring: false,
          })
          .select()
          .single();

        if (sessionError) {
          throw sessionError;
        }

        sessionData = newSessionData;

        // Find the corresponding package type for the session
        const sessionType = sessionTypes.find((t) => t.id === selectedType);
        const sessionTypeName = sessionType?.name;

        console.log("Session type mapping:", {
          selectedTypeId: selectedType,
          foundType: sessionType,
          mappedName: sessionTypeName,
          allTypes: sessionTypes.map((t) => ({ id: t.id, name: t.name })),
        });

        if (!sessionTypeName) {
          throw new Error(`Invalid session type: ${selectedType}`);
        }

        console.log("Finding package for session type:", sessionTypeName);

        // Debug: Check all active packages first
        const { data: allPackages, error: allPackagesError } = await supabase
          .from("packages")
          .select("*")
          .eq("client_id", session.user.id)
          .eq("status", "active");

        console.log("All active packages:", {
          count: allPackages?.length || 0,
          packages: allPackages,
        });

        // Get the user's packages
        const { data: userPackages, error: packagesError } = await supabase
          .from("packages")
          .select("*")
          .eq("client_id", session.user.id)
          .eq("package_type", sessionTypeName)
          .eq("status", "active")
          .order("purchase_date", { ascending: false });

        if (packagesError) {
          console.error("Package lookup error:", packagesError);
          throw packagesError;
        }

        console.log("Package lookup results:", {
          sessionType: selectedType,
          sessionTypeName,
          foundPackages: userPackages?.length || 0,
          packages: userPackages,
        });

        // Find the first package with remaining sessions
        packageToUpdate = userPackages?.find(
          (pkg) => (pkg.sessions_included || 0) - (pkg.sessions_used || 0) > 0
        );

        if (!packageToUpdate) {
          throw new Error("No available package found for this session type");
        }

        console.log("Updating package:", {
          packageId: packageToUpdate.id,
          currentUsed: packageToUpdate.sessions_used,
          newUsed: (packageToUpdate.sessions_used || 0) + 1,
          packageType: packageToUpdate.package_type,
          totalSessions: packageToUpdate.sessions_included,
        });

        // First get the current value to ensure we have the latest
        const { data: currentPackageData, error: getCurrentError } =
          await supabase
            .from("packages")
            .select("sessions_used")
            .eq("id", packageToUpdate.id)
            .single();

        if (getCurrentError) {
          throw new Error(
            `Failed to get current package state: ${getCurrentError.message}`
          );
        }

        currentPackage = currentPackageData;
        console.log("Current package state:", currentPackage);

        // Directly update the sessions_used count
        const { data: updateData, error: updateError } = await supabase
          .from("packages")
          .update({
            sessions_used: (currentPackage?.sessions_used || 0) + 1,
          })
          .eq("id", packageToUpdate.id)
          .select();

        console.log("Package update response:", {
          success: !updateError,
          error: updateError,
          updatedData: updateData,
        });

        if (updateError) {
          throw new Error(`Failed to update package: ${updateError.message}`);
        }

        packageUpdated = true;

        // Verify the update was successful
        const { data: verifyData, error: verifyError } = await supabase
          .from("packages")
          .select("sessions_used")
          .eq("id", packageToUpdate.id)
          .single();

        console.log("Package update verification:", {
          success:
            !verifyError &&
            verifyData?.sessions_used ===
              (currentPackage?.sessions_used || 0) + 1,
          expectedUsed: (currentPackage?.sessions_used || 0) + 1,
          actualUsed: verifyData?.sessions_used,
          verifyError,
        });

        // If verification fails, we should roll back
        if (
          !verifyError &&
          verifyData?.sessions_used !== (currentPackage?.sessions_used || 0) + 1
        ) {
          throw new Error(
            "Failed to verify package update - session has been rolled back"
          );
        }

        // Create calendar events for both trainer and client
        console.log("Creating calendar events for session:", sessionData.id);

        let trainerEventId = null;
        let clientEventId = null;

        // Determine timezone based on session type
        const isInPerson = sessionTypeName === "In-Person Training";
        const trainerTimezone = TRAINER_TIMEZONE;
        const clientTimezone = isInPerson ? TRAINER_TIMEZONE : getUserTimezone();

        // Format dates in local timezone to avoid UTC conversion issues
        const formatDateTime = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };

        // Create dates in local timezone without converting to UTC
        const sessionDate = new Date(
          `${selectedDate}T${selectedTimeSlot.startTime}`
        );
        const endDate = new Date(`${selectedDate}T${selectedTimeSlot.endTime}`);

        // Create event in trainer's calendar with client's name
        try {
          console.log("Creating trainer calendar event for trainer:", {
            trainerId: selectedTrainer.id,
            trainerEmail: selectedTrainer.email,
            sessionId: sessionData.id,
          });

          const trainerEventDetails = {
            summary: `${sessionTypeName} with ${currentProfile.full_name}`,
            description: `${sessionTypeName} training session`,
            start: {
              dateTime: formatDateTime(sessionDate),
              timeZone: trainerTimezone,
            },
            end: {
              dateTime: formatDateTime(endDate),
              timeZone: trainerTimezone,
            },
            attendees: [
              { email: currentProfile.email },
              { email: selectedTrainer.email },
            ],
            reminders: {
              useDefault: true,
            },
          };

          const trainerEventResponse = await fetch(
            `/api/google/calendar/event?trainerId=${selectedTrainer.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(trainerEventDetails),
            }
          );

          if (!trainerEventResponse.ok) {
            const trainerEventResult = await trainerEventResponse.text();
            console.warn("Failed to create trainer calendar event:", {
              status: trainerEventResponse.status,
              statusText: trainerEventResponse.statusText,
              result: trainerEventResult,
            });
          } else {
            const trainerEventData = await trainerEventResponse.json();
            trainerEventId = trainerEventData.eventId;
            console.log(
              "Trainer calendar event created successfully:",
              trainerEventId
            );
          }
        } catch (error) {
          console.warn("Error creating trainer calendar event:", {
            error,
            trainerId: selectedTrainer.id,
            trainerEmail: selectedTrainer.email,
          });
        }

        // Create event in client's calendar with trainer's name
        try {
          const clientEventDetails = {
            summary: `${sessionTypeName} with ${selectedTrainer.full_name}`,
            description: `${sessionTypeName} training session`,
            start: {
              dateTime: formatDateTime(sessionDate),
              timeZone: clientTimezone,
            },
            end: {
              dateTime: formatDateTime(endDate),
              timeZone: clientTimezone,
            },
            attendees: [
              { email: currentProfile.email },
              { email: selectedTrainer.email },
            ],
            reminders: {
              useDefault: true,
            },
          };

          const clientEventResponse = await fetch(
            `/api/google/calendar/client-event?clientId=${session.user.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(clientEventDetails),
            }
          );

          if (!clientEventResponse.ok) {
            const clientEventResult = await clientEventResponse.text();
            console.warn("Failed to create client calendar event:", {
              status: clientEventResponse.status,
              statusText: clientEventResponse.statusText,
              result: clientEventResult,
            });
          } else {
            const clientEventData = await clientEventResponse.json();
            if (clientEventData.eventId) {
              clientEventId = clientEventData.eventId;
              console.log(
                "Client calendar event created successfully:",
                clientEventId
              );
            } else if (clientEventData.error === 'calendar_auth_failed') {
              console.warn('Client calendar sync failed:', clientEventData.message);
              setShowCalendarWarningAfterSuccess(true);
              // Session is still successfully created, just without client calendar sync
            }
          }
        } catch (error) {
          console.warn("Error creating client calendar event:", error);
        }

        // Update session with Google Calendar event IDs if they were created successfully
        if (trainerEventId || clientEventId) {
          try {
            const updateData: any = {};
            if (trainerEventId) {
              updateData.google_event_id = trainerEventId;
            }
            if (clientEventId) {
              updateData.client_google_event_id = clientEventId;
            }

            await supabase
              .from("sessions")
              .update(updateData)
              .eq("id", sessionData.id);
          } catch (error) {
            console.error(
              "Error updating session with Google Calendar event IDs:",
              error
            );
          }
        }

        // Send email notification with type-safe values
        const emailPayload = {
          trainer_email: selectedTrainer.email,
          trainer_name: selectedTrainer.full_name,
          client_name: currentProfile.full_name,
          date: selectedDate,
          start_time: format(
            parseISO(`2000-01-01T${selectedTimeSlot.startTime}`),
            "h:mm a"
          ),
          end_time: format(
            parseISO(`2000-01-01T${selectedTimeSlot.endTime}`),
            "h:mm a"
          ),
          session_type: getSelectedSessionType()?.name || selectedType,
        };

        // Note: Removed sync-all-sessions call to prevent duplicate calendar events
        // Calendar events are now created directly with session validation
        // Note: Removed cleanup function to prevent timezone-related issues

        await fetch("/api/email/session-created", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailPayload),
        });

        setShowBookingDialog(false);
        setShowSuccessDialog(true);
      } // Close the else block for single session
    } catch (error) {
      console.error("Error during booking:", error);

      // Rollback logic for single sessions
      if (!isRecurring && sessionData && packageUpdated) {
        try {
          // Delete the created session
          console.log(
            "Rolling back created session due to error:",
            sessionData.id
          );
          const { error: rollbackError } = await supabase
            .from("sessions")
            .delete()
            .eq("id", sessionData.id);

          if (rollbackError) {
            console.error("Failed to rollback session:", rollbackError);
          }

          // Revert package update
          console.log("Rolling back package update due to error");
          const { error: packageRollbackError } = await supabase
            .from("packages")
            .update({
              sessions_used: currentPackage?.sessions_used || 0,
            })
            .eq("id", packageToUpdate.id);

          if (packageRollbackError) {
            console.error(
              "Failed to rollback package update:",
              packageRollbackError
            );
          }
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to book session. Please try again."
      );
      setShowErrorDialog(true);
    } finally {
      setIsBooking(false);
    }
  }; // Close handleBookingConfirmation function

  // Add loading state display
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Checking session availability...
          </p>
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
          <div className="flex items-center space-x-4">
            <Link href="/client/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Book a Session
            </h1>
          </div>
        </div>
      </div>

      {/* Trainer Selection Modal */}
      <Dialog open={showTrainerModal} onOpenChange={setShowTrainerModal}>
        <DialogContent
          className="sm:max-w-xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Select a Trainer</DialogTitle>
            <DialogDescription>
              Choose a trainer to book your session with
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading trainers...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : trainers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No trainers available at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {trainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => handleTrainerSelect(trainer)}
                  >
                    <Avatar className="h-12 w-12">
                      {trainer.avatar_url ? (
                        <AvatarImage
                          src={`https://gpbarexscmauxziijhxe.supabase.co/storage/v1/object/public/avatars/${trainer.avatar_url}`}
                          alt={trainer.full_name}
                        />
                      ) : (
                        <AvatarFallback className="bg-red-100 text-red-600">
                          {trainer.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {trainer.full_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {trainer.email}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Session Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>Choose Session Type</span>
              </CardTitle>
              <CardDescription>
                Select the type of training session you'd like to book
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessionTypes.map((type) => {
                  // Find corresponding package type to check remaining sessions
                  const packageType = sessionsByType.find(
                    (pkg) => pkg.type === type.name
                  );
                  const sessionsRemaining = packageType?.remaining || 0;
                  const isDisabled = sessionsRemaining === 0;

                  return (
                    <div
                      key={type.id}
                      className={`p-4 border rounded-lg transition-all ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700"
                          : selectedType === type.id
                            ? "border-red-600 dark:border-red-700 bg-red-50 dark:bg-red-900/20 cursor-pointer"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedType(type.id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium dark:text-gray-100">
                          {type.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{type.duration}</Badge>
                          <Badge
                            variant={isDisabled ? "secondary" : "default"}
                            className={
                              isDisabled
                                ? "bg-gray-100 dark:bg-gray-800"
                                : sessionsRemaining === 1
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                  : sessionsRemaining <= 3
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            }
                          >
                            {sessionsRemaining} remaining
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {type.description}
                      </p>
                      {selectedType === type.id && !isDisabled && (
                        <CheckCircle className="h-5 w-5 text-red-600 mt-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          {selectedTrainer && (
            <section>
              <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">
                2. Select Date & Time
              </h2>
              {loadingTimeSlots ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Loading available times...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Date Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          2
                        </span>
                        <span>Select Date</span>
                      </CardTitle>
                      <CardDescription>
                        Choose your preferred training date
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-4">
                        <DatePicker
                          value={
                            selectedDateObj
                              ? formatLocalDate(selectedDateObj)
                              : ""
                          }
                          onChange={(date) => {
                            if (date) {
                              // Parse as local date, not UTC
                              const [year, month, day] = date
                                .split("-")
                                .map(Number);
                              setSelectedDateObj(
                                new Date(year, month - 1, day)
                              );
                            }
                          }}
                          min={getTodayString()}
                          id="booking-date"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div>
                      <h3 className="text-lg font-medium mb-3 dark:text-gray-100">
                        Available Time Slots
                      </h3>
                      {loadingTimeSlots ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {availableTimeSlots.map((slot, index) => (
                            <Button
                              key={index}
                              variant={
                                selectedTimeSlot === slot
                                  ? "default"
                                  : "outline"
                              }
                              className={cn(
                                "w-full",
                                !slot.isAvailable &&
                                  "opacity-50 cursor-not-allowed"
                              )}
                              onClick={() => setSelectedTimeSlot(slot)}
                              disabled={!slot.isAvailable}
                            >
                              {formatTimeForDisplay(slot.startTime, selectedDate, selectedType)}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          No available time slots for the selected date.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Recurring Option */}
                  {selectedDate && selectedTimeSlot && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                            3
                          </span>
                          <span>Recurring Option</span>
                        </CardTitle>
                        <CardDescription>
                          Choose if this session should repeat weekly
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="single-session"
                                name="session-type"
                                checked={!isRecurring}
                                onChange={() => {
                                  setIsRecurring(false);
                                  setRecurringSessions([]);
                                  setRecurringWeeks(0);
                                }}
                                className="text-red-600 focus:ring-red-500"
                              />
                              <label
                                htmlFor="single-session"
                                className="text-sm font-medium"
                              >
                                Single Session
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="recurring-sessions"
                                name="session-type"
                                checked={isRecurring}
                                onChange={() => setIsRecurring(true)}
                                className="text-red-600 focus:ring-red-500"
                              />
                              <label
                                htmlFor="recurring-sessions"
                                className="text-sm font-medium"
                              >
                                Recurring Sessions
                              </label>
                            </div>
                          </div>

                          {isRecurring && (
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                  <label className="block text-sm font-medium mb-2">
                                    Number of Weeks
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full border rounded-md p-2"
                                    value={recurringWeeks}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === "") {
                                        setRecurringWeeks(0);
                                      } else {
                                        const numValue = parseInt(value);
                                        if (!isNaN(numValue) && numValue > 0) {
                                          const maxWeeks =
                                            sessionsByType.find(
                                              (pkg) =>
                                                pkg.type ===
                                                getSelectedSessionType()?.name
                                            )?.remaining || 1;
                                          setRecurringWeeks(
                                            Math.min(numValue, maxWeeks)
                                          );
                                        }
                                      }
                                    }}
                                    placeholder="Enter number of weeks"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Maximum:{" "}
                                    {sessionsByType.find(
                                      (pkg) =>
                                        pkg.type ===
                                        getSelectedSessionType()?.name
                                    )?.remaining || 1}{" "}
                                    weeks
                                  </p>
                                </div>
                              </div>

                              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <h4 className="font-medium mb-2">
                                  Recurring Schedule Preview:
                                </h4>
                                <div className="space-y-2">
                                  {recurringWeeks > 0 ? (
                                    Array.from(
                                      { length: recurringWeeks },
                                      (_, index) => {
                                        // Parse the base date and add weeks
                                        const baseDate = parseLocalDateString(selectedDate);
                                        const sessionDate = addDays(baseDate, index * 7);
                                        
                                        // Format the date in the user's timezone
                                        const formattedDate = format(
                                          sessionDate,
                                          "EEEE, MMMM d, yyyy",
                                        );
                                        
                                        return (
                                          <div
                                            key={index}
                                            className="text-sm text-blue-700 dark:text-blue-300"
                                          >
                                            • {formattedDate} at{" "}
                                            {formatTimeForDisplay(
                                              selectedTimeSlot.startTime,
                                              selectedDate,
                                              selectedType
                                            )}
                                          </div>
                                        );
                                      }
                                    )
                                  ) : (
                                    <p className="text-sm text-gray-500 italic">
                                      Enter number of weeks to see preview
                                    </p>
                                  )}
                                </div>
                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                                  Total sessions:{" "}
                                  {recurringWeeks > 0 ? recurringWeeks : "0"}
                                  {recurringSessions.length > 0 && (
                                    <span className="ml-2 text-green-600 font-medium">
                                      ✓ Confirmed
                                    </span>
                                  )}
                                </p>

                                {/* Overlap Error */}
                                {overlapWarning && (
                                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                    <div className="flex items-start space-x-2">
                                      <span className="text-red-600 text-lg">
                                        ❌
                                      </span>
                                      <div className="text-sm text-red-800 dark:text-red-200">
                                        <p className="font-medium mb-1">
                                          Trainer already has sessions for these
                                          times:
                                        </p>
                                        <div className="space-y-1">
                                          {overlapWarning
                                            .split("\n")
                                            .map((overlap, index) => (
                                              <div key={index} className="ml-2">
                                                • {overlap}
                                              </div>
                                            ))}
                                        </div>
                                        <p className="mt-2 text-xs">
                                          These time slots may already be booked
                                          or the trainer will be busy.
                                        </p>
                                        <p className="mt-1 text-xs">
                                          Please choose different dates or times
                                          to avoid conflicts.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {recurringWeeks > 0 && (
                                  <div className="mt-4 space-y-2">
                                    <Button
                                      onClick={() => {
                                        // Create recurring sessions based on the selected date, time, and weeks
                                        const newRecurringSessions = [
                                          {
                                            dayOfWeek:
                                              parseLocalDateString(
                                                selectedDate
                                              ).getDay(),
                                            time: selectedTimeSlot.startTime,
                                            weeks: recurringWeeks,
                                            startDate: selectedDate,
                                          },
                                        ];
                                        setRecurringSessions(
                                          newRecurringSessions
                                        );
                                      }}
                                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                      disabled={
                                        !selectedDate ||
                                        !selectedTimeSlot ||
                                        recurringWeeks <= 0 ||
                                        overlapWarning !== ""
                                      }
                                    >
                                      {overlapWarning !== ""
                                        ? "Resolve Conflicts First"
                                        : `Confirm ${recurringWeeks} Recurring Session${recurringWeeks !== 1 ? "s" : ""}`}
                                    </Button>

                                    {recurringSessions.length > 0 && (
                                      <div className="space-y-2">
                                        <Button
                                          onClick={startAddingAnotherSession}
                                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                                        >
                                          Add Another Session
                                        </Button>
                                        <Button
                                          onClick={() => {
                                            setRecurringSessions([]);
                                            setRecurringWeeks(0);
                                          }}
                                          variant="outline"
                                          className="w-full"
                                        >
                                          Clear & Start Over
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Additional Session Selection */}
          {isAddingAnotherSession && (
            <section className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      +
                    </span>
                    <span>Add Another Recurring Session</span>
                  </CardTitle>
                  <CardDescription>
                    Select date, time, and duration for an additional recurring
                    session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <h3 className="text-lg font-medium mb-3 dark:text-gray-100">
                      Select Date
                    </h3>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                            1
                          </span>
                          <span>Select Date</span>
                        </CardTitle>
                        <CardDescription>
                          Choose the date for your additional recurring session
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col space-y-4">
                          <DatePicker
                            value={
                              additionalSessionDateObj
                                ? formatLocalDate(additionalSessionDateObj)
                                : ""
                            }
                            onChange={(date) => {
                              if (date) {
                                const [year, month, day] = date
                                  .split("-")
                                  .map(Number);
                                const dateObj = new Date(year, month - 1, day);
                                setAdditionalSessionDateObj(dateObj);
                                setAdditionalSessionDate(
                                  formatLocalDate(dateObj)
                                );
                                setAdditionalSessionTimeSlot(null);
                              }
                            }}
                            min={getTodayString()}
                            id="additional-session-date"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Time Slots */}
                    {additionalSessionDate && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3 dark:text-gray-100">
                          Available Time Slots
                        </h3>
                        {loadingAdditionalTimeSlots ? (
                          <div className="flex items-center justify-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : additionalSessionAvailableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {additionalSessionAvailableSlots.map(
                              (slot, index) => (
                                <Button
                                  key={index}
                                  variant={
                                    additionalSessionTimeSlot === slot
                                      ? "default"
                                      : "outline"
                                  }
                                  className={cn(
                                    "w-full",
                                    !slot.isAvailable &&
                                      "opacity-50 cursor-not-allowed"
                                  )}
                                  onClick={() =>
                                    setAdditionalSessionTimeSlot(slot)
                                  }
                                  disabled={!slot.isAvailable}
                                >
                                  {formatTimeForDisplay(slot.startTime, additionalSessionDate, selectedType)}
                                </Button>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No available time slots for the selected date.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Weeks Selection */}
                    {additionalSessionDate && additionalSessionTimeSlot && (
                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                              2
                            </span>
                            <span>Number of Weeks</span>
                          </CardTitle>
                          <CardDescription>
                            How many weeks should this session repeat?
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">
                                  Number of Weeks
                                </label>
                                <input
                                  type="text"
                                  className="w-full border rounded-md p-2"
                                  value={additionalSessionWeeks}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "") {
                                      setAdditionalSessionWeeks(0);
                                    } else {
                                      const numValue = parseInt(value);
                                      if (!isNaN(numValue) && numValue > 0) {
                                        const maxWeeks =
                                          getMaxWeeksForAdditionalSession();
                                        setAdditionalSessionWeeks(
                                          Math.min(numValue, maxWeeks)
                                        );
                                      }
                                    }
                                  }}
                                  placeholder="Enter number of weeks"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Maximum: {getMaxWeeksForAdditionalSession()}{" "}
                                  weeks
                                  {calculateTotalRecurringSessions(
                                    recurringSessions
                                  ) > 0 && (
                                    <span className="block text-xs text-blue-600 mt-1">
                                      (
                                      {calculateTotalRecurringSessions(
                                        recurringSessions
                                      )}{" "}
                                      sessions already confirmed)
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {additionalSessionWeeks > 0 && (
                              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <h4 className="font-medium mb-2">
                                  Additional Session Preview:
                                </h4>
                                <div className="space-y-2">
                                  {Array.from(
                                    { length: additionalSessionWeeks },
                                    (_, index) => {
                                      // Create a new date object to avoid mutating the original
                                      const sessionDate = new Date(
                                        additionalSessionDateObj!
                                      );
                                      sessionDate.setDate(
                                        sessionDate.getDate() + index * 7
                                      );
                                      return (
                                        <div
                                          key={index}
                                          className="text-sm text-green-700 dark:text-green-300"
                                        >
                                          •{" "}
                                          {format(
                                            sessionDate,
                                            "EEEE, MMMM d, yyyy"
                                          )}{" "}
                                          at{" "}
                                          {formatTimeForDisplay(
                                            additionalSessionTimeSlot.startTime,
                                            format(sessionDate, "yyyy-MM-dd"),
                                            selectedType
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                                  Total additional sessions:{" "}
                                  {additionalSessionWeeks}
                                </p>

                                <div className="mt-4 flex space-x-2">
                                  <Button
                                    onClick={confirmAdditionalSession}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Add This Session
                                  </Button>
                                  <Button
                                    onClick={cancelAddingAnotherSession}
                                    variant="outline"
                                    className="px-6"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Booking Summary and Button */}
          {canShowBookingButton && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>
                  Review your session details before booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Session Type
                    </p>
                    <p className="text-base dark:text-gray-100">
                      {getSelectedSessionType()?.name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Trainer
                    </p>
                    <p className="text-base dark:text-gray-100">
                      {selectedTrainer?.full_name}
                    </p>
                  </div>
                  {isRecurring ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Sessions
                        </p>
                        <p className="text-base dark:text-gray-100">
                          {calculateTotalRecurringSessions(recurringSessions)}{" "}
                          sessions
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Recurring Pattern
                        </p>
                        <p className="text-base dark:text-gray-100">
                          {recurringSessions.length} different time
                          {recurringSessions.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Date
                        </p>
                        <p className="text-base dark:text-gray-100">
                          {getFormattedBookingDate()}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Time
                        </p>
                        <p className="text-base dark:text-gray-100">
                          {getFormattedBookingTime()}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {isRecurring && recurringSessions.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Recurring Sessions:</h4>
                      <Button
                        onClick={startAddingAnotherSession}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Add Another Session
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {recurringSessions.map((session, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between"
                        >
                          <span>
                            • {getDayShortName(session.dayOfWeek)} at{" "}
                            {session.time} for {session.weeks} week
                            {session.weeks !== 1 ? "s" : ""}
                          </span>
                          <Button
                            onClick={() => removeRecurringSession(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                  onClick={() => setShowBookingDialog(true)}
                >
                  {isRecurring
                    ? `Book ${calculateTotalRecurringSessions(recurringSessions)} Sessions`
                    : "Book Session"}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Booking Confirmation Dialog */}
          <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Your Booking</DialogTitle>
                <DialogDescription>
                  Please review the details of your training session
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Session Type */}
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <CalendarIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Session Type</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getSelectedSessionType()?.name} (
                      {getSelectedSessionType()?.duration})
                    </p>
                  </div>
                </div>

                {/* Trainer */}
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Trainer</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedTrainer?.full_name}
                    </p>
                  </div>
                </div>

                {isRecurring ? (
                  <>
                    {/* Total Sessions */}
                    <div className="flex items-start space-x-3">
                      <div className="bg-red-100 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Total Sessions</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {calculateTotalRecurringSessions(recurringSessions)}{" "}
                          sessions
                        </p>
                      </div>
                    </div>

                    {/* Recurring Pattern */}
                    <div className="flex items-start space-x-3">
                      <div className="bg-red-100 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Recurring Pattern</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {recurringSessions.length} different time
                          {recurringSessions.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Recurring Sessions Details */}
                    {recurringSessions.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Individual Sessions</h4>
                          <div className="mt-2 space-y-1">
                            {recurringSessions.map((session, index) => {
                              // Generate individual session dates based on the recurring pattern
                              const individualSessions = [];
                              for (let week = 0; week < session.weeks; week++) {
                                const sessionDate = new Date(session.startDate);
                                sessionDate.setDate(
                                  sessionDate.getDate() + week * 7
                                );
                                individualSessions.push({
                                  date: sessionDate,
                                  time: session.time,
                                });
                              }

                              return individualSessions.map(
                                (individualSession, sessionIndex) => (
                                  <div
                                    key={`${index}-${sessionIndex}`}
                                    className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded"
                                  >
                                    •{" "}
                                    {individualSession.date.toLocaleDateString(
                                      "en-US",
                                      {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )}{" "}
                                    at {individualSession.time}
                                  </div>
                                )
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Date */}
                    <div className="flex items-start space-x-3">
                      <div className="bg-red-100 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Date</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getFormattedBookingDate()}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-start space-x-3">
                      <div className="bg-red-100 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Time</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getFormattedBookingTime()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {isBooking && isRecurring && (
                <div className="px-6 pb-4">
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Setting up your recurring sessions...</span>
                      <span>Please wait</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full animate-pulse"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="flex space-x-2 sm:space-x-0">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingDialog(false)}
                  disabled={isBooking}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleBookingConfirmation}
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isRecurring ? "Creating Sessions..." : "Booking..."}
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>

      {/* Enhanced Loading Overlay for Recurring Sessions */}
      {isBooking && isRecurring && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Creating Your Recurring Sessions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This may take a few moments as we're setting up multiple sessions
              and calendar events.
            </p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <span>Creating database entries...</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div
                  className="w-2 h-2 bg-red-600 rounded-full animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <span>Setting up calendar events...</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div
                  className="w-2 h-2 bg-red-600 rounded-full animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
                <span>Sending notifications...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={(open) => {
        if (!open) {
          // Dialog is being closed
          setShowSuccessDialog(false);
          // Check if we need to show calendar warning
          if (showCalendarWarningAfterSuccess) {
            setShowCalendarWarningAfterSuccess(false);
            setShowCalendarWarning(true);
          } else {
            router.push("/client/dashboard");
          }
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Successful!</AlertDialogTitle>
            <AlertDialogDescription>
              Your training session has been booked successfully. You can view
              your upcoming sessions in your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccessDialog(false);
                // Check if we need to show calendar warning
                if (showCalendarWarningAfterSuccess) {
                  setShowCalendarWarningAfterSuccess(false);
                  setShowCalendarWarning(true);
                } else {
                  router.push("/client/dashboard");
                }
              }}
            >
              Go to Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Failed</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Google Calendar Warning Dialog */}
      <AlertDialog open={showCalendarWarning} onOpenChange={(open) => {
        setShowCalendarWarning(open);
        if (!open) {
          // If dialog is being closed, redirect to dashboard
          router.push("/client/dashboard");
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Google Calendar Sync Issue
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your sessions were successfully booked, but we couldn't sync them to your Google Calendar. 
              Your Google Calendar connection has expired and needs to be refreshed.
              <br /><br />
              To fix this, please go to <strong>Settings</strong> and click <strong>"Sync with Google Calendar"</strong> to reconnect your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowCalendarWarning(false);
              router.push("/client/dashboard");
            }}>
              I'll do this later
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/client/settings" className="bg-red-600 hover:bg-red-700">
                Go to Settings
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Current Sessions Dialog */}
      <Dialog
        open={showCurrentSessionsDialog}
        onOpenChange={(open) => {
          setShowCurrentSessionsDialog(open);
          if (!open) {
            setShowTrainerModal(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Available Training Sessions
            </DialogTitle>
            <DialogDescription>
              You have{" "}
              <span className="font-semibold">{sessionsRemaining}</span> total
              training {sessionsRemaining === 1 ? "session" : "sessions"}{" "}
              remaining across your packages.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {sessionsByType.map((packageType) => (
                <div
                  key={packageType.type}
                  className={`${
                    packageType.remaining >= 4
                      ? "bg-green-50 dark:bg-green-900/20"
                      : packageType.remaining >= 2
                        ? "bg-yellow-50 dark:bg-yellow-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                  } p-4 rounded-lg`}
                >
                  <h3
                    className={`font-semibold ${
                      packageType.remaining >= 4
                        ? "text-green-700 dark:text-green-300"
                        : packageType.remaining >= 2
                          ? "text-yellow-700 dark:text-yellow-300"
                          : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {packageType.type}
                  </h3>
                  <div className="mt-2 flex justify-between items-center">
                    <span
                      className={`text-sm ${
                        packageType.remaining >= 4
                          ? "text-green-600 dark:text-green-300"
                          : packageType.remaining >= 2
                            ? "text-yellow-600 dark:text-yellow-300"
                            : "text-red-600 dark:text-red-300"
                      }`}
                    >
                      {packageType.remaining} remaining
                    </span>
                    <Badge
                      variant="secondary"
                      className={`${
                        packageType.remaining >= 4
                          ? "bg-green-100 dark:bg-green-900/30 dark:text-green-300"
                          : packageType.remaining >= 2
                            ? "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {packageType.remaining}/{packageType.total} sessions
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
              Click continue to proceed with booking your next session.
            </p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              onClick={() => {
                setShowCurrentSessionsDialog(false);
                setShowTrainerModal(true);
              }}
            >
              Continue to Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* No Sessions Dialog */}
      <Dialog
        open={showNoSessionsDialog}
        onOpenChange={(open) => {
          if (!open) {
            router.push("/client/dashboard");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              No Available Sessions
            </DialogTitle>
            <DialogDescription>
              You currently don't have any sessions left. Please purchase a new
              package before booking another session.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {sessionsByType.map((packageType) => (
                <div
                  key={packageType.type}
                  className="bg-red-50 p-4 rounded-lg"
                >
                  <h3 className="font-semibold text-red-700">
                    {packageType.type}
                  </h3>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-red-600">
                      {packageType.remaining} remaining
                    </span>
                    <Badge variant="secondary" className="bg-red-100">
                      {packageType.remaining}/{packageType.total} sessions
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Purchase more sessions to continue booking training sessions.
            </p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/client/dashboard")}
            >
              Back to Dashboard
            </Button>
            <Button onClick={() => router.push("/client/packages")}>
              View Packages
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
