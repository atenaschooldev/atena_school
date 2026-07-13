"use client";

import { Link, usePathname } from "@/i18n/routing";
import { BookOpen, Users, FileText, Star, Settings, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { label: "Corsi (Courses)", href: "/admin/courses", icon: BookOpen },
  { label: "Shop & Servizi", href: "/admin/shop", icon: ShoppingBag },
  { label: "Insegnanti (Teachers)", href: "/admin/teachers", icon: Users },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Recensioni (Reviews)", href: "/admin/reviews", icon: Star },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="pt-32 pb-20 px-4 bg-[#f8f9fa] min-h-screen">
      <div className="max-w-7xl mx-auto w-full animate-in fade-in transition-all">
        <div className="flex flex-col md:flex-row gap-10">
          <aside className="w-full md:w-64 shrink-0">
            <div className="font-bold text-xl pb-6 mb-6 border-b border-border/50 flex items-center gap-3 text-foreground">
              <Settings className="w-5 h-5 text-primary" />
              Pannello Admin
            </div>
            <nav className="flex flex-col gap-2">
              {adminNav.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    // @ts-ignore
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                      isActive 
                        ? "bg-white text-primary shadow-sm border border-border/50" 
                        : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                    )}
                  >
                    <link.icon className={cn("w-4 h-4", isActive && "text-primary")} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <section className="flex-1 bg-white border border-border/50 rounded-3xl p-8 shadow-sm min-h-[600px]">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
