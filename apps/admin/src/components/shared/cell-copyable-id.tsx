"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export interface CellCopyableIdProps {
  id: string;
  prefix?: string;
  className?: string;
}

export function CellCopyableId({ id, prefix = "#", className }: CellCopyableIdProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("ID copiato negli appunti!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono hover:text-primary transition-colors cursor-pointer ${className || ""}`}
      title="Clicca per copiare l'ID"
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
      ) : (
        <Copy className="w-3 h-3 opacity-60 shrink-0" />
      )}
      <span>{prefix}{id.slice(0, 8)}</span>
    </button>
  );
}
