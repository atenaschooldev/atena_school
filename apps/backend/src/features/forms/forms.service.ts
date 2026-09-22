import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';
import {
  FormTemplate,
  FormType,
  ResolveFormQuery,
} from '@atena/api-types';
import {
  resolveActiveFormTemplate,
  DEFAULT_BOOKING_FORM_TEMPLATE,
  DEFAULT_CONTACT_FORM_TEMPLATE,
} from '@atena/core';
import {
  CreateFormTemplateDto,
  UpdateFormTemplateDto,
} from './dto/forms.dto';

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.clientInstance;
  }

  /**
   * Получить список всех форм с фильтрацией
   */
  async getForms(filter?: { form_type?: FormType; is_active?: boolean }): Promise<FormTemplate[]> {
    try {
      let query = this.supabase.from('form_templates').select('*').order('created_at', { ascending: false });

      if (filter?.form_type !== undefined) {
        query = query.eq('form_type', filter.form_type);
      }
      if (typeof filter?.is_active === 'boolean') {
        query = query.eq('is_active', filter.is_active);
      }

      const defaultList = [DEFAULT_BOOKING_FORM_TEMPLATE, DEFAULT_CONTACT_FORM_TEMPLATE];
      const getFallback = () => {
        if (filter?.form_type !== undefined) {
          return defaultList.filter((f) => f.form_type === filter.form_type);
        }
        return defaultList;
      };

      const { data, error } = await query;
      if (error) {
        this.logger.warn(`Failed to fetch form templates from DB: ${error.message}. Returning default.`);
        return getFallback();
      }

      if (!data || data.length === 0) {
        return getFallback();
      }

      return data as FormTemplate[];
    } catch (err: any) {
      this.logger.error(`Error in getForms: ${err.message}`);
      return [DEFAULT_BOOKING_FORM_TEMPLATE, DEFAULT_CONTACT_FORM_TEMPLATE];
    }
  }

  private resolveFormId(id: string): string {
    if (id === 'default-booking-form') return '00000000-0000-0000-0000-000000000001';
    if (id === 'default-contact-form') return '00000000-0000-0000-0000-000000000002';
    return id;
  }

  /**
   * Получить форму по ID
   */
  async getFormById(id: string): Promise<FormTemplate> {
    const targetId = this.resolveFormId(id);

    const { data, error } = await this.supabase
      .from('form_templates')
      .select('*')
      .eq('id', targetId)
      .single();

    if (error || !data) {
      if (targetId === '00000000-0000-0000-0000-000000000001') {
        return DEFAULT_BOOKING_FORM_TEMPLATE;
      }
      if (targetId === '00000000-0000-0000-0000-000000000002') {
        return DEFAULT_CONTACT_FORM_TEMPLATE;
      }
      throw new NotFoundException(`Modulo con ID "${id}" non trovato.`);
    }

    return data as FormTemplate;
  }

  /**
   * Каскадный резолв активной формы для курса/категории
   */
  async resolveForm(query: ResolveFormQuery): Promise<FormTemplate> {
    const templates = await this.getForms({
      form_type: query.form_type,
      is_active: true,
    });

    return resolveActiveFormTemplate(templates, query);
  }

  /**
   * Создать новый шаблон формы
   */
  async createForm(dto: CreateFormTemplateDto): Promise<FormTemplate> {
    // Если форма создаётся как дефолтная, сбрасываем предыдущую дефолтную для этого типа
    if (dto.is_default) {
      await this.supabase
        .from('form_templates')
        .update({ is_default: false })
        .eq('form_type', dto.form_type);
    }

    const { data, error } = await this.supabase
      .from('form_templates')
      .insert({
        title: dto.title,
        description: dto.description || null,
        form_type: dto.form_type,
        is_default: dto.is_default ?? false,
        is_active: dto.is_active ?? true,
        category_slug: dto.category_slug || null,
        course_id: dto.course_id || null,
        fields_config: dto.fields_config || [],
      })
      .select()
      .single();

    if (error || !data) {
      this.logger.error(`Failed to create form template: ${error?.message}`);
      throw new BadRequestException(`Errore creazione modulo: ${error?.message}`);
    }

    return data as FormTemplate;
  }

  /**
   * Обновить существующий шаблон формы
   */
  async updateForm(id: string, dto: UpdateFormTemplateDto): Promise<FormTemplate> {
    const targetId = this.resolveFormId(id);
    const current = await this.getFormById(targetId);

    const formType = dto.form_type || current.form_type;

    if (dto.is_default) {
      await this.supabase
        .from('form_templates')
        .update({ is_default: false })
        .eq('form_type', formType);
    }

    const updatePayload: Record<string, any> = {};
    if (dto.title !== undefined) updatePayload.title = dto.title;
    if (dto.description !== undefined) updatePayload.description = dto.description;
    if (dto.form_type !== undefined) updatePayload.form_type = dto.form_type;
    if (dto.is_default !== undefined) updatePayload.is_default = dto.is_default;
    if (dto.is_active !== undefined) updatePayload.is_active = dto.is_active;
    if (dto.category_slug !== undefined) updatePayload.category_slug = dto.category_slug;
    if (dto.course_id !== undefined) updatePayload.course_id = dto.course_id;
    if (dto.fields_config !== undefined) updatePayload.fields_config = dto.fields_config;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('form_templates')
      .update(updatePayload)
      .eq('id', targetId)
      .select()
      .single();

    if (error || !data) {
      // If updating a system template that doesn't exist yet in the DB table, upsert it
      if (targetId === '00000000-0000-0000-0000-000000000001' || targetId === '00000000-0000-0000-0000-000000000002') {
        const { data: upsertData, error: upsertErr } = await this.supabase
          .from('form_templates')
          .upsert({
            id: targetId,
            title: dto.title ?? current.title,
            description: dto.description ?? current.description,
            form_type: formType,
            is_default: dto.is_default ?? current.is_default,
            is_active: dto.is_active ?? current.is_active,
            category_slug: dto.category_slug ?? current.category_slug,
            course_id: dto.course_id ?? current.course_id,
            fields_config: dto.fields_config ?? current.fields_config,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!upsertErr && upsertData) {
          return upsertData as FormTemplate;
        }
      }
      throw new BadRequestException(`Errore aggiornamento modulo: ${error?.message}`);
    }

    return data as FormTemplate;
  }

  /**
   * Удалить шаблон формы
   */
  async deleteForm(id: string): Promise<{ success: boolean; id: string }> {
    const targetId = this.resolveFormId(id);
    const current = await this.getFormById(targetId);

    if (
      current.is_default ||
      targetId === '00000000-0000-0000-0000-000000000001' ||
      targetId === '00000000-0000-0000-0000-000000000002'
    ) {
      throw new BadRequestException('Non è possibile eliminare un modulo di sistema predefinito.');
    }

    const { error } = await this.supabase
      .from('form_templates')
      .delete()
      .eq('id', targetId);

    if (error) {
      throw new BadRequestException(`Errore eliminazione modulo: ${error.message}`);
    }

    return { success: true, id };
  }

  /**
   * Установить форму дефолтной в 1 клик
   */
  async setDefaultForm(id: string): Promise<FormTemplate> {
    const current = await this.getFormById(id);

    await this.supabase
      .from('form_templates')
      .update({ is_default: false })
      .eq('form_type', current.form_type);

    const { data, error } = await this.supabase
      .from('form_templates')
      .update({ is_default: true, is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new BadRequestException(`Errore impostazione modulo predefinito: ${error?.message}`);
    }

    return data as FormTemplate;
  }

  /**
   * Дублировать существующую форму
   */
  async duplicateForm(id: string): Promise<FormTemplate> {
    const current = await this.getFormById(id);

    return this.createForm({
      title: `${current.title} (Copia)`,
      description: current.description,
      form_type: current.form_type,
      is_default: false,
      is_active: true,
      category_slug: current.category_slug,
      course_id: null,
      fields_config: current.fields_config || [],
    });
  }
}
