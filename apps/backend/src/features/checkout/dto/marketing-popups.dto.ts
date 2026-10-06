import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import type {
  PopupContentType,
  PopupTriggerType,
  PopupFrequency,
  PopupPosition,
  PopupCtaActionType,
  PopupSecondaryCtaActionType,
  PopupDeviceTarget,
} from '@atena/api-types';

export class CreateMarketingPopupDto {
  @ApiProperty({ description: 'Internal campaign title', example: 'Sconto Autunno 2026' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Is popup active', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: 'Popup layout type: image_only, text_only, combined',
    enum: ['image_only', 'text_only', 'combined'],
    default: 'combined',
  })
  @IsEnum(['image_only', 'text_only', 'combined'])
  content_type: PopupContentType;

  @ApiPropertyOptional({
    description: 'Screen position: center, bottom_bar, bottom_right, bottom_left',
    enum: ['center', 'bottom_bar', 'bottom_right', 'bottom_left'],
    default: 'center',
  })
  @IsOptional()
  @IsEnum(['center', 'bottom_bar', 'bottom_right', 'bottom_left'])
  position?: PopupPosition;

  @ApiPropertyOptional({ description: 'Custom accent color hex (e.g. #7c3aed)' })
  @IsOptional()
  @IsString()
  custom_theme_color?: string | null;

  @ApiPropertyOptional({ description: 'Image CDN URL' })
  @IsOptional()
  @IsString()
  image_url?: string | null;

  @ApiPropertyOptional({ description: 'Badge tag text (e.g. SCONTO 20%)' })
  @IsOptional()
  @IsString()
  badge_text?: string | null;

  @ApiPropertyOptional({ description: 'Main headline displayed to user' })
  @IsOptional()
  @IsString()
  display_title?: string | null;

  @ApiPropertyOptional({ description: 'Description or promo text' })
  @IsOptional()
  @IsString()
  display_text?: string | null;

  // Primary CTA
  @ApiPropertyOptional({ description: 'CTA button label' })
  @IsOptional()
  @IsString()
  cta_text?: string | null;

  @ApiPropertyOptional({ description: 'CTA destination URL, social link or anchor (#lead-form)' })
  @IsOptional()
  @IsString()
  cta_url?: string | null;

  @ApiPropertyOptional({
    description: 'CTA action type: link, copy_promo, scroll_to, whatsapp, telegram',
    enum: ['link', 'copy_promo', 'scroll_to', 'whatsapp', 'telegram'],
    default: 'link',
  })
  @IsOptional()
  @IsEnum(['link', 'copy_promo', 'scroll_to', 'whatsapp', 'telegram'])
  cta_action_type?: PopupCtaActionType;

  @ApiPropertyOptional({ description: 'Open in new tab (_blank) or same tab (_self)', default: '_blank' })
  @IsOptional()
  @IsEnum(['_blank', '_self'])
  cta_target?: '_blank' | '_self';

  @ApiPropertyOptional({ description: 'Promo code to copy to clipboard upon CTA click' })
  @IsOptional()
  @IsString()
  promo_code_to_copy?: string | null;

  // Secondary CTA
  @ApiPropertyOptional({ description: 'Secondary button text' })
  @IsOptional()
  @IsString()
  secondary_cta_text?: string | null;

  @ApiPropertyOptional({
    description: 'Secondary CTA action type: dismiss, link, whatsapp, telegram',
    enum: ['dismiss', 'link', 'whatsapp', 'telegram'],
    default: 'dismiss',
  })
  @IsOptional()
  @IsEnum(['dismiss', 'link', 'whatsapp', 'telegram'])
  secondary_cta_action_type?: PopupSecondaryCtaActionType;

  @ApiPropertyOptional({ description: 'Secondary CTA URL or link' })
  @IsOptional()
  @IsString()
  secondary_cta_url?: string | null;

  @ApiPropertyOptional({ description: 'Secondary CTA link target (_blank, _self)', default: '_blank' })
  @IsOptional()
  @IsEnum(['_blank', '_self'])
  secondary_cta_target?: '_blank' | '_self';

  // Triggers
  @ApiPropertyOptional({
    description: 'Trigger type: delay, scroll, exit_intent, immediate, inactivity',
    enum: ['delay', 'scroll', 'exit_intent', 'immediate', 'inactivity'],
    default: 'delay',
  })
  @IsOptional()
  @IsEnum(['delay', 'scroll', 'exit_intent', 'immediate', 'inactivity'])
  trigger_type?: PopupTriggerType;

  @ApiPropertyOptional({ description: 'Trigger delay in seconds', default: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  trigger_delay_seconds?: number;

  @ApiPropertyOptional({ description: 'Trigger scroll depth percentage', default: 40 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  trigger_scroll_percentage?: number;

  @ApiPropertyOptional({ description: 'Trigger user inactivity seconds', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300)
  trigger_inactivity_seconds?: number;

  @ApiPropertyOptional({ description: 'Multi-trigger: fire when any active trigger condition is met', default: false })
  @IsOptional()
  @IsBoolean()
  multi_trigger?: boolean;

  // Audience & Frequency
  @ApiPropertyOptional({
    description: 'Frequency capping: once_per_session, once_per_day, once_forever, always',
    enum: ['once_per_session', 'once_per_day', 'once_forever', 'always'],
    default: 'once_per_day',
  })
  @IsOptional()
  @IsEnum(['once_per_session', 'once_per_day', 'once_forever', 'always'])
  frequency?: PopupFrequency;

  @ApiPropertyOptional({
    description: 'Target device: all, desktop_only, mobile_only',
    enum: ['all', 'desktop_only', 'mobile_only'],
    default: 'all',
  })
  @IsOptional()
  @IsEnum(['all', 'desktop_only', 'mobile_only'])
  target_devices?: PopupDeviceTarget;

  @ApiPropertyOptional({ description: 'Target languages (e.g. ["*"] or ["it", "en"])', default: ['*'] })
  @IsOptional()
  @IsArray()
  target_languages?: string[];

  @ApiPropertyOptional({ description: 'Target routes / pages (e.g. ["*"] or ["/", "/corsi"])', default: ['*'] })
  @IsOptional()
  @IsArray()
  target_routes?: string[];

  @ApiPropertyOptional({ description: 'Valid from date (ISO string)' })
  @IsOptional()
  @IsString()
  start_date?: string | null;

  @ApiPropertyOptional({ description: 'Valid until date (ISO string)' })
  @IsOptional()
  @IsString()
  end_date?: string | null;

  @ApiPropertyOptional({ description: 'Priority order (higher = higher precedence)', default: 0 })
  @IsOptional()
  @IsInt()
  priority?: number;
}

export class UpdateMarketingPopupDto extends CreateMarketingPopupDto {}

export class UploadPopupImageDto {
  @ApiProperty({ description: 'Base64 image data URL', example: 'data:image/webp;base64,...' })
  @IsString()
  @IsNotEmpty()
  dataUrl: string;

  @ApiPropertyOptional({ description: 'Original file name', example: 'banner-winter.webp' })
  @IsOptional()
  @IsString()
  fileName?: string;
}
