"use client";

import { useTranslations } from "next-intl";
import { UserCircle } from "@phosphor-icons/react";
import Image from "next/image";

interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  // Teachers might have custom fields in another format or table, 
  // but using roles from 'profiles' is a standard fallback
  description?: string;
}

interface TeachersSectionProps {
  data?: Profile[];
}

export default function TeachersSection({ data }: TeachersSectionProps) {
  const t = useTranslations("teachers");
  
  // Only display if there are actually teachers (or return early if none)
  // If data is missing but we want to show a skeleton or placeholder, we skip that and either render empty state or full list.
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <section id="teachers" className="relative py-16 px-4 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-4">
            {t("title")}
          </h2>
          <div className="h-2 w-24 bg-primary mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((teacher, idx) => (
            <div key={teacher.id || idx} className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border group hover:-translate-y-2 transition-all duration-300">
              <div className="aspect-[4/3] bg-muted relative overflow-hidden flex items-center justify-center">
                {teacher.avatar_url ? (
                  <Image
                    src={teacher.avatar_url}
                    alt={teacher.full_name || "Teacher"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <UserCircle className="w-24 h-24 text-muted-foreground/30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
              </div>
              <div className="p-6 relative -mt-12 bg-card mx-4 rounded-xl shadow-sm z-10 border border-border/50 text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {teacher.full_name || "Teacher"}
                </h3>
                <div className="h-px w-8 bg-primary mx-auto mb-4" />
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {teacher.description || "Passionate about languages and teaching."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
