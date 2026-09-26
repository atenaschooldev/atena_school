import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Layers,
  Settings,
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import {
  DOCUMENT_CATEGORY_DICTIONARY,
  DOCUMENT_FORMAT_DICTIONARY,
  type DocumentTemplateRecord,
} from '../types';
import { useDocumentTemplates } from '../hooks/use-document-templates';
import { VisualDocumentBuilder } from './builder/visual-document-builder';

export function DocumentTemplatesView() {
  const { templates, isLoading, updateTemplate, isUpdating } = useDocumentTemplates();
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplateRecord | null>(null);

  if (editingTemplate) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingTemplate(null)}
            className="text-xs font-semibold"
          >
            ← Torna alla lista modelli
          </Button>
        </div>

        <VisualDocumentBuilder
          template={editingTemplate}
          isSaving={isUpdating}
          onSave={async (updatedConfig) => {
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground">Modelli di Documenti Ufficiali</h3>
        <p className="text-xs text-muted-foreground">
          Gestisci e personalizza la struttura a blocchi, i testi, le informative e il layout per ogni documento della scuola.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-48 bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tpl) => {
            const cat = DOCUMENT_CATEGORY_DICTIONARY[tpl.category_type];
            const fmt = DOCUMENT_FORMAT_DICTIONARY[tpl.paper_format];
            const blocksCount = tpl.blocks_config?.blocks?.length || 0;

            return (
              <Card
                key={tpl.id}
                className="group hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-sm flex flex-col justify-between"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-[11px] font-semibold bg-muted/50">
                      {cat?.label_it || 'Generale'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-1.5 py-0.5 rounded">
                      {fmt?.label_it || 'A4 Verticale'}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-bold leading-tight group-hover:text-blue-600 transition-colors">
                    {tpl.name}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {tpl.description || 'Nessuna descrizione specificata'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0">
                  <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-blue-500" />
                      <strong>{blocksCount}</strong> blocchi
                    </span>

                    <Button
                      size="sm"
                      onClick={() => setEditingTemplate(tpl)}
                      className="h-8 text-xs font-semibold bg-muted hover:bg-blue-600 hover:text-white text-foreground transition-all"
                    >
                      <Sliders className="h-3.5 w-3.5 mr-1.5" />
                      Configura Blocchi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
