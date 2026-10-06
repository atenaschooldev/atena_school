export const POPUP_CONTENT_TYPES = ['image_only', 'text_only', 'combined'] as const;
export type PopupContentType = typeof POPUP_CONTENT_TYPES[number];

export const POPUP_TRIGGER_TYPES = ['delay', 'scroll', 'exit_intent', 'immediate', 'inactivity'] as const;
export type PopupTriggerType = typeof POPUP_TRIGGER_TYPES[number];

export const POPUP_FREQUENCIES = ['once_per_session', 'once_per_day', 'once_forever', 'always'] as const;
export type PopupFrequency = typeof POPUP_FREQUENCIES[number];

export const POPUP_POSITIONS = ['center', 'bottom_bar', 'bottom_right', 'bottom_left'] as const;
export type PopupPosition = typeof POPUP_POSITIONS[number];

export const POPUP_CTA_ACTIONS = ['link', 'copy_promo', 'scroll_to', 'whatsapp', 'telegram'] as const;
export type PopupCtaActionType = typeof POPUP_CTA_ACTIONS[number];

export const POPUP_SECONDARY_CTA_ACTIONS = ['dismiss', 'link', 'whatsapp', 'telegram'] as const;
export type PopupSecondaryCtaActionType = typeof POPUP_SECONDARY_CTA_ACTIONS[number];

export const POPUP_DEVICE_TARGETS = ['all', 'desktop_only', 'mobile_only'] as const;
export type PopupDeviceTarget = typeof POPUP_DEVICE_TARGETS[number];

export interface MarketingPopupItem {
  id: string;
  title: string;
  is_active: boolean;
  content_type: PopupContentType;
  position: PopupPosition;
  custom_theme_color?: string | null;
  
  // Content fields
  image_url?: string | null;
  badge_text?: string | null;
  display_title?: string | null;
  display_text?: string | null;
  
  // Primary CTA
  cta_text?: string | null;
  cta_url?: string | null;
  cta_action_type: PopupCtaActionType;
  cta_target: '_blank' | '_self';
  promo_code_to_copy?: string | null;
  
  // Secondary CTA
  secondary_cta_text?: string | null;
  secondary_cta_action_type: PopupSecondaryCtaActionType;
  secondary_cta_url?: string | null;
  secondary_cta_target: '_blank' | '_self';
  
  // Trigger & Multi-trigger
  trigger_type: PopupTriggerType;
  trigger_delay_seconds: number;
  trigger_scroll_percentage: number;
  trigger_inactivity_seconds: number;
  multi_trigger: boolean;
  
  // Display limits & Audience targeting
  frequency: PopupFrequency;
  target_devices: PopupDeviceTarget;
  target_languages: string[];
  target_routes: string[];
  
  // Dates & Priority
  start_date?: string | null;
  end_date?: string | null;
  priority: number;
  
  created_at: string;
  updated_at: string;
}

export interface CreateMarketingPopupInput {
  title: string;
  is_active?: boolean;
  content_type: PopupContentType;
  position?: PopupPosition;
  custom_theme_color?: string | null;
  
  image_url?: string | null;
  badge_text?: string | null;
  display_title?: string | null;
  display_text?: string | null;
  
  cta_text?: string | null;
  cta_url?: string | null;
  cta_action_type?: PopupCtaActionType;
  cta_target?: '_blank' | '_self';
  promo_code_to_copy?: string | null;
  
  secondary_cta_text?: string | null;
  secondary_cta_action_type?: PopupSecondaryCtaActionType;
  secondary_cta_url?: string | null;
  secondary_cta_target?: '_blank' | '_self';
  
  trigger_type?: PopupTriggerType;
  trigger_delay_seconds?: number;
  trigger_scroll_percentage?: number;
  trigger_inactivity_seconds?: number;
  multi_trigger?: boolean;
  
  frequency?: PopupFrequency;
  target_devices?: PopupDeviceTarget;
  target_languages?: string[];
  target_routes?: string[];
  
  start_date?: string | null;
  end_date?: string | null;
  priority?: number;
}
