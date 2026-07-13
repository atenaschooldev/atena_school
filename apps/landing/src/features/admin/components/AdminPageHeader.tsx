import { AdminSearch } from "@/features/admin/components/AdminSearch";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  searchPlaceholder?: string;
  addLink: string;
  addLabel?: string;
  children?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  searchPlaceholder = "Cerca...",
  addLink,
  addLabel = "Nuovo",
  children
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-1 text-foreground">{title}</h2>
        <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <AdminSearch placeholder={searchPlaceholder} />
        {children}
        <Link href={addLink} scroll={false}>
          <Button className="shrink-0 rounded-full font-bold shadow-md hover:scale-105 transition-transform h-10 px-5 bg-foreground text-background hover:bg-primary">
            <Plus className="w-4 h-4 mr-2" />
            {addLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}
