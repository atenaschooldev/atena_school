import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateMarketingPopupDto, UpdateMarketingPopupDto } from '../dto/marketing-popups.dto';
import type { MarketingPopupItem } from '@atena/api-types';

@Injectable()
export class MarketingPopupsAdminService {
  private readonly logger = new Logger(MarketingPopupsAdminService.name);
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ||
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') ||
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '';
    const serviceKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      '';
    this.supabaseAdmin = createClient(supabaseUrl, serviceKey);
  }

  async listAllPopups(): Promise<MarketingPopupItem[]> {
    const { data, error } = await this.supabaseAdmin
      .from('marketing_popups')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to list marketing popups:', error);
      throw new BadRequestException(`Failed to list marketing popups: ${error.message}`);
    }

    return (data || []) as MarketingPopupItem[];
  }

  async getActivePopup(
    currentRoute: string = '/',
    device: 'desktop' | 'mobile' | 'all' = 'all',
    lang: string = '*'
  ): Promise<MarketingPopupItem | null> {
    const nowIso = new Date().toISOString();
    const { data, error } = await this.supabaseAdmin
      .from('marketing_popups')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${nowIso}`)
      .or(`end_date.is.null,end_date.gte.${nowIso}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to get active marketing popup:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Filter by target route, device, and language matching
    const matching = data.find((popup: any) => {
      // 1. Device filter
      if (popup.target_devices && popup.target_devices !== 'all' && device !== 'all') {
        if (popup.target_devices === 'desktop_only' && device !== 'desktop') return false;
        if (popup.target_devices === 'mobile_only' && device !== 'mobile') return false;
      }

      // 2. Language filter
      if (Array.isArray(popup.target_languages) && popup.target_languages.length > 0 && !popup.target_languages.includes('*')) {
        if (lang !== '*' && !popup.target_languages.includes(lang)) return false;
      }

      // 3. Target route matching
      const routes = Array.isArray(popup.target_routes) && popup.target_routes.length > 0
        ? popup.target_routes
        : ['*'];

      if (routes.includes('*')) return true;
      return routes.some((pattern: string) => {
        if (pattern === currentRoute) return true;
        if (pattern.endsWith('*')) {
          const prefix = pattern.slice(0, -1);
          return currentRoute.startsWith(prefix);
        }
        return false;
      });
    });

    return (matching || null) as MarketingPopupItem | null;
  }

  async createPopup(dto: CreateMarketingPopupDto): Promise<MarketingPopupItem> {
    const { data, error } = await this.supabaseAdmin
      .from('marketing_popups')
      .insert({
        title: dto.title.trim(),
        is_active: dto.is_active !== false,
        content_type: dto.content_type || 'combined',
        position: dto.position || 'center',
        custom_theme_color: dto.custom_theme_color || null,
        
        image_url: dto.image_url || null,
        badge_text: dto.badge_text?.trim() || null,
        display_title: dto.display_title?.trim() || null,
        display_text: dto.display_text?.trim() || null,
        
        cta_text: dto.cta_text?.trim() || null,
        cta_url: dto.cta_url?.trim() || null,
        cta_action_type: dto.cta_action_type || 'link',
        cta_target: dto.cta_target || '_blank',
        promo_code_to_copy: dto.promo_code_to_copy?.trim() || null,
        
        secondary_cta_text: dto.secondary_cta_text?.trim() || null,
        secondary_cta_action_type: dto.secondary_cta_action_type || 'dismiss',
        secondary_cta_url: dto.secondary_cta_url?.trim() || null,
        secondary_cta_target: dto.secondary_cta_target || '_blank',
        
        trigger_type: dto.trigger_type || 'delay',
        trigger_delay_seconds: dto.trigger_delay_seconds ?? 5,
        trigger_scroll_percentage: dto.trigger_scroll_percentage ?? 40,
        trigger_inactivity_seconds: dto.trigger_inactivity_seconds ?? 0,
        multi_trigger: Boolean(dto.multi_trigger),
        
        frequency: dto.frequency || 'once_per_day',
        target_devices: dto.target_devices || 'all',
        target_languages: Array.isArray(dto.target_languages) && dto.target_languages.length > 0
          ? dto.target_languages
          : ['*'],
        target_routes: Array.isArray(dto.target_routes) && dto.target_routes.length > 0
          ? dto.target_routes
          : ['*'],
          
        start_date: dto.start_date || null,
        end_date: dto.end_date || null,
        priority: dto.priority ?? 0,
      })
      .select()
      .single();

    if (error || !data) {
      this.logger.error('Failed to create marketing popup:', error);
      throw new BadRequestException(error?.message || 'Failed to create marketing popup');
    }

    return data as MarketingPopupItem;
  }

  async updatePopup(id: string, dto: Partial<UpdateMarketingPopupDto>): Promise<MarketingPopupItem> {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.title !== undefined) updatePayload.title = dto.title.trim();
    if (dto.is_active !== undefined) updatePayload.is_active = Boolean(dto.is_active);
    if (dto.content_type !== undefined) updatePayload.content_type = dto.content_type;
    if (dto.position !== undefined) updatePayload.position = dto.position;
    if (dto.custom_theme_color !== undefined) updatePayload.custom_theme_color = dto.custom_theme_color || null;
    
    if (dto.image_url !== undefined) updatePayload.image_url = dto.image_url || null;
    if (dto.badge_text !== undefined) updatePayload.badge_text = dto.badge_text?.trim() || null;
    if (dto.display_title !== undefined) updatePayload.display_title = dto.display_title?.trim() || null;
    if (dto.display_text !== undefined) updatePayload.display_text = dto.display_text?.trim() || null;
    
    if (dto.cta_text !== undefined) updatePayload.cta_text = dto.cta_text?.trim() || null;
    if (dto.cta_url !== undefined) updatePayload.cta_url = dto.cta_url?.trim() || null;
    if (dto.cta_action_type !== undefined) updatePayload.cta_action_type = dto.cta_action_type;
    if (dto.cta_target !== undefined) updatePayload.cta_target = dto.cta_target;
    if (dto.promo_code_to_copy !== undefined) updatePayload.promo_code_to_copy = dto.promo_code_to_copy?.trim() || null;
    
    if (dto.secondary_cta_text !== undefined) updatePayload.secondary_cta_text = dto.secondary_cta_text?.trim() || null;
    if (dto.secondary_cta_action_type !== undefined) updatePayload.secondary_cta_action_type = dto.secondary_cta_action_type;
    if (dto.secondary_cta_url !== undefined) updatePayload.secondary_cta_url = dto.secondary_cta_url?.trim() || null;
    if (dto.secondary_cta_target !== undefined) updatePayload.secondary_cta_target = dto.secondary_cta_target;
    
    if (dto.trigger_type !== undefined) updatePayload.trigger_type = dto.trigger_type;
    if (dto.trigger_delay_seconds !== undefined) updatePayload.trigger_delay_seconds = dto.trigger_delay_seconds;
    if (dto.trigger_scroll_percentage !== undefined) updatePayload.trigger_scroll_percentage = dto.trigger_scroll_percentage;
    if (dto.trigger_inactivity_seconds !== undefined) updatePayload.trigger_inactivity_seconds = dto.trigger_inactivity_seconds;
    if (dto.multi_trigger !== undefined) updatePayload.multi_trigger = Boolean(dto.multi_trigger);
    
    if (dto.frequency !== undefined) updatePayload.frequency = dto.frequency;
    if (dto.target_devices !== undefined) updatePayload.target_devices = dto.target_devices;
    if (dto.target_languages !== undefined) updatePayload.target_languages = dto.target_languages;
    if (dto.target_routes !== undefined) updatePayload.target_routes = dto.target_routes;
    
    if (dto.start_date !== undefined) updatePayload.start_date = dto.start_date || null;
    if (dto.end_date !== undefined) updatePayload.end_date = dto.end_date || null;
    if (dto.priority !== undefined) updatePayload.priority = dto.priority;

    const { data, error } = await this.supabaseAdmin
      .from('marketing_popups')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      this.logger.error('Failed to update marketing popup:', error);
      throw new BadRequestException(error?.message || 'Failed to update marketing popup');
    }

    return data as MarketingPopupItem;
  }

  async togglePopup(id: string): Promise<MarketingPopupItem> {
    const { data: current } = await this.supabaseAdmin
      .from('marketing_popups')
      .select('id, is_active')
      .eq('id', id)
      .maybeSingle();

    if (!current) {
      throw new NotFoundException('Popup non trovato');
    }

    const { data, error } = await this.supabaseAdmin
      .from('marketing_popups')
      .update({
        is_active: !current.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new BadRequestException(error?.message || 'Failed to toggle marketing popup');
    }

    return data as MarketingPopupItem;
  }

  async deletePopup(id: string): Promise<{ success: boolean; id: string }> {
    const { error } = await this.supabaseAdmin
      .from('marketing_popups')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(error.message || 'Failed to delete popup');
    }

    return { success: true, id };
  }

  async uploadImage(dataUrl: string, fileName?: string): Promise<{ url: string }> {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      throw new BadRequestException('Formato dataUrl non valido');
    }

    const matches = dataUrl.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      throw new BadRequestException('Base64 malformato');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 10 * 1024 * 1024) {
      throw new BadRequestException('Dimensione del file supera il limite massimo di 10MB');
    }

    let ext = 'webp';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('svg')) ext = 'svg';
    else if (mimeType.includes('avif')) ext = 'avif';
    else if (mimeType.includes('webp')) ext = 'webp';

    const safeName = (fileName || 'popup')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const filename = `popup-${safeName}-${Date.now()}.${ext}`;

    const { error: uploadError } = await this.supabaseAdmin.storage
      .from('marketing-assets')
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      this.logger.error('Storage upload error:', uploadError);
      throw new BadRequestException(`Errore caricamento storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = this.supabaseAdmin.storage
      .from('marketing-assets')
      .getPublicUrl(filename);

    return { url: publicUrlData.publicUrl };
  }
}
