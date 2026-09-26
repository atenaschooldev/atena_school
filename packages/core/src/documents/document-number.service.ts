/**
 * ============================================================================
 * ATENA SCHOOL — DOCUMENT NUMBER GENERATOR
 * ============================================================================
 * @module @atena/core/documents/document-number.service
 * @description
 * Generates official Italian sequential document numbers (e.g. DOC-2026/00014, REC-2026/0008).
 * ============================================================================
 */

import { DocumentType } from '@atena/api-types';

export function getDocumentPrefix(documentType: DocumentType): string {
  switch (documentType) {
    case DocumentType.REGISTRATION_CONTRACT:
      return 'MOD';
    case DocumentType.TEACHER_CONTRACT:
      return 'CTR-DOC';
    case DocumentType.PAYMENT_RECEIPT:
      return 'REC';
    case DocumentType.MINOR_PICKUP_DELEGATION:
      return 'DEL';
    case DocumentType.PRIVACY_GDPR:
      return 'PRIV';
    case DocumentType.COURSE_CERTIFICATE:
      return 'CERT';
    case DocumentType.ATTENDANCE_ATTESTATION:
      return 'ATT';
    default:
      return 'DOC';
  }
}

export function formatDocumentNumber(
  documentType: DocumentType,
  sequenceNumber: number,
  year?: number
): string {
  const currentYear = year || new Date().getFullYear();
  const prefix = getDocumentPrefix(documentType);
  const paddedSeq = String(Math.max(1, sequenceNumber)).padStart(5, '0');

  return `${prefix}-${currentYear}/${paddedSeq}`;
}
