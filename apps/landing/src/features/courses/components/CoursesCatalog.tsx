"use client";

import React, { useState, useMemo } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import CourseCard from "./CourseCard";

interface CleanCourse {
  id: string;
  title: string;
  description: string;
  image: any;
  price?: string;
  type: "course" | "shop";
}

interface CleanSection {
  id: string;
  title: string;
  courses: CleanCourse[];
}

interface CoursesCatalogProps {
  sections: CleanSection[];
}

export default function CoursesCatalog({ sections }: CoursesCatalogProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Build tabs: "all" + all sections
  const tabs = useMemo(() => {
    return [
      { id: "all", title: "Tutti i corsi" },
      ...sections.map((s) => ({ id: s.id, title: s.title })),
    ];
  }, [sections]);

  // Filter courses based on activeTab and searchQuery
  const filteredSections = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return sections
      .map((section) => {
        // If not "all" tab, filter out non-matching sections
        if (activeTab !== "all" && section.id !== activeTab) {
          return null;
        }

        // Filter courses by search query
        const matchedCourses = section.courses.filter((course) => {
          if (!query) return true;
          return (
            course.title.toLowerCase().includes(query) ||
            course.description.toLowerCase().includes(query)
          );
        });

        if (matchedCourses.length === 0) {
          return null;
        }

        return {
          ...section,
          courses: matchedCourses,
        };
      })
      .filter((s): s is CleanSection => s !== null);
  }, [sections, activeTab, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      {/* Search Input */}
      <div className="max-w-md mx-auto mb-10">
        <div className="relative flex items-center bg-card border border-border/60 rounded-full px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] focus-within:border-primary/50 focus-within:shadow-[0_4px_24px_rgba(var(--primary-rgb),0.06)] transition-all duration-300">
          <MagnifyingGlass className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            type="text"
            placeholder="Cerca un corso o lezione..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider px-2 active:scale-95 transition-transform"
            >
              Cancella
            </button>
          )}
        </div>
      </div>

      {/* Tabs list with horizontal scroll on mobile */}
      <div className="flex justify-start md:justify-center mb-16 overflow-x-auto pb-4 scrollbar-none snap-x -mx-4 px-4 mask-gradient">
        <div className="flex gap-2.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 active:scale-95 snap-center border ${
                  isActive
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tab.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Course grids */}
      <div className="space-y-24">
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => (
            <div key={section.id} className="animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="flex items-center gap-6 mb-10">
                <h2
                  className="text-2xl md:text-4xl font-black uppercase tracking-tight text-foreground whitespace-nowrap"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {section.title}
                </h2>
                <div className="h-[1px] flex-grow bg-gradient-to-r from-primary/45 via-secondary/25 to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.courses.map((course) => (
                  <div key={course.id} className="animate-in fade-in zoom-in-95 duration-500">
                    <CourseCard
                      id={course.id}
                      title={course.title}
                      description={course.description}
                      image={course.image}
                      category={section.title}
                      price={course.price}
                      type={course.type}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 animate-in fade-in duration-300">
            <p className="text-lg text-muted-foreground font-light mb-4">Nessun corso trovato per questa selezione.</p>
            <button
              onClick={() => {
                setActiveTab("all");
                setSearchQuery("");
              }}
              className="text-xs font-extrabold uppercase tracking-widest text-primary border border-primary/20 hover:bg-primary/5 px-6 py-2.5 rounded-full active:scale-95 transition-all"
            >
              Reset filtri
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
