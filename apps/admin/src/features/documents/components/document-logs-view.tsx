import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Printer, Eye, Download, CheckCircle2, RefreshCw } from 'lucide-react';
import { useDocumentLogs } from '../hooks/use-document-logs';
import {
  DOCUMENT_LOG_ACTION_DICTIONARY,
  DocumentLogAction,
} from '../types';

const ACTION_ICONS: Record<DocumentLogAction, React.ReactNode> = {
  [DocumentLogAction.GENERATED]: <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />,
  [DocumentLogAction.VIEWED]: <Eye className="h-3.5 w-3.5 text-slate-500" />,
  [DocumentLogAction.PRINTED]: <Printer className="h-3.5 w-3.5 text-emerald-500" />,
  [DocumentLogAction.DOWNLOADED_PDF]: <Download className="h-3.5 w-3.5 text-purple-500" />,
  [DocumentLogAction.SENT_EMAIL]: <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />,
  [DocumentLogAction.SIGNED]: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
  [DocumentLogAction.REGENERATED]: <RefreshCw className="h-3.5 w-3.5 text-orange-500" />,
};

export function DocumentLogsView() {
  const { logs, isLoading, refetch } = useDocumentLogs();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">Registro Eventi & Audit Trail</h3>
          <p className="text-xs text-muted-foreground">
            Tracciamento in tempo reale di tutte le operazioni di generazione, stampa, visualizzazione e firma dei documenti.
          </p>
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead className="w-[180px]">Data & Ora</TableHead>
              <TableHead>Azione</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Destinatario</TableHead>
              <TableHead className="text-right">Dettagli</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                  Caricamento registro eventi...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                  Nessun evento registrato al momento.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: any) => {
                const actionInfo = DOCUMENT_LOG_ACTION_DICTIONARY[log.action as DocumentLogAction];
                const icon = ACTION_ICONS[log.action as DocumentLogAction] || <History className="h-3.5 w-3.5" />;
                const dateStr = new Date(log.created_at).toLocaleString('it-IT');

                return (
                  <TableRow key={log.id} className="text-xs">
                    <TableCell className="font-mono text-muted-foreground">{dateStr}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        {icon}
                        {actionInfo?.label_it || 'Azione'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">
                        {log.documents?.title || 'Documento'}
                      </span>
                      {log.documents?.document_number && (
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {log.documents.document_number}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{log.documents?.recipient_name || '---'}</TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-muted-foreground">
                      {log.metadata ? JSON.stringify(log.metadata) : '---'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
