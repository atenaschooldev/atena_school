"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export interface CellCopyableIdProps {
  id?: string | null;
  prefix?: string;
  className?: string;
}

export function CellCopyableId({ id, prefix = "#", className }: CellCopyableIdProps) {
  const [copied, setCopied] = useState(false);

  if (!id) return <span className="text-muted-foreground text-xs font-mono">—</span>;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("ID copiato negli appunti!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shortId = id.length > 8 ? id.slice(0, 8) : id;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground font-mono transition-all duration-150 cursor-pointer border border-transparent hover:border-border select-none group ${className || ""}`}
      title={`${id} (Clicca per copiare)`}
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
      ) : (
        <Copy className="w-3 h-3 opacity-40 group-hover:opacity-100 shrink-0 transition-opacity" />
      )}
      <span>{prefix}{shortId}</span>
    </button>
  );
}

