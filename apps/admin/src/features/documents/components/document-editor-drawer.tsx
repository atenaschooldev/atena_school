'use client';

import React, { Suspense, lazy } from 'react';
import type { DocumentTemplateRecord, DocumentBlocksConfig } from '../types';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { VisualDocumentBuilder } from './builder/visual-document-builder';

interface DocumentEditorDrawerProps {
  template: DocumentTemplateRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedConfig: DocumentBlocksConfig) => Promise<any>;
  isLoading?: boolean;
}

export function DocumentEditorDrawer({
  template,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: DocumentEditorDrawerProps) {
  if (!template || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[96vw] w-[1500px] h-[92vh] p-0 flex flex-col gap-0 overflow-hidden bg-background">
        <VisualDocumentBuilder
          template={template}
          onSave={onSave}
          isSaving={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
