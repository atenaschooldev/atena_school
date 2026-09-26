import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Save,
  GripVertical,
  Layers,
  Settings,
} from 'lucide-react';
import {
  DocumentPaperFormat,
  resolveI18n,
  type DocumentBlock,
  type DocumentBlockType,
  type DocumentBlocksConfig,
  type DocumentTemplateRecord,
} from '../../types';
import { DocumentLivePreview } from './document-live-preview';
import { useTranslation } from '@/i18n/context';

interface VisualDocumentBuilderProps {
  template: DocumentTemplateRecord;
  onSave: (updatedConfig: DocumentBlocksConfig) => Promise<void>;
  isSaving?: boolean;
}

const BLOCK_DEFINITIONS: { type: DocumentBlockType; key: string }[] = [
  { type: 'doc_header', key: 'doc_header' },
  { type: 'parties_block', key: 'parties_block' },
  { type: 'course_table', key: 'course_table' },
  { type: 'payment_breakdown', key: 'payment_breakdown' },
  { type: 'contract_clauses', key: 'contract_clauses' },
  { type: 'minor_delegation', key: 'minor_delegation' },
  { type: 'gdpr_privacy', key: 'gdpr_privacy' },
  { type: 'signatures', key: 'signatures' },
  { type: 'custom_text', key: 'custom_text' },
  { type: 'doc_footer', key: 'doc_footer' },
];

export function VisualDocumentBuilder({ template, onSave, isSaving }: VisualDocumentBuilderProps) {
  const { t, locale } = useTranslation();
  const tr = (key: string, fallback: string) => t(key) || fallback;

  const [previewLocale, setPreviewLocale] = useState<string>(template.locale || locale || 'it');

  const [config, setConfig] = useState<DocumentBlocksConfig>(() => {
    return (
      template.blocks_config || {
        version: 1,
        paper_format: template.paper_format || DocumentPaperFormat.A4_PORTRAIT,
        blocks: [],
      }
    );
  });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(() => {
    return config.blocks.length > 0 ? config.blocks[0].id : null;
  });

  const previewSampleData = useMemo<Record<string, any>>(() => ({
    title: resolveI18n(template.name, previewLocale, 'Documento Ufficiale'),
    document_number: 'MOD-2026/00014',
    student: {
      full_name: 'Mario Rossi',
      tax_code: 'RSSMRA08D12H501Z',
      birth_date: '12/04/2008',
      birth_place: 'Milano',
      address: 'Via Dante 14, Milano',
      school_grade: 'Liceo Scientifico 3B',
      email: 'mario.rossi@example.com',
      phone: '+39 340 1234567',
    },
    parent: {
      full_name: 'Luigi Rossi',
      tax_code: 'RSSLGU75C10H501K',
      phone: '+39 349 9876543',
    },
    course: {
      title: previewLocale === 'en' ? 'English B1 Intermediate Youth' : 'Inglese B1 Intermedio Ragazzi',
      level: 'B1',
      schedule_text: previewLocale === 'en' ? 'Tuesday & Thursday 16:30 - 18:00' : 'Martedì e Giovedì 16:30 - 18:00',
      start_date: '06/10/2026',
      total_lessons: 32,
      classroom: 'Aula Magna',
    },
    payment: {
      amount_total: 160,
      amount_course: 130,
      registration_fee: 30,
      payment_method_label: previewLocale === 'en' ? 'Stripe Credit Card' : 'Carta di Credito Stripe',
      is_paid: true,
    },
    delegates: {
      delegate_1_name: 'Luigi Rossi',
      delegate_1_relation: previewLocale === 'en' ? 'Father' : 'Padre',
      delegate_1_phone: '+39 349 9876543',
      self_exit_authorized: true,
    },
    issue_date: new Date().toLocaleDateString(previewLocale === 'en' ? 'en-US' : previewLocale === 'ru' ? 'ru-RU' : 'it-IT'),
  }), [template.name, previewLocale]);

  const blocks = config.blocks || [];

  // Reorder Blocks
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    const reindexed = newBlocks.map((b, i) => ({ ...b, order: i + 1 }));
    setConfig({ ...config, blocks: reindexed });
  };

  // Toggle Block Visibility
  const toggleBlock = (id: string, enabled: boolean) => {
    const newBlocks = blocks.map((b) => (b.id === id ? { ...b, is_enabled: enabled } : b));
    setConfig({ ...config, blocks: newBlocks });
  };

  // Delete Block
  const deleteBlock = (id: string) => {
    const newBlocks = blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i + 1 }));
    setConfig({ ...config, blocks: newBlocks });
    if (selectedBlockId === id) {
      setSelectedBlockId(newBlocks.length > 0 ? newBlocks[0].id : null);
    }
  };

  // Add Block
  const addBlock = (type: DocumentBlockType, title: string) => {
    const newId = `b_${Date.now()}`;
    const newBlock: DocumentBlock = {
      id: newId,
      type,
      title,
      is_enabled: true,
      order: blocks.length + 1,
      props: {},
    };
    const newBlocks = [...blocks, newBlock];
    setConfig({ ...config, blocks: newBlocks });
    setSelectedBlockId(newId);
  };

  // Update Block Props
  const updateBlockProps = (id: string, newProps: Record<string, any>) => {
    const newBlocks = blocks.map((b) =>
      b.id === id ? { ...b, props: { ...b.props, ...newProps } } : b
    );
    setConfig({ ...config, blocks: newBlocks });
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] border rounded-xl bg-background overflow-hidden shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground leading-tight flex items-center gap-2">
              {resolveI18n(template.name, previewLocale, "Modello")}
              {template.is_system && (
                <Badge variant="outline" className="text-[10px] text-blue-600 bg-blue-50 border-blue-200">
                  {tr("documents.templates.systemBadge", "Sistema")}
                </Badge>
              )}
            </h2>
            <p className="text-xs text-muted-foreground">
              {resolveI18n(template.description, previewLocale, tr("documents.templates.subtitle", "Configurazione blocchi e layout di stampa"))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-1">
            <span className="text-xs text-muted-foreground font-medium">
              {tr("documents.builder.previewLang", "Lingua:")}
            </span>
            <select
              value={previewLocale}
              onChange={(e) => setPreviewLocale(e.target.value)}
              className="h-8 text-xs rounded-md border border-input bg-background px-2 font-medium cursor-pointer"
            >
              <option value="it">🇮🇹 IT</option>
              <option value="en">🇬🇧 EN</option>
              <option value="ru">🇷🇺 RU</option>
            </select>
          </div>

          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs text-muted-foreground font-medium">
              {tr("documents.builder.formatLabel", "Formato:")}
            </span>
            <select
              value={config.paper_format || DocumentPaperFormat.A4_PORTRAIT}
              onChange={(e) => setConfig({ ...config, paper_format: Number(e.target.value) as DocumentPaperFormat })}
              className="h-8 text-xs rounded-md border border-input bg-background px-2.5 font-medium"
            >
              <option value={DocumentPaperFormat.A4_PORTRAIT}>
                {tr("documents.builder.portrait", "A4 Verticale")}
              </option>
              <option value={DocumentPaperFormat.A4_LANDSCAPE}>
                {tr("documents.builder.landscape", "A4 Orizzontale")}
              </option>
              <option value={DocumentPaperFormat.RECEIPT_COMPACT}>
                {tr("documents.builder.compact", "Ricevuta Compatta")}
              </option>
            </select>
          </div>

          <Button
            onClick={() => onSave(config)}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-semibold h-9 cursor-pointer"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving
              ? tr("documents.builder.saving", "Salvataggio...")
              : tr("documents.builder.saveButton", "Salva Modello")}
          </Button>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-12 flex-1 overflow-hidden">
        {/* Left Column: Blocks Manager (3 cols) */}
        <div className="col-span-3 border-r bg-muted/20 flex flex-col h-full overflow-hidden">
          <div className="p-3.5 border-b bg-muted/40 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              {tr("documents.builder.blocksStructure", "Struttura Blocchi")} ({blocks.length})
            </span>
          </div>

          {/* Block Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {blocks.map((b, index) => {
              const isSelected = b.id === selectedBlockId;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBlockId(b.id)}
                  className={`group relative p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm'
                      : 'bg-card border-border hover:border-slate-300 dark:hover:border-slate-700'
                  } ${!b.is_enabled ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">{b.title}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">{b.type}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={b.is_enabled}
                      onCheckedChange={(val) => toggleBlock(b.id, val)}
                      className="scale-75"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      disabled={index === 0}
                      onClick={() => moveBlock(index, 'up')}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(index, 'down')}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteBlock(b.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Block Selector */}
          <div className="p-3 border-t bg-card">
            <span className="text-[11px] font-bold text-muted-foreground block mb-1.5 uppercase">
              {tr("documents.builder.addBlock", "Aggiungi Blocco:")}
            </span>
            <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto custom-scrollbar p-0.5">
              {BLOCK_DEFINITIONS.map((item) => {
                const title = tr(`documents.builder.blocks.${item.key}`, item.key);
                const desc = tr(`documents.builder.blocks.${item.key}_desc`, '');
                return (
                  <Button
                    key={item.type}
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock(item.type, title)}
                    className="h-7 text-[11px] justify-start text-left px-2 truncate"
                    title={desc}
                  >
                    <Plus className="h-3 w-3 mr-1 text-blue-500 shrink-0" />
                    <span className="truncate">{title}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Column: Selected Block Properties (3 cols) */}
        <div className="col-span-3 border-r bg-card flex flex-col h-full overflow-hidden">
          <div className="p-3.5 border-b bg-muted/40 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              {tr("documents.builder.blockProperties", "Proprietà Blocco")}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {selectedBlock ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    {tr("documents.builder.blockTitle", "Titolo Blocco")}
                  </label>
                  <Input
                    value={selectedBlock.title}
                    onChange={(e) => {
                      const newBlocks = blocks.map((b) =>
                        b.id === selectedBlock.id ? { ...b, title: e.target.value } : b
                      );
                      setConfig({ ...config, blocks: newBlocks });
                    }}
                    className="h-8 text-xs"
                  />
                </div>

                {/* 1. Header Block Props */}
                {selectedBlock.type === 'doc_header' && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">
                        {tr("documents.builder.showLogo", "Mostra Logo Scuola")}
                      </span>
                      <Switch
                        checked={selectedBlock.props.show_logo !== false}
                        onCheckedChange={(val) => updateBlockProps(selectedBlock.id, { show_logo: val })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        {tr("documents.builder.headerTitle", "Titolo Intestazione")}
                      </label>
                      <Input
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { title: e.target.value })}
                        placeholder="MODULO DI ISCRIZIONE"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Parties Block Props */}
                {selectedBlock.type === 'parties_block' && (
                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Titolo Sezione
                      </label>
                      <Input
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { title: e.target.value })}
                        placeholder="DATI ANAGRAFICI DELL'ALLIEVO"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Mostra Dati Genitore</span>
                      <Switch
                        checked={selectedBlock.props.show_parent !== false}
                        onCheckedChange={(val) => updateBlockProps(selectedBlock.id, { show_parent: val })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Mostra Data/Luogo Nascita</span>
                      <Switch
                        checked={selectedBlock.props.show_birth !== false}
                        onCheckedChange={(val) => updateBlockProps(selectedBlock.id, { show_birth: val })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Mostra Residenza</span>
                      <Switch
                        checked={selectedBlock.props.show_address !== false}
                        onCheckedChange={(val) => updateBlockProps(selectedBlock.id, { show_address: val })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Mostra Scuola / Classe</span>
                      <Switch
                        checked={selectedBlock.props.show_school !== false}
                        onCheckedChange={(val) => updateBlockProps(selectedBlock.id, { show_school: val })}
                      />
                    </div>
                  </div>
                )}

                {/* 3. Course Table Props */}
                {selectedBlock.type === 'course_table' && (
                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Titolo Tabella
                      </label>
                      <Input
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { title: e.target.value })}
                        placeholder="DETTAGLI DEL CORSO ASSEGNATO"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Mostra Colonna Aula</span>
                      <Switch
                        checked={selectedBlock.props.show_classroom !== false}
                        onCheckedChange={(val) => updateBlockProps(selectedBlock.id, { show_classroom: val })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Nota a piè di tabella
                      </label>
                      <Input
                        value={selectedBlock.props.table_note || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { table_note: e.target.value })}
                        placeholder="Totale lezioni programmate: {{course.total_lessons}}"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Payment Breakdown Props */}
                {selectedBlock.type === 'payment_breakdown' && (
                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Titolo Sezione
                      </label>
                      <Input
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { title: e.target.value })}
                        placeholder="RIEPILOGO QUOTE E CONDIZIONI ECONOMICHE"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Aliquota IVA (%)
                      </label>
                      <Input
                        type="number"
                        value={selectedBlock.props.vat_rate !== undefined ? selectedBlock.props.vat_rate : 22}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { vat_rate: Number(e.target.value) })}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Mostra Nota Scorporo IVA</span>
                      <Switch
                        checked={selectedBlock.props.show_vat_breakdown !== false}
                        onCheckedChange={(val) => updateBlockProps(selectedBlock.id, { show_vat_breakdown: val })}
                      />
                    </div>
                  </div>
                )}

                {/* 5. Contract Clauses Props */}
                {selectedBlock.type === 'contract_clauses' && (
                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Titolo Regolamento
                      </label>
                      <Input
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { title: e.target.value })}
                        placeholder="ESTRATTO REGOLAMENTO INTERNO"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Clausole Personalizzate (una per riga)
                      </label>
                      <Textarea
                        rows={6}
                        value={selectedBlock.props.custom_clauses || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { custom_clauses: e.target.value })}
                        placeholder="Lascia vuoto per utilizzare le clausole e festività standard 2026/2027..."
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 6. Minor Delegation Props */}
                {selectedBlock.type === 'minor_delegation' && (
                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Titolo Allegato
                      </label>
                      <Input
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { title: e.target.value })}
                        placeholder="ALLEGATO 2 — DELEGA RITIRO MINORI"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Mostra Uscita Autonoma (L. 172/2017)</span>
                      <Switch
                        checked={selectedBlock.props.show_self_exit !== false}
                        onCheckedChange={(val) => updateBlockProps(selectedBlock.id, { show_self_exit: val })}
                      />
                    </div>
                  </div>
                )}

                {/* 7. GDPR Privacy Props */}
                {selectedBlock.type === 'gdpr_privacy' && (
                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Titolo Informativa
                      </label>
                      <Input
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { title: e.target.value })}
                        placeholder="INFORMATIVA PRIVACY E CONSENSO (REG. UE 2016/679)"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Mostra Consenso Foto/Video</span>
                      <Switch
                        checked={selectedBlock.props.show_photo_consent !== false}
                        onCheckedChange={(val) => updateBlockProps(selectedBlock.id, { show_photo_consent: val })}
                      />
                    </div>
                  </div>
                )}

                {/* 8. Signatures Block Props */}
                {selectedBlock.type === 'signatures' && (
                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Etichetta Firma Scuola
                      </label>
                      <Input
                        value={selectedBlock.props.school_label || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { school_label: e.target.value })}
                        placeholder="Firma per Direzione Atena School"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Etichetta Firma Cliente/Allievo
                      </label>
                      <Input
                        value={selectedBlock.props.student_label || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { student_label: e.target.value })}
                        placeholder="Firma dell'Allievo / Genitore Esercente"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 9. Custom Text Block Props */}
                {selectedBlock.type === 'custom_text' && (
                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Titolo Blocco (Opzionale)
                      </label>
                      <Input
                        value={selectedBlock.props.title || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { title: e.target.value })}
                        placeholder="NOTE E DISPOSIZIONI SPECIALI"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        {tr("documents.builder.customHtml", "Contenuto Testo / HTML")}
                      </label>
                      <Textarea
                        rows={6}
                        value={selectedBlock.props.content_html || selectedBlock.props.text || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { content_html: e.target.value, text: e.target.value })}
                        placeholder="Inserisci testo o tag come {{student.full_name}}, {{course.title}}..."
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 10. Doc Footer Block Props */}
                {selectedBlock.type === 'doc_footer' && (
                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Nota Piè di Pagina
                      </label>
                      <Textarea
                        rows={3}
                        value={selectedBlock.props.footer_note || ''}
                        onChange={(e) => updateBlockProps(selectedBlock.id, { footer_note: e.target.value })}
                        placeholder="Documento generato tramite la piattaforma gestionale Atena School..."
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="p-3 bg-muted/30 rounded-lg border text-[11px] text-muted-foreground space-y-1">
                  <div className="font-semibold text-foreground">
                    {tr("documents.builder.variablesHint", "Variabili disponibili: {{student.full_name}}, {{student.tax_code}}, {{parent.full_name}}, {{parent.tax_code}}, {{course.title}}, {{payment.amount_total}}")}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-xs">
                {locale === 'en' ? 'Select a block to configure its properties' : 'Seleziona un blocco per configurarne le proprietà'}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live A4 Preview (6 cols) */}
        <div className="col-span-6 h-full p-4 bg-muted/10 overflow-hidden">
          <DocumentLivePreview
            blocksConfig={config}
            data={previewSampleData}
            documentTitle={resolveI18n(template.name, previewLocale, 'Documento')}
            documentNumber="DOC-ANTEPRIMA-A4"
            locale={previewLocale}
          />
        </div>
      </div>
    </div>
  );
}
