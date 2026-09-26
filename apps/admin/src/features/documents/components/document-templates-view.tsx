"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Layers,
  Sliders,
  Sparkles,
  Plus,
  Search,
  Receipt,
  Briefcase,
  ShieldCheck,
  Award,
  Copy,
  Trash2,
} from "lucide-react";
import {
  DOCUMENT_CATEGORY_DICTIONARY,
  DOCUMENT_FORMAT_DICTIONARY,
  DocumentCategoryType,
  type DocumentTemplateRecord,
  type CreateDocumentTemplateDto,
} from "../types";
import { useDocumentTemplates } from "../hooks/use-document-templates";
import { DocumentEditorDrawer } from "./document-editor-drawer";
import { CreateTemplateDialog } from "./create-template-dialog";
import { GenerateDocumentDialog } from "./generate-document-dialog";
import { useTranslation } from "@/i18n/context";
import { toast } from "sonner";

export function DocumentTemplatesView() {
  const { t, locale } = useTranslation();
  const tr = (key: string, fallback: string) => t(key) || fallback;

  const {
    templates,
    isLoading,
    createTemplate,
    duplicateTemplate,
    updateTemplate,
    deleteTemplate,
    isCreating,
    isDuplicating,
    isUpdating,
    isDeleting,
  } = useDocumentTemplates();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplateRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [generatingTemplate, setGeneratingTemplate] = useState<DocumentTemplateRecord | null>(null);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = tpl.name.toLowerCase().includes(q);
        const matchDesc = tpl.description?.toLowerCase().includes(q) || false;
        if (!matchName && !matchDesc) return false;
      }

      if (categoryFilter !== "all") {
        if (String(tpl.category_type) !== categoryFilter) return false;
      }

      return true;
    });
  }, [templates, search, categoryFilter]);

  const handleOpenEditor = (tpl: DocumentTemplateRecord) => {
    setEditingTemplate(tpl);
    setIsDrawerOpen(true);
  };

  const handleCreateTemplate = async (dto: CreateDocumentTemplateDto) => {
    const created = await createTemplate(dto);
    if (created) {
      setIsCreateOpen(false);
      setEditingTemplate(created);
      setIsDrawerOpen(true);
    }
  };

  const handleDuplicate = async (tpl: DocumentTemplateRecord) => {
    await duplicateTemplate(tpl.id);
  };

  const handleDelete = async (tpl: DocumentTemplateRecord) => {
    if (tpl.is_system) {
      toast.error(tr("documents.categories.systemProtected", "Questo è un template di sistema fondamentale e non può essere eliminato."));
      return;
    }

    const confirmMsg = tr("documents.templates.deleteConfirm", `Sei sicuro di voler eliminare il modello '{name}'? L'azione è irreversibile.`).replace("{name}", tpl.name);
    if (!window.confirm(confirmMsg)) return;

    await deleteTemplate(tpl.id);
  };

  const handleToggleActive = async (tpl: DocumentTemplateRecord, newActive: boolean) => {
    await updateTemplate({
      id: tpl.id,
      data: { is_active: newActive },
    });
  };

  const getCategoryIcon = (categoryType: DocumentCategoryType) => {
    switch (categoryType) {
      case DocumentCategoryType.STUDENT_CONTRACTS:
        return FileText;
      case DocumentCategoryType.TEACHER_CONTRACTS:
        return Briefcase;
      case DocumentCategoryType.FINANCIAL:
        return Receipt;
      case DocumentCategoryType.LEGAL_AND_PRIVACY:
        return ShieldCheck;
      case DocumentCategoryType.CERTIFICATES:
        return Award;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/70 bg-card/70 backdrop-blur-sm shadow-xs">
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={tr("documents.templates.searchPlaceholder", "Cerca modelli per nome o descrizione...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9 bg-background/80"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={categoryFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("all")}
            className="text-xs h-8 cursor-pointer"
          >
            {tr("documents.filterAllCategories", "Tutti")} ({templates.length})
          </Button>
          {Object.entries(DOCUMENT_CATEGORY_DICTIONARY).map(([catId, dict]) => {
            const count = templates.filter((t) => String(t.category_type) === catId).length;
            if (count === 0) return null;
            return (
              <Button
                key={catId}
                variant={categoryFilter === catId ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(catId)}
                className="text-xs h-8 whitespace-nowrap cursor-pointer"
              >
                {locale === "en" ? dict.label_en : dict.label_it} ({count})
              </Button>
            );
          })}

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground ml-2 shrink-0 cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {tr("documents.templates.newTemplate", "Nuovo Modello")}
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-56 bg-muted/40 rounded-xl" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border/80 bg-card/40">
          <Layers className="h-10 w-10 text-muted-foreground/60 mb-3" />
          <h4 className="text-sm font-semibold text-foreground">
            {tr("documents.emptyTemplatesTitle", "Nessun modello disponibile")}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {tr("documents.emptyTemplatesDesc", "Crea o configura i modelli di documenti nel Visual Builder.")}
          </p>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {tr("documents.templates.newTemplate", "Nuovo Modello")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tpl) => {
            const cat = DOCUMENT_CATEGORY_DICTIONARY[tpl.category_type];
            const fmt = DOCUMENT_FORMAT_DICTIONARY[tpl.paper_format];
            const blocksCount = tpl.blocks_config?.blocks?.length || 0;
            const Icon = getCategoryIcon(tpl.category_type);

            return (
              <Card
                key={tpl.id}
                className="group hover:border-primary/50 hover:shadow-md transition-all duration-200 border border-border/70 bg-card/70 backdrop-blur-sm rounded-xl flex flex-col justify-between"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="text-[11px] font-semibold bg-muted/50 border-border/60">
                        {locale === "en" ? cat?.label_en : cat?.label_it || "Generale"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded-md">
                        {locale === "en" ? fmt?.label_en : fmt?.label_it || "A4 Verticale"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(tpl)}
                        disabled={isDuplicating}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title={tr("documents.templates.duplicate", "Duplica modello")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      {!tpl.is_system && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tpl)}
                          disabled={isDeleting}
                          className="h-7 w-7 text-rose-500/70 hover:text-rose-600 hover:bg-rose-500/10"
                          title={tr("documents.templates.delete", "Elimina modello")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <CardTitle className="text-sm font-bold leading-tight group-hover:text-primary transition-colors mt-1">
                    {tpl.name}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {tpl.description || (locale === "en" ? "No description specified" : "Nessuna descrizione specificata")}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0">
                  <div className="flex items-center justify-between py-2 border-t border-border/40 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      <strong>{blocksCount}</strong> {locale === "en" ? "blocks" : "blocchi"}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium">
                        {tpl.is_active
                          ? tr("documents.templates.active", "Attivo")
                          : tr("documents.templates.inactive", "Disattivo")}
                      </span>
                      <Switch
                        checked={tpl.is_active}
                        onCheckedChange={(checked) => handleToggleActive(tpl, checked)}
                        disabled={isUpdating}
                        className="scale-75 cursor-pointer data-[state=checked]:bg-emerald-600"
                        aria-label="Stato modello"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditor(tpl)}
                      className="h-8 text-xs font-semibold cursor-pointer border-border/70 hover:bg-muted"
                    >
                      <Sliders className="h-3.5 w-3.5 mr-1.5 text-primary" />
                      {tr("documents.templates.editBlocks", "Visual Builder")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setGeneratingTemplate(tpl)}
                      className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      {tr("documents.templates.generate", "Genera")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Template Dialog */}
      <CreateTemplateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateTemplate}
        isLoading={isCreating}
      />

      {/* Visual Document Builder Drawer */}
      <DocumentEditorDrawer
        template={editingTemplate}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isLoading={isUpdating}
        onSave={async (updatedConfig) => {
          if (!editingTemplate) return;
          const res = await updateTemplate({
            id: editingTemplate.id,
            data: {
              blocks_config: updatedConfig,
              paper_format: updatedConfig.paper_format,
            },
          });
          setEditingTemplate(res);
        }}
      />

      {/* Generate Dialog */}
      {generatingTemplate && (
        <GenerateDocumentDialog
          open={!!generatingTemplate}
          onOpenChange={(open) => !open && setGeneratingTemplate(null)}
          defaultTemplateType={generatingTemplate.template_type}
        />
      )}
    </div>
  );
}
