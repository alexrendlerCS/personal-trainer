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
        <div
          className="absolute z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg mt-2 left-0"
          style={{
            minWidth: "280px",
            maxWidth: "calc(100vw - 2rem)",
            right: "auto",
          }}
        >
          <div className="p-3">
            <style
              dangerouslySetInnerHTML={{
                __html: `
                .custom-datepicker .rdp {
                  --rdp-cell-size: 32px;
                  --rdp-accent-color: #dc2626;
                  --rdp-background-color: #f3f4f6;
                  margin: 0;
                  padding: 0;
                }
                
                .custom-datepicker .rdp-caption {
                  display: flex !important;
                  align-items: center !important;
                  justify-content: space-between !important;
                  padding: 0 4px !important;
                  margin-bottom: 8px !important;
                  width: 100% !important;
                }
                
                .custom-datepicker .rdp-caption_label {
                  font-size: 14px !important;
                  font-weight: 500 !important;
                  color: #111827 !important;
                  margin: 0 !important;
                }
                
                .custom-datepicker .rdp-nav {
                  display: flex !important;
                  align-items: center !important;
                  gap: 4px !important;
                }
                
                .custom-datepicker .rdp-button {
                  width: 32px !important;
                  height: 32px !important;
                  padding: 0 !important;
                  border: 1px solid #d1d5db !important;
                  background: white !important;
                  border-radius: 6px !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  cursor: pointer !important;
                  transition: all 0.2s !important;
                }
                
                .custom-datepicker .rdp-button:hover {
                  background: #f3f4f6 !important;
                  border-color: #9ca3af !important;
                }
                
                .custom-datepicker .rdp-table {
                  width: 100% !important;
                  border-collapse: collapse !important;
                  margin: 0 !important;
                }
                
                .custom-datepicker .rdp-head {
                  display: table-header-group !important;
                }
                
                .custom-datepicker .rdp-head_row {
                  display: table-row !important;
                }
                
                .custom-datepicker .rdp-head_cell {
                  display: table-cell !important;
                  width: 32px !important;
                  height: 32px !important;
                  text-align: center !important;
                  vertical-align: middle !important;
                  font-size: 12px !important;
                  font-weight: 500 !important;
                  color: #6b7280 !important;
                  padding: 0 !important;
                }
                
                .custom-datepicker .rdp-tbody {
                  display: table-row-group !important;
                }
                
                .custom-datepicker .rdp-row {
                  display: table-row !important;
                }
                
                .custom-datepicker .rdp-cell {
                  display: table-cell !important;
                  width: 32px !important;
                  height: 32px !important;
                  text-align: center !important;
                  vertical-align: middle !important;
                  padding: 0 !important;
                }
                
                .custom-datepicker .rdp-day {
                  width: 32px !important;
                  height: 32px !important;
                  padding: 0 !important;
                  border: none !important;
                  background: transparent !important;
                  border-radius: 6px !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  font-size: 14px !important;
                  cursor: pointer !important;
                  transition: all 0.2s !important;
                  color: #111827 !important;
                }
                
                .custom-datepicker .rdp-day:hover {
                  background: #f3f4f6 !important;
                }
                
                .custom-datepicker .rdp-day_selected {
                  background: #dc2626 !important;
                  color: white !important;
                }
                
                .custom-datepicker .rdp-day_selected:hover {
                  background: #b91c1c !important;
                }
                
                .custom-datepicker .rdp-day_today {
                  background: #fef2f2 !important;
                  color: #dc2626 !important;
                  font-weight: 600 !important;
                  border: 1px solid #fca5a5 !important;
                }
                
                .custom-datepicker .rdp-day_outside {
                  color: #9ca3af !important;
                  opacity: 0.5 !important;
                }
                
                .custom-datepicker .rdp-day_disabled {
                  color: #d1d5db !important;
                  cursor: not-allowed !important;
                }
                
                .custom-datepicker .rdp-day_disabled:hover {
                  background: transparent !important;
                }
                
                /* Dark mode styles */
                .dark .custom-datepicker .rdp-caption_label {
                  color: #f9fafb !important;
                }
                
                .dark .custom-datepicker .rdp-button {
                  background: #374151 !important;
                  border-color: #4b5563 !important;
                  color: #f9fafb !important;
                }
                
                .dark .custom-datepicker .rdp-button:hover {
                  background: #4b5563 !important;
                  border-color: #6b7280 !important;
                }
                
                .dark .custom-datepicker .rdp-head_cell {
                  color: #9ca3af !important;
                }
                
                .dark .custom-datepicker .rdp-day {
                  color: #f9fafb !important;
                }
                
                .dark .custom-datepicker .rdp-day:hover {
                  background: #4b5563 !important;
                }
                
                .dark .custom-datepicker .rdp-day_today {
                  background: #7f1d1d !important;
                  color: #fca5a5 !important;
                  border-color: #dc2626 !important;
                }
                
                .dark .custom-datepicker .rdp-day_outside {
                  color: #6b7280 !important;
                }
                
                .dark .custom-datepicker .rdp-day_disabled {
                  color: #4b5563 !important;
                }
              `,
              }}
            />
            <div className="custom-datepicker">
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
                disabled={
                  min ? { before: parseLocalDateString(min) } : undefined
                }
                initialFocus
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
