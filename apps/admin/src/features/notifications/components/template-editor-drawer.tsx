"use client";

import React from "react";
import type { NotificationTemplateRecord, UpdateNotificationTemplateDto } from "../types";
import { VisualTemplateBuilder } from "./builder/visual-template-builder";

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
  if (!template) return null;

  return (
    <VisualTemplateBuilder
      template={template}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      onOpenTest={onOpenTestModal}
      isLoading={isLoading}
    />
  );
}

