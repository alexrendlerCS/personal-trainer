import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  placeholder?: string;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  min,
  placeholder = "mm/dd/yyyy",
  id,
}: DatePickerProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close calendar on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    }
    if (show) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [show]);

  // Helper to parse YYYY-MM-DD to local Date
  function parseLocalDateString(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return (
    <div className="relative" ref={ref}>
      <input
        id={id}
        type="text"
        value={
          value
            ? (() => {
                const [year, month, day] = value.split("-").map(Number);
                return new Date(year, month - 1, day).toLocaleDateString();
              })()
            : ""
        }
        readOnly
        placeholder={placeholder}
        className="pr-10 pl-3 w-full h-10 cursor-pointer border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm font-normal dark:bg-gray-900 dark:text-gray-100"
        onClick={() => setShow((s) => !s)}
        autoComplete="off"
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
      >
        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </button>
      {show && (
        <div className="absolute z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded shadow mt-2 left-0">
          <DayPicker
            mode="single"
            selected={value ? parseLocalDateString(value) : undefined}
            onSelect={(date) => {
              setShow(false);
              if (date) {
                // Always use local date, never toISOString
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                onChange(`${year}-${month}-${day}`);
              }
            }}
            disabled={min ? { before: parseLocalDateString(min) } : undefined}
            initialFocus
            className="p-2"
            classNames={{
              caption_label: "text-sm font-medium dark:text-gray-100",
              head_cell: "text-gray-500 dark:text-gray-400 w-9 text-[0.8rem]",
              day: "h-9 w-9 p-0 font-normal",
              day_selected: "bg-red-600 text-white hover:bg-red-700",
              day_today:
                "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300 ring-1 ring-red-500 dark:ring-red-700",
              day_outside: "text-gray-400 dark:text-gray-600",
              months: "p-1",
              table: "w-full border-collapse",
              row: "flex w-full mt-2",
            }}
          />
        </div>
      )}
    </div>
  );
}
