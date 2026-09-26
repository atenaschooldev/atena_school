"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderTree,
  FileText,
  Briefcase,
  Receipt,
  ShieldCheck,
  Award,
  Landmark,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useDocumentCategories } from "../hooks/use-document-categories";
import { useDocumentTemplates } from "../hooks/use-document-templates";
import {
  DOCUMENT_CATEGORY_DICTIONARY,
  type DocumentCategoryRecord,
  type CreateDocumentCategoryDto,
  type UpdateDocumentCategoryDto,
} from "../types";
import { CreateCategoryDialog } from "./create-category-dialog";

const ICON_MAP: Record<string, React.ReactNode> = {
  "file-text": <FileText className="h-5 w-5 text-blue-500" />,
  "briefcase": <Briefcase className="h-5 w-5 text-amber-500" />,
  "receipt": <Receipt className="h-5 w-5 text-emerald-500" />,
  "shield-check": <ShieldCheck className="h-5 w-5 text-purple-500" />,
  "award": <Award className="h-5 w-5 text-indigo-500" />,
  "landmark": <Landmark className="h-5 w-5 text-rose-500" />,
};

export function DocumentCategoriesView() {
  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
  } = useDocumentCategories();
  const { templates } = useDocumentTemplates();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DocumentCategoryRecord | null>(null);

  const handleCreateOrUpdate = async (dto: any) => {
    if (editingCategory) {
      await updateCategory({
        id: editingCategory.id,
        data: dto as UpdateDocumentCategoryDto,
      });
      setEditingCategory(null);
    } else {
      await createCategory(dto as CreateDocumentCategoryDto);
      setIsCreateOpen(false);
    }
  };

  const handleDelete = async (cat: DocumentCategoryRecord) => {
    if (cat.is_system) {
      alert(`La categoria "${cat.name_it}" è una categoria di sistema fondamentale e non può essere eliminata.`);
      return;
    }

    const count = templates.filter((t) => t.category_type === cat.category_type).length;
    if (count > 0) {
      const confirmed = window.confirm(
        `Attenzione: ci sono ${count} modelli associati a questa categoria. Sei sicuro di voler eliminare la categoria "${cat.name_it}"?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(`Sei sicuro di voler eliminare la categoria "${cat.name_it}"?`);
      if (!confirmed) return;
    }

    await deleteCategory(cat.id);
  };

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

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono w-fit bg-primary/5 text-primary border-primary/20">
            {categories.length} Categorie
          </Badge>
          <Button
            size="sm"
            onClick={() => {
              setEditingCategory(null);
              setIsCreateOpen(true);
            }}
            className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nuova Categoria
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const dict = DOCUMENT_CATEGORY_DICTIONARY[cat.category_type];
          const iconNode = ICON_MAP[cat.icon] || <FileText className="h-5 w-5 text-blue-500" />;
          const countTemplates = templates.filter((t) => t.category_type === cat.category_type).length;

          return (
            <Card
              key={cat.id}
              className="border border-border/70 bg-card/70 backdrop-blur-sm shadow-xs rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2.5 bg-muted/70 rounded-xl border border-border/50">{iconNode}</div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] font-mono bg-muted/50 border-border/60">
                      ID: {cat.category_type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsCreateOpen(true);
                      }}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Modifica categoria"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {!cat.is_system && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(cat)}
                        disabled={isDeleting}
                        className="h-7 w-7 text-rose-500/70 hover:text-rose-600 hover:bg-rose-500/10"
                        title="Elimina categoria"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardTitle className="text-sm font-bold mt-2 text-foreground">
                  {cat.name_it}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {cat.description || "Nessuna descrizione specificata"}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 text-[11px] text-muted-foreground">
                <div className="flex justify-between items-center pt-3 border-t border-border/40">
                  <span className="font-mono text-xs font-medium text-foreground">
                    <strong>{countTemplates}</strong> modelli associati
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${
                      cat.is_active
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cat.is_active ? "Attivo" : "Disattivo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create / Edit Category Modal */}
      <CreateCategoryDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
        onSubmit={handleCreateOrUpdate}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
