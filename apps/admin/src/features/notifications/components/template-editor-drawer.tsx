"use client";

import React, { Suspense, lazy } from "react";
import type { NotificationTemplateRecord, UpdateNotificationTemplateDto } from "../types";
import { Loader2 } from "lucide-react";

const VisualTemplateBuilder = lazy(() =>
  import("./builder/visual-template-builder").then((m) => ({
    default: m.VisualTemplateBuilder,
  }))
);

interface TemplateEditorDrawerProps {
  template: NotificationTemplateRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, payload: UpdateNotificationTemplateDto) => Promise<any>;
  onOpenTestModal: (template: NotificationTemplateRecord) => void;
  isLoading?: boolean;
}

export function TemplateEditorDrawer({
  template,
  isOpen,
  onClose,
  onSave,
  onOpenTestModal,
  isLoading = false,
}: TemplateEditorDrawerProps) {
  if (!template || !isOpen) return null;

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="flex items-center gap-3 bg-card p-6 rounded-2xl border shadow-xl">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm font-semibold">Caricamento Editor Visivo...</span>
          </div>
        </div>
      }
    >
      <VisualTemplateBuilder
        template={template}
        isOpen={isOpen}
        onClose={onClose}
        onSave={onSave}
        onOpenTest={onOpenTestModal}
        isLoading={isLoading}
      />
    </Suspense>
  );
}

