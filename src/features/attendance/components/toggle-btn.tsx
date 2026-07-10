import React from "react";
import { Button } from "@/components/ui/button";

interface ToggleBtnProps {
  active: boolean;
  onClick: () => void;
  tone: "success" | "destructive" | "warning";
  icon: React.ReactNode;
  label: string;
}

export function ToggleBtn({ active, onClick, tone, icon, label }: ToggleBtnProps) {
  const activeCls = {
    success: "bg-success text-success-foreground border-success",
    destructive: "bg-destructive text-destructive-foreground border-destructive",
    warning: "bg-warning text-warning-foreground border-warning",
  }[tone];

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      className={`h-8 gap-1.5 text-xs ${active ? activeCls : ""}`}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
