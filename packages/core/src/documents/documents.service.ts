/**
 * ============================================================================
 * ATENA SCHOOL — CORE DOCUMENTS SERVICE
 * ============================================================================
 * @module @atena/core/documents/documents.service
 * @description
 * Complete business logic service for managing and generating official school documents:
 * - Fetch active templates and categories
 * - Autofill snapshot data from DB entities (Booking, Student, Teacher, Payment)
 * - Compile HTML and create immutable records in `public.documents`
 * - Log audit events into `public.document_logs`
 * ============================================================================
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  DocumentCategoryRecord,
  DocumentGenerationSource,
  DocumentLogAction,
  DocumentPaperFormat,
  DocumentRecord,
  DocumentStatus,
  DocumentTemplateRecord,
  DocumentTemplateType,
  DocumentType,
  GenerateDocumentDto,
  parseDocumentCategoryType,
  parseDocumentPaperFormat,
  parseDocumentStatus,
  parseDocumentTemplateType,
  parseDocumentType,
  resolveI18n,
} from '@atena/api-types';
import { DEFAULT_SCHOOL_PROFILE, getSchoolProfile } from '../system/school-profile.service';
import { compileDocumentHtml } from './document-compiler.service';
import { formatDocumentNumber } from './document-number.service';

export class DocumentsService {
  /**
   * Fetch all active document categories
   */
  static async getCategories(supabase: SupabaseClient): Promise<DocumentCategoryRecord[]> {
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('[DocumentsService] Failed to load categories:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      ...row,
      category_type: parseDocumentCategoryType(row.category_type),
    }));
  }

  /**
   * Fetch all document templates
   */
  static async getTemplates(supabase: SupabaseClient): Promise<DocumentTemplateRecord[]> {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('[DocumentsService] Failed to load templates:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      ...row,
      template_type: parseDocumentTemplateType(row.template_type),
      category_type: parseDocumentCategoryType(row.category_type),
      document_type: parseDocumentType(row.document_type),
      paper_format: parseDocumentPaperFormat(row.paper_format),
    }));
  }

  /**
   * Fetch template by template_type
   */
  static async getTemplateByType(
    supabase: SupabaseClient,
    templateType: DocumentTemplateType
  ): Promise<DocumentTemplateRecord | null> {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('template_type', templateType)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      ...data,
      template_type: parseDocumentTemplateType(data.template_type),
      category_type: parseDocumentCategoryType(data.category_type),
      document_type: parseDocumentType(data.document_type),
      paper_format: parseDocumentPaperFormat(data.paper_format),
    };
  }

  /**
   * Autofills document data from database entities (booking, student, teacher, payment)
   */
  static async extractAutofillData(
    supabase: SupabaseClient,
    dto: {
      bookingId?: string;
      studentId?: string;
      teacherId?: number;
      locale?: string;
    }
  ): Promise<Record<string, any>> {
    const school = await getSchoolProfile(supabase);
    const dateLocale = dto.locale === 'en' ? 'en-US' : dto.locale === 'ru' ? 'ru-RU' : 'it-IT';

    let bookingData: any = null;
    let studentData: any = null;
    let teacherData: any = null;
    let courseData: any = null;
    let paymentData: any = null;

    // 1. Fetch Booking if provided
    if (dto.bookingId) {
      const { data: b } = await supabase
        .from('bookings')
        .select('*, courses(*), payments(*)')
        .eq('id', dto.bookingId)
        .single();

      if (b) {
        bookingData = b;
        courseData = b.courses;
        if (b.payments && b.payments.length > 0) {
          paymentData = b.payments[0];
        }
      }
    }

    // 2. Fetch Student if provided or from booking
    const targetStudentId = dto.studentId || bookingData?.student_id;
    if (targetStudentId) {
      const { data: s } = await supabase
        .from('students')
        .select('*')
        .eq('id', targetStudentId)
        .single();
      studentData = s;
    }

    // 3. Fetch Teacher if provided
    if (dto.teacherId) {
      const { data: t } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', dto.teacherId)
        .single();
      teacherData = t;
    }

    // 4. Fetch Membership if student exists
    let membershipData: any = null;
    if (targetStudentId) {
      const { data: m } = await supabase
        .from('annual_memberships')
        .select('*')
        .eq('student_id', targetStudentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      membershipData = m;
    }

    // Extract form data from booking if present
    const formData = bookingData?.form_data || {};

    const studentFullName =
      studentData?.first_name && studentData?.last_name
        ? `${studentData.first_name} ${studentData.last_name}`
        : bookingData?.student_name ||
          (formData?.student_first_name
            ? `${formData.student_first_name} ${formData.student_last_name || ''}`.trim()
            : bookingData?.purchaser_name || '');

    const purchaserFullName =
      bookingData?.purchaser_name ||
      (formData?.parent_first_name ? `${formData.parent_first_name} ${formData.parent_last_name || ''}`.trim() : studentFullName);

    const isChild = Boolean(bookingData?.is_for_child || formData?.is_for_child);

    const defaultFeeFromDb = school?.registration_fee_eur != null ? Number(school.registration_fee_eur) : 30;
    const registrationFee =
      bookingData?.registration_fee != null
        ? Number(bookingData.registration_fee)
        : defaultFeeFromDb;

    const coursePrice = Number(courseData?.price || 0);
    const totalAmount = Number(
      bookingData?.total_amount != null
        ? bookingData.total_amount
        : paymentData?.amount != null
        ? paymentData.amount
        : coursePrice > 0
        ? coursePrice + (registrationFee || 0)
        : 0
    );
    const courseFee = totalAmount >= registrationFee ? totalAmount - registrationFee : totalAmount;

    return {
      school,
      student: {
        id: studentData?.id || bookingData?.student_id,
        full_name: studentFullName,
        email: studentData?.email || bookingData?.student_email || bookingData?.purchaser_email,
        phone: studentData?.phone || bookingData?.student_phone || bookingData?.purchaser_phone,
        tax_code: studentData?.tax_code || bookingData?.student_tax_code || bookingData?.purchaser_tax_code || formData?.student_tax_code,
        birth_date: studentData?.birth_date || formData?.student_birth_date,
        birth_place: studentData?.birth_place || formData?.student_birth_place,
        address: studentData?.address || formData?.student_address,
        school_grade: formData?.student_school_and_grade || studentData?.school_and_grade,
        membership_number: membershipData?.membership_number || studentData?.membership_number || null,
        membership_status: membershipData?.status,
        is_member: membershipData?.status === 1,
      },
      parent: isChild
        ? {
            full_name: purchaserFullName,
            email: bookingData?.purchaser_email,
            phone: bookingData?.purchaser_phone,
            tax_code: bookingData?.purchaser_tax_code || formData?.parent_tax_code,
          }
        : null,
      teacher: teacherData
        ? {
            id: teacherData.id,
            full_name: teacherData.name,
            email: teacherData.email,
            phone: teacherData.phone,
            tax_code: teacherData.tax_code,
            hourly_rate: teacherData.hourly_rate,
          }
        : null,
      course: courseData
        ? {
            id: courseData.id,
            title: courseData.title,
            level: courseData.level,
            schedule_text: courseData.schedule_text || bookingData?.schedule_time,
            start_date: courseData.start_date || bookingData?.start_date,
            total_hours: courseData.total_hours,
            classroom: courseData.classroom,
          }
        : {
            title: bookingData?.course_name || 'Corso di Lingua',
            schedule_text: bookingData?.schedule_time || 'Orario da definire',
            start_date: bookingData?.start_date,
          },
      payment: {
        amount_total: totalAmount,
        amount_course: courseFee,
        registration_fee: registrationFee,
        payment_method_label: paymentData?.payment_method || bookingData?.payment_method || 'Stripe / Carta di Credito',
        is_paid: bookingData?.status === 2 || paymentData?.status === 'succeeded',
        receipt_number: paymentData?.receipt_number,
      },
      delegates: {
        delegate_1_name: formData?.pickup_delegate_1_name,
        delegate_1_relation: formData?.pickup_delegate_1_relation,
        delegate_1_phone: formData?.pickup_delegate_1_phone,
        delegate_2_name: formData?.pickup_delegate_2_name,
        delegate_2_relation: formData?.pickup_delegate_2_relation,
        delegate_2_phone: formData?.pickup_delegate_2_phone,
        self_exit_authorized: Boolean(formData?.self_exit_authorized_11plus),
      },
      issue_date: new Date().toLocaleDateString(dateLocale),
    };
  }

  /**
   * Generates, compiles and persists an official document record in database
   */
  static async generateDocument(
    supabase: SupabaseClient,
    dto: GenerateDocumentDto,
    createdByUserId?: string
  ): Promise<DocumentRecord> {
    const schoolProfile = await getSchoolProfile(supabase);

    // 1. Resolve Template
    let template: DocumentTemplateRecord | null = null;
    if (dto.template_id) {
      const { data } = await supabase.from('document_templates').select('*').eq('id', dto.template_id).single();
      template = data;
    } else if (dto.template_type) {
      template = await this.getTemplateByType(supabase, dto.template_type);
    }

    if (!template) {
      template = await this.getTemplateByType(supabase, DocumentTemplateType.MODULO_ISCRIZIONE_STANDARD);
    }

    const docType = dto.document_type || template?.document_type || DocumentType.REGISTRATION_CONTRACT;
    const catType = dto.category_type || template?.category_type || 1;
    const paperFormat = template?.paper_format || DocumentPaperFormat.A4_PORTRAIT;
    const blocksConfig = dto.blocks_config || template?.blocks_config || { version: 1, paper_format: paperFormat, blocks: [] };
    const locale = dto.locale || (template as any)?.locale || 'it';

    // 2. Aggregate Data Snapshot with Safe Deep Merge
    const autofillData = await this.extractAutofillData(supabase, {
      bookingId: dto.booking_id,
      studentId: dto.student_id,
      teacherId: dto.teacher_id,
      locale,
    });

    const isObj = (item: any) => item && typeof item === 'object' && !Array.isArray(item);
    const deepMerge = (target: any, source: any): any => {
      if (!source) return target;
      const output = { ...target };
      for (const key of Object.keys(source)) {
        const sVal = source[key];
        if (sVal !== undefined && sVal !== null && isObj(sVal) && isObj(target?.[key])) {
          output[key] = deepMerge(target[key], sVal);
        } else if (sVal !== undefined && sVal !== null) {
          output[key] = sVal;
        }
      }
      return output;
    };

    const mergedData = deepMerge(autofillData, dto.custom_data || {});

    // 3. Generate Sequential Number
    const { count } = await supabase.from('documents').select('*', { count: 'exact', head: true });
    const nextSeq = (count || 0) + 1;
    const documentNumber = formatDocumentNumber(docType, nextSeq);

    const rawTemplateName = template?.name ? resolveI18n(template.name, locale, 'Documento Ufficiale') : 'Documento Ufficiale';
    const title = dto.title || rawTemplateName;

    // 4. Compile HTML
    const renderedHtml = compileDocumentHtml({
      blocksConfig,
      data: mergedData,
      schoolProfile,
      documentNumber,
      documentTitle: title,
      locale,
    });

    // 5. Insert Document Record (Database-First with Immutable Snapshot)
    const isChildBooking = Boolean(mergedData.parent?.full_name);

    const recipientName =
      dto.recipient_name ||
      (isChildBooking ? mergedData.parent?.full_name : mergedData.student?.full_name) ||
      mergedData.student?.full_name ||
      mergedData.parent?.full_name ||
      mergedData.teacher?.full_name ||
      'Destinatario';

    const recipientEmail =
      dto.recipient_email ||
      (isChildBooking ? mergedData.parent?.email : mergedData.student?.email) ||
      mergedData.student?.email ||
      mergedData.parent?.email ||
      mergedData.teacher?.email;

    const recipientTaxCode =
      dto.recipient_tax_code ||
      (isChildBooking ? mergedData.parent?.tax_code : mergedData.student?.tax_code) ||
      mergedData.student?.tax_code ||
      mergedData.parent?.tax_code ||
      mergedData.teacher?.tax_code;

    const { data: newDoc, error } = await supabase
      .from('documents')
      .insert({
        document_number: documentNumber,
        document_type: docType,
        category_type: catType,
        status: DocumentStatus.GENERATED,
        source: dto.source || DocumentGenerationSource.CRM_MANUAL,
        paper_format: paperFormat,
        template_id: template?.id,
        template_type: template?.template_type,
        booking_id: dto.booking_id,
        student_id: dto.student_id,
        teacher_id: dto.teacher_id,
        title,
        locale,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        recipient_tax_code: recipientTaxCode,
        template_data: mergedData,
        rendered_html: renderedHtml,
        created_by: createdByUserId,
      })
      .select('*')
      .single();

    if (error || !newDoc) {
      console.error('[DocumentsService] Failed to insert document:', error);
      throw new Error(`Failed to generate document: ${error?.message}`);
    }

    // 6. Record Audit Log
    await supabase.from('document_logs').insert({
      document_id: newDoc.id,
      action: DocumentLogAction.GENERATED,
      performed_by: createdByUserId,
      metadata: {
        document_number: documentNumber,
        template_name: template?.name,
        locale,
        source: dto.source || DocumentGenerationSource.CRM_MANUAL,
      },
    });

    return {
      ...newDoc,
      document_type: parseDocumentType(newDoc.document_type),
      category_type: parseDocumentCategoryType(newDoc.category_type),
      status: parseDocumentStatus(newDoc.status),
      paper_format: parseDocumentPaperFormat(newDoc.paper_format),
    };
  }

  /**
   * Log action for a document
   */
  static async logAction(
    supabase: SupabaseClient,
    documentId: string,
    action: DocumentLogAction,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    await supabase.from('document_logs').insert({
      document_id: documentId,
      action,
      performed_by: userId,
      metadata: metadata || {},
    });
  }

  // --------------------------------------------------------------------------
  // Category CRUD
  // --------------------------------------------------------------------------
  static async createCategory(supabase: SupabaseClient, dto: any): Promise<DocumentCategoryRecord> {
    const nameJson = typeof dto.name === 'object' && dto.name !== null
      ? dto.name
      : typeof dto.name_it === 'string'
      ? { it: dto.name_it, en: dto.name_en || dto.name_it, ru: dto.name_ru || dto.name_it }
      : { it: String(dto.name || '') };

    const descJson = typeof dto.description === 'object' && dto.description !== null
      ? dto.description
      : typeof dto.description === 'string'
      ? { it: dto.description }
      : null;

    const { data, error } = await supabase
      .from('document_categories')
      .insert({
        category_type: dto.category_type || 1,
        name: nameJson,
        description: descJson,
        icon: dto.icon || 'file-text',
        order_index: dto.order_index || 99,
        is_active: dto.is_active !== undefined ? dto.is_active : true,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to create category: ${error?.message}`);
    }

    return {
      ...data,
      category_type: parseDocumentCategoryType(data.category_type),
    };
  }

  static async updateCategory(supabase: SupabaseClient, id: number, dto: any): Promise<DocumentCategoryRecord> {
    const payload: Record<string, any> = { ...dto, updated_at: new Date().toISOString() };

    if (dto.name !== undefined) {
      payload.name = typeof dto.name === 'object' && dto.name !== null ? dto.name : { it: String(dto.name) };
    }
    if (dto.description !== undefined && dto.description !== null) {
      payload.description = typeof dto.description === 'object' ? dto.description : { it: String(dto.description) };
    }

    const { data, error } = await supabase
      .from('document_categories')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to update category: ${error?.message}`);
    }

    return {
      ...data,
      category_type: parseDocumentCategoryType(data.category_type),
    };
  }

  static async deleteCategory(supabase: SupabaseClient, id: number): Promise<boolean> {
    const { error } = await supabase.from('document_categories').delete().eq('id', id);
    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // Template CRUD
  // --------------------------------------------------------------------------
  static async createTemplate(supabase: SupabaseClient, dto: any): Promise<DocumentTemplateRecord> {
    const nameJson = typeof dto.name === 'object' && dto.name !== null
      ? dto.name
      : { it: String(dto.name || '') };

    const descJson = typeof dto.description === 'object' && dto.description !== null
      ? dto.description
      : typeof dto.description === 'string'
      ? { it: dto.description }
      : null;

    const { data, error } = await supabase
      .from('document_templates')
      .insert({
        template_type: dto.template_type || null,
        category_type: dto.category_type || 1,
        document_type: dto.document_type || 1,
        recipient_type: dto.recipient_type || 1,
        paper_format: dto.paper_format || DocumentPaperFormat.A4_PORTRAIT,
        name: nameJson,
        description: descJson,
        locale: dto.locale || 'it',
        blocks_config: dto.blocks_config || {
          paper_format: dto.paper_format || DocumentPaperFormat.A4_PORTRAIT,
          blocks: [],
        },
        available_variables: dto.available_variables || [],
        header_html: dto.header_html || null,
        footer_html: dto.footer_html || null,
        css_styles: dto.css_styles || null,
        is_system: false,
        is_active: dto.is_active !== undefined ? dto.is_active : true,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to create template: ${error?.message}`);
    }

    return {
      ...data,
      template_type: data.template_type ? parseDocumentTemplateType(data.template_type) : null,
      category_type: parseDocumentCategoryType(data.category_type),
      document_type: parseDocumentType(data.document_type),
      paper_format: parseDocumentPaperFormat(data.paper_format),
    };
  }

  static async duplicateTemplate(supabase: SupabaseClient, id: number): Promise<DocumentTemplateRecord> {
    const { data: original, error: fetchErr } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !original) {
      throw new Error(`Original template ${id} not found`);
    }

    let duplicatedName: Record<string, string> | string;
    if (typeof original.name === 'object' && original.name !== null) {
      const obj = original.name as Record<string, string>;
      const newObj: Record<string, string> = {};
      for (const k of Object.keys(obj)) {
        newObj[k] = `${obj[k]} (Copia)`;
      }
      duplicatedName = newObj;
    } else {
      duplicatedName = `${original.name || 'Template'} (Copia)`;
    }

    const { data, error } = await supabase
      .from('document_templates')
      .insert({
        template_type: null,
        category_type: original.category_type,
        document_type: original.document_type,
        recipient_type: original.recipient_type,
        paper_format: original.paper_format,
        name: duplicatedName,
        description: original.description,
        locale: original.locale || 'it',
        blocks_config: original.blocks_config,
        available_variables: original.available_variables,
        header_html: original.header_html,
        footer_html: original.footer_html,
        css_styles: original.css_styles,
        is_system: false,
        is_active: true,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to duplicate template: ${error?.message}`);
    }

    return {
      ...data,
      template_type: data.template_type ? parseDocumentTemplateType(data.template_type) : null,
      category_type: parseDocumentCategoryType(data.category_type),
      document_type: parseDocumentType(data.document_type),
      paper_format: parseDocumentPaperFormat(data.paper_format),
    };
  }

  static async deleteTemplate(supabase: SupabaseClient, id: number): Promise<boolean> {
    const { error } = await supabase.from('document_templates').delete().eq('id', id);
    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // Log CRUD
  // --------------------------------------------------------------------------
  static async deleteLog(supabase: SupabaseClient, id: number): Promise<boolean> {
    const { error } = await supabase.from('document_logs').delete().eq('id', id);
    if (error) {
      throw new Error(`Failed to delete log: ${error.message}`);
    }
    return true;
  }

  static async clearLogs(supabase: SupabaseClient): Promise<boolean> {
    const { error } = await supabase.from('document_logs').delete().neq('id', 0);
    if (error) {
      throw new Error(`Failed to clear logs: ${error.message}`);
    }
    return true;
  }
}

