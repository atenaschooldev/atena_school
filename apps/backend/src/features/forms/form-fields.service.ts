import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { FormFieldItem, FormFieldTarget } from '@atena/api-types';
import { CreateFormFieldDto, UpdateFormFieldDto } from './dto/forms.dto';

@Injectable()
export class FormFieldsService {
  private readonly logger = new Logger(FormFieldsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.clientInstance;
  }

  /**
   * Получить список всех полей с фильтрацией
   */
  async getFields(filter?: { target?: string; is_system?: boolean }): Promise<FormFieldItem[]> {
    try {
      let query = this.supabase
        .from('form_fields')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (filter?.target) {
        query = query.eq('target', filter.target);
      }
      if (typeof filter?.is_system === 'boolean') {
        query = query.eq('is_system', filter.is_system);
      }

      const { data, error } = await query;
      if (error) {
        this.logger.error(`Error fetching form fields: ${error.message}`);
        throw new BadRequestException(`Errore caricamento campi: ${error.message}`);
      }

      return (data || []) as FormFieldItem[];
    } catch (err: any) {
      this.logger.error(`getFields exception: ${err.message}`);
      throw err;
    }
  }

  /**
   * Получить поле по ID
   */
  async getFieldById(id: string): Promise<FormFieldItem> {
    const { data, error } = await this.supabase
      .from('form_fields')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Campo con ID "${id}" non trovato.`);
    }

    return data as FormFieldItem;
  }

  /**
   * Создать новое поле
   */
  async createField(dto: CreateFormFieldDto): Promise<FormFieldItem> {
    const normalizedKey = dto.key.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    if (!normalizedKey) {
      throw new BadRequestException('Chiave del campo non valida. Usa caratteri alfanumerici e underscore.');
    }

    // Проверка уникальности ключа
    const { data: existing } = await this.supabase
      .from('form_fields')
      .select('id')
      .eq('key', normalizedKey)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(`Un campo con la chiave "${normalizedKey}" esiste già.`);
    }

    const { data, error } = await this.supabase
      .from('form_fields')
      .insert({
        key: normalizedKey,
        label_it: dto.label_it.trim(),
        label_en: dto.label_en.trim(),
        placeholder_it: dto.placeholder_it?.trim() || null,
        placeholder_en: dto.placeholder_en?.trim() || null,
        field_type: dto.field_type || 'text',
        target: dto.target || 'purchaser',
        options: dto.options || [],
        is_system: dto.is_system ?? false,
        is_required_default: dto.is_required_default ?? false,
        sort_order: dto.sort_order ?? 0,
      })
      .select()
      .single();

    if (error || !data) {
      this.logger.error(`Failed to create form field: ${error?.message}`);
      throw new BadRequestException(`Errore creazione campo: ${error?.message}`);
    }

    return data as FormFieldItem;
  }

  /**
   * Обновить существующее поле
   */
  async updateField(id: string, dto: UpdateFormFieldDto): Promise<FormFieldItem> {
    const current = await this.getFieldById(id);

    const updatePayload: Record<string, any> = {};
    if (dto.label_it !== undefined) updatePayload.label_it = dto.label_it.trim();
    if (dto.label_en !== undefined) updatePayload.label_en = dto.label_en.trim();
    if (dto.placeholder_it !== undefined) updatePayload.placeholder_it = dto.placeholder_it?.trim() || null;
    if (dto.placeholder_en !== undefined) updatePayload.placeholder_en = dto.placeholder_en?.trim() || null;
    if (dto.field_type !== undefined) updatePayload.field_type = dto.field_type;
    if (dto.target !== undefined) updatePayload.target = dto.target;
    if (dto.options !== undefined) updatePayload.options = dto.options;
    if (dto.is_required_default !== undefined) updatePayload.is_required_default = dto.is_required_default;
    if (dto.sort_order !== undefined) updatePayload.sort_order = dto.sort_order;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('form_fields')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new BadRequestException(`Errore aggiornamento campo: ${error?.message}`);
    }

    return data as FormFieldItem;
  }

  /**
   * Удалить поле (запрещено для системных полей)
   */
  async deleteField(id: string): Promise<{ success: boolean; id: string }> {
    const current = await this.getFieldById(id);

    if (current.is_system) {
      throw new BadRequestException('Non è possibile eliminare un campo di sistema predefinito.');
    }

    const { error } = await this.supabase
      .from('form_fields')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Errore eliminazione campo: ${error.message}`);
    }

    return { success: true, id };
  }
}
