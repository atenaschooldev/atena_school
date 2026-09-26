import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Eye,
  Trash2,
  Download,
  Filter,
  Layers,
  History,
  FolderTree,
} from 'lucide-react';
import {
  DocumentCategoryType,
  DocumentStatus,
  DocumentType,
  DOCUMENT_CATEGORY_DICTIONARY,
  DOCUMENT_STATUS_DICTIONARY,
  DOCUMENT_TYPE_DICTIONARY,
  type DocumentRecord,
} from '../types';
import { useDocuments } from '../hooks/use-documents';
import { useDocumentCategories } from '../hooks/use-document-categories';
import { GenerateDocumentDialog } from './generate-document-dialog';
import { DocumentTemplatesView } from './document-templates-view';
import { DocumentCategoriesView } from './document-categories-view';
import { DocumentLogsView } from './document-logs-view';
import { DocumentLivePreview } from './builder/document-live-preview';

export function DocumentsView() {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategoryType | undefined>();
  const [search, setSearch] = useState('');
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [previewingDoc, setPreviewingDoc] = useState<DocumentRecord | null>(null);

  const { documents, isLoading, deleteDocument } = useDocuments({
    category_type: selectedCategory,
    search: search || undefined,
  });

  const { categories } = useDocumentCategories();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="h-7 w-7 text-blue-600" />
            Documenti & Contratti
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gestione centralizzata di moduli di iscrizione, contratti docenti, ricevute fiscali e certificati ufficiali.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsGenerateOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md text-xs h-9"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nuovo Documento
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="registry" className="w-full space-y-6">
        <TabsList className="bg-muted/60 p-1 border">
          <TabsTrigger value="registry" className="text-xs font-semibold flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Registro Documenti ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs font-semibold flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Modelli & Visual Builder
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs font-semibold flex items-center gap-1.5">
            <FolderTree className="h-3.5 w-3.5" />
            Categorie
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs font-semibold flex items-center gap-1.5">
            <History className="h-3.5 w-3.5" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: REGISTRY OF ISSUED DOCUMENTS */}
        <TabsContent value="registry" className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-card border rounded-xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per numero, nominativo, CF, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <Button
                variant={selectedCategory === undefined ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(undefined)}
                className="text-xs h-8"
              >
                Tutti
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.category_type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.category_type)}
                  className="text-xs h-8 whitespace-nowrap"
                >
                  {cat.name_it}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="w-[160px]">N. Documento</TableHead>
                  <TableHead>Titolo Documento</TableHead>
                  <TableHead>Categoria / Tipo</TableHead>
                  <TableHead>Intestatario / Destinatario</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Data Creazione</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                      Caricamento archivio documenti...
                    </TableCell>
                  </TableRow>
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                      Nessun documento trovato. Clicca su "Nuovo Documento" per emetterne uno.
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => {
                    const cat = DOCUMENT_CATEGORY_DICTIONARY[doc.category_type];
                    const docType = DOCUMENT_TYPE_DICTIONARY[doc.document_type];
                    const statusInfo = DOCUMENT_STATUS_DICTIONARY[doc.status as DocumentStatus];
                    const dateStr = new Date(doc.created_at).toLocaleDateString('it-IT');

                    return (
                      <TableRow key={doc.id} className="text-xs hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono font-bold text-foreground">
                          {doc.document_number}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-foreground">{doc.title}</div>
                          {doc.recipient_tax_code && (
                            <div className="text-[10px] text-muted-foreground font-mono">
                              CF: {doc.recipient_tax_code}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] bg-muted/30">
                            {cat?.label_it || docType?.label_it || 'Documento'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">{doc.recipient_name || '---'}</div>
                          <div className="text-[10px] text-muted-foreground">{doc.recipient_email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusInfo?.badge_variant || 'secondary'}
                            className="text-[10px]"
                          >
                            {statusInfo?.label_it || 'Emesso'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{dateStr}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setPreviewingDoc(doc)}
                              className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Visualizza / Stampa"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm(`Sei sicuro di voler eliminare il documento ${doc.document_number}?`)) {
                                  deleteDocument(doc.id);
                                }
                              }}
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Elimina"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 2: TEMPLATES & BUILDER */}
        <TabsContent value="templates">
          <DocumentTemplatesView />
        </TabsContent>

        {/* TAB 3: CATEGORIES */}
        <TabsContent value="categories">
          <DocumentCategoriesView />
        </TabsContent>

        {/* TAB 4: AUDIT TRAIL LOGS */}
        <TabsContent value="logs">
          <DocumentLogsView />
        </TabsContent>
      </Tabs>

      {/* Generation Modal */}
      <GenerateDocumentDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
      />

      {/* View / Print Modal */}
      {previewingDoc && (
        <Dialog open={!!previewingDoc} onOpenChange={(open) => !open && setPreviewingDoc(null)}>
          <DialogContent className="max-w-[90vw] w-[1200px] h-[90vh] p-0 flex flex-col gap-0 overflow-hidden bg-background">
            <DialogHeader className="px-6 py-3 border-b flex-row items-center justify-between space-y-0 bg-card">
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                {previewingDoc.title} ({previewingDoc.document_number})
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-4 bg-muted/10 overflow-hidden">
              <DocumentLivePreview
                blocksConfig={{
                  version: 1,
                  paper_format: previewingDoc.paper_format,
                  blocks: [],
                }}
                data={previewingDoc.template_data}
                documentTitle={previewingDoc.title}
                documentNumber={previewingDoc.document_number}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
