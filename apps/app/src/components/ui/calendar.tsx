import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "@/lib/utils";

export type CalendarProps = any;

function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-4 bg-white rounded-3xl border border-border shadow-md", className)}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
