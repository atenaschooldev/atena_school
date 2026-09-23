import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, ...props }, ref) => {
    if (startIcon || endIcon) {
      return (
        <div className="relative flex items-center w-full min-w-0">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none flex items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5 z-10">
              {startIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            data-slot="input"
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-xl border border-border/80 bg-background px-3 py-2 text-xs sm:text-sm font-medium shadow-2xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              startIcon && "pl-9",
              endIcon && "pr-9",
              className
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 flex items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5 z-10">
              {endIcon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-xl border border-border/80 bg-background px-3 py-2 text-xs sm:text-sm font-medium shadow-2xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }

