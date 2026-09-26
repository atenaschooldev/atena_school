import { describe, it, expect } from 'vitest';
import {
  DocumentCategoryType,
  DocumentPaperFormat,
  DocumentTemplateType,
  DocumentType,
  DOCUMENT_CATEGORY_DICTIONARY,
  DOCUMENT_TYPE_DICTIONARY,
  DOCUMENT_TEMPLATE_DICTIONARY,
  parseDocumentType,
  parseDocumentCategoryType,
} from '@atena/api-types';
import {
  compileDocumentHtml,
  formatDocumentNumber,
  getDocumentPrefix,
  interpolateVariables,
} from '../index';

describe('Documents Module Unit Tests', () => {
  describe('Document Enums & Dictionaries', () => {
    it('should correctly parse numeric and string document types', () => {
      expect(parseDocumentType(1)).toBe(DocumentType.REGISTRATION_CONTRACT);
      expect(parseDocumentType('receipt')).toBe(DocumentType.PAYMENT_RECEIPT);
      expect(parseDocumentType('delega')).toBe(DocumentType.MINOR_PICKUP_DELEGATION);
      expect(parseDocumentType('attestato')).toBe(DocumentType.COURSE_CERTIFICATE);
    });

    it('should have correct metadata for each category', () => {
      expect(DOCUMENT_CATEGORY_DICTIONARY[DocumentCategoryType.STUDENT_CONTRACTS].label_it).toBe('Contratti Studenti');
      expect(DOCUMENT_CATEGORY_DICTIONARY[DocumentCategoryType.FINANCIAL].icon).toBe('receipt');
      expect(DOCUMENT_TEMPLATE_DICTIONARY[DocumentTemplateType.MODULO_ISCRIZIONE_STANDARD].document_type).toBe(DocumentType.REGISTRATION_CONTRACT);
    });
  });

  describe('Document Number Generator', () => {
    it('should generate official Italian sequential numbers', () => {
      expect(getDocumentPrefix(DocumentType.REGISTRATION_CONTRACT)).toBe('MOD');
      expect(getDocumentPrefix(DocumentType.PAYMENT_RECEIPT)).toBe('REC');
      expect(getDocumentPrefix(DocumentType.TEACHER_CONTRACT)).toBe('CTR-DOC');

      const num = formatDocumentNumber(DocumentType.REGISTRATION_CONTRACT, 42, 2026);
      expect(num).toBe('MOD-2026/00042');

      const receiptNum = formatDocumentNumber(DocumentType.PAYMENT_RECEIPT, 7, 2026);
      expect(receiptNum).toBe('REC-2026/00007');
    });
  });

  describe('Interpolation & Document Compiler', () => {
    it('should interpolate variables accurately', () => {
      const template = 'Gentile {{student.full_name}}, il corso di {{course.title}} costa {{payment.amount_total}}.';
      const data = {
        student: { full_name: 'Giulia Bianchi' },
        course: { title: 'Tedesco A2' },
        payment: { amount_total: '€180.00' },
      };

      const result = interpolateVariables(template, data);
      expect(result).toBe('Gentile Giulia Bianchi, il corso di Tedesco A2 costa €180.00.');
    });

    it('should compile full HTML with blocks and print CSS', () => {
      const html = compileDocumentHtml({
        blocksConfig: {
          version: 1,
          paper_format: DocumentPaperFormat.A4_PORTRAIT,
          blocks: [
            {
              id: 'b1',
              type: 'doc_header',
              title: 'Header Test',
              is_enabled: true,
              order: 1,
              props: { title: 'MODULO DI ISCRIZIONE' },
            },
            {
              id: 'b2',
              type: 'parties_block',
              title: 'Parties Test',
              is_enabled: true,
              order: 2,
              props: {},
            },
            {
              id: 'b3',
              type: 'payment_breakdown',
              title: 'Payment Test',
              is_enabled: true,
              order: 3,
              props: {},
            },
            {
              id: 'b4',
              type: 'signatures',
              title: 'Signatures',
              is_enabled: true,
              order: 4,
              props: {},
            },
          ],
        },
        data: {
          student: {
            full_name: 'Marco Rossi',
            tax_code: 'RSSMRC00A01H501Z',
            email: 'marco@example.com',
          },
          payment: {
            amount_total: 160,
            amount_course: 130,
            registration_fee: 30,
            payment_method_label: 'Carta di Credito Stripe',
            is_paid: true,
          },
        },
        documentNumber: 'MOD-2026/00001',
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Marco Rossi');
      expect(html).toContain('RSSMRC00A01H501Z');
      expect(html).toContain('€160.00');
      expect(html).toContain('MOD-2026/00001');
      expect(html).toContain('IVA INCLUSA');
      expect(html).toContain('@page {');
    });

    it('should dynamically update when brand profile or registration fee changes', () => {
      const customSchoolProfile = {
        name: 'Atena Accademia Linguistica',
        vat_code: 'IT99988877766',
        city: 'Reggio Calabria',
        address: 'Corso Garibaldi 100',
        registration_fee_eur: 50,
      };

      const html = compileDocumentHtml({
        blocksConfig: {
          version: 1,
          paper_format: DocumentPaperFormat.A4_PORTRAIT,
          blocks: [
            {
              id: 'b1',
              type: 'doc_header',
              title: 'Header',
              is_enabled: true,
              order: 1,
              props: { title: 'CONTRATTO DI ISCRIZIONE' },
            },
            {
              id: 'b2',
              type: 'payment_breakdown',
              title: 'Payment',
              is_enabled: true,
              order: 2,
              props: { vat_rate: 22 },
            },
            {
              id: 'b3',
              type: 'signatures',
              title: 'Signatures',
              is_enabled: true,
              order: 3,
              props: { school_label: 'Direzione Didattica Atena' },
            },
          ],
        },
        data: {
          student: { full_name: 'Elena Conti', tax_code: 'CNTLNE05M41H501X' },
          payment: {
            amount_total: 200,
            amount_course: 150,
            registration_fee: 50, // Modified fee from DB setting
            payment_method_label: 'Bonifico Bancario',
            is_paid: true,
          },
        },
        schoolProfile: customSchoolProfile,
        documentNumber: 'CTR-2026/00099',
      });

      expect(html).toContain('Atena Accademia Linguistica');
      expect(html).toContain('IT99988877766');
      expect(html).toContain('Corso Garibaldi 100');
      expect(html).toContain('€50.00');
      expect(html).toContain('€150.00');
      expect(html).toContain('€200.00');
      expect(html).toContain('Direzione Didattica Atena');
      expect(html).toContain('Reggio Calabria');
    });

    it('should safely interpolate non-string and missing variables without throwing', () => {
      expect(interpolateVariables(null as any, {})).toBe('');
      expect(interpolateVariables(undefined as any, {})).toBe('');
      expect(interpolateVariables(12345 as any, {})).toBe('12345');
      expect(interpolateVariables('Hello {{student.missing_field}}!', {})).toBe('Hello !');
      expect(interpolateVariables('Count: {{stats.count}}', { stats: { count: 10 } })).toBe('Count: 10');
    });
  });
});
