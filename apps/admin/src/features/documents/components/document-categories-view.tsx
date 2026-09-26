"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FolderTree,
  FileText,
  Briefcase,
  Receipt,
  ShieldCheck,
  Award,
  Landmark,
  CheckCircle2,
} from "lucide-react";
import { useDocumentCategories } from "../hooks/use-document-categories";
import { useDocumentTemplates } from "../hooks/use-document-templates";
import { DOCUMENT_CATEGORY_DICTIONARY } from "../types";

const ICON_MAP: Record<string, React.ReactNode> = {
  "file-text": <FileText className="h-5 w-5 text-blue-500" />,
  "briefcase": <Briefcase className="h-5 w-5 text-amber-500" />,
  "receipt": <Receipt className="h-5 w-5 text-emerald-500" />,
  "shield-check": <ShieldCheck className="h-5 w-5 text-purple-500" />,
  "award": <Award className="h-5 w-5 text-indigo-500" />,
  "landmark": <Landmark className="h-5 w-5 text-rose-500" />,
};

export function DocumentCategoriesView() {
  const { categories, isLoading } = useDocumentCategories();
  const { templates } = useDocumentTemplates();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/70 bg-card/70 backdrop-blur-sm shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-primary" />
            Categorie Documentali & Classificazione
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Classificazione gerarchica dei documenti per studenti, docenti, amministrazione e adempimenti fiscali/legali.
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono w-fit bg-primary/5 text-primary border-primary/20">
          {categories.length} Categorie Attive
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const dict = DOCUMENT_CATEGORY_DICTIONARY[cat.category_type];
          const iconNode = ICON_MAP[cat.icon] || <FileText className="h-5 w-5 text-blue-500" />;
          const countTemplates = templates.filter((t) => t.category_type === cat.category_type).length;

          return (
            <Card
              key={cat.id}
              className="border border-border/70 bg-card/70 backdrop-blur-sm shadow-xs rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2.5 bg-muted/70 rounded-xl border border-border/50">{iconNode}</div>
                  <Badge variant="outline" className="text-[10px] font-mono bg-muted/50 border-border/60">
                    ID: {cat.category_type}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-bold mt-2 text-foreground">
                  {cat.name_it}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {cat.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 text-[11px] text-muted-foreground">
                <div className="flex justify-between items-center pt-3 border-t border-border/40">
                  <span className="font-mono text-xs font-medium text-foreground">
                    <strong>{countTemplates}</strong> modelli associati
                  </span>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Attivo
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
