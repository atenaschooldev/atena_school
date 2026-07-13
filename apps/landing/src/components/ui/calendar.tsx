import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = any;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-between items-center px-1 mb-4",
        caption_label: "text-lg font-black uppercase tracking-tight text-foreground",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300"
        ),
        table: "w-full border-collapse",
        head_row: "flex justify-between mb-2",
        head_cell: "text-muted-foreground w-10 font-bold text-[0.7rem] uppercase tracking-widest text-center",
        row: "flex w-full justify-between mt-1",
        cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 font-bold rounded-xl transition-all duration-200 hover:bg-primary/5 hover:text-primary aria-selected:opacity-100 flex flex-col items-center justify-center gap-1 relative overflow-hidden"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg shadow-primary/30 scale-105",
        day_today: "border-2 border-primary/20 text-primary font-black",
        day_outside: "text-muted-foreground/30 opacity-50",
        day_disabled: "text-muted-foreground/20 cursor-not-allowed opacity-30",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      modifiersClassNames={{
        day_free: "after:content-[''] after:w-1 after:h-1 after:bg-primary after:rounded-full after:absolute after:bottom-2",
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
