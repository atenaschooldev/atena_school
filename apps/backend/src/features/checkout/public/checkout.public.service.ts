import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeClient = require('stripe');
import { CheckFeeDto, CreateReservationDto, VerifyPaymentDto, ContactFormDto, CustomerPortalDto } from '../dto/checkout.public.dto';
import {
  checkFeeStatus as checkFeeStatusCore,
  createReservationWorkflow,
  createStripeSession as createStripeSessionCore,
  verifyPayment as verifyPaymentCore,
  getSystemSettings as getSystemSettingsCore,
  updateSystemSettings as updateSystemSettingsCore,
  createCustomerPortalSession as createCustomerPortalSessionCore,
  submitContactWorkflow,
  getPublicCourses as getPublicCoursesCore,
  getPublicCourseById as getPublicCourseByIdCore,
  getBookingDetails as getBookingDetailsCore,
  handleStripeWebhook as handleStripeWebhookCore,
  getSchoolProfile as getSchoolProfileCore,
  updateSchoolProfile as updateSchoolProfileCore,
  getStripeCredentials,
  getAnalyticsCredentials,
  getDomainsCredentials,
} from '@atena/core';
import type { SchoolProfile } from '@atena/api-types';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);
  private supabaseAdmin: SupabaseClient;
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY || '';

    this.supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const StripeConstructor = typeof StripeClient === 'function' ? StripeClient : StripeClient.default;
    this.stripe = new StripeConstructor(stripeSecret, { apiVersion: '2023-10-16' });
  }

  private async getStripeInstance(): Promise<Stripe> {
    try {
      const creds = await getStripeCredentials(this.supabaseAdmin);
      if (creds.secretKey) {
        const StripeConstructor = typeof StripeClient === 'function' ? StripeClient : StripeClient.default;
        return new StripeConstructor(creds.secretKey, { apiVersion: '2023-10-16' });
      }
    } catch (e) {
      this.logger.warn('Failed to load dynamic stripe credentials:', e);
    }
    return this.stripe;
  }

  async checkFeeStatus(dto: CheckFeeDto) {
    return checkFeeStatusCore(this.supabaseAdmin, dto);
  }

  async createReservation(dto: CreateReservationDto) {
    return createReservationWorkflow(this.supabaseAdmin, dto as any);
  }

  async getSettings() {
    return getSystemSettingsCore(this.supabaseAdmin);
  }

  async updateSettings(dto: { stripeEnabled?: boolean; subscriptionsEnabled?: boolean }) {
    return updateSystemSettingsCore(this.supabaseAdmin, dto);
  }

  async createStripeSession(dto: CreateReservationDto) {
    const siteUrl = this.configService.get<string>('NEXT_PUBLIC_SITE_URL') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const stripe = await this.getStripeInstance();
    return createStripeSessionCore(this.supabaseAdmin, dto as any, { stripe, siteUrl });
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    const stripe = await this.getStripeInstance();
    return verifyPaymentCore(this.supabaseAdmin, dto, { stripe });
  }

  async createCustomerPortalSession(dto: CustomerPortalDto) {
    const siteUrl = this.configService.get<string>('NEXT_PUBLIC_SITE_URL') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const stripe = await this.getStripeInstance();
    return createCustomerPortalSessionCore(this.supabaseAdmin, {
      ...dto,
      stripe,
      returnUrl: `${siteUrl}/checkout`,
    });
  }

  async submitContact(dto: ContactFormDto) {
    return submitContactWorkflow(this.supabaseAdmin, dto);
  }

  async handleStripeWebhook(rawBody: string | Buffer, signature: string) {
    return handleStripeWebhookCore(this.supabaseAdmin, rawBody, signature);
  }

  async getCourses() {
    return getPublicCoursesCore(this.supabaseAdmin);
  }

  async getPublicCourses() {
    return getPublicCoursesCore(this.supabaseAdmin);
  }

  async getCourse(id: string) {
    return getPublicCourseByIdCore(this.supabaseAdmin, id);
  }

  async getCourseById(id: string) {
    return getPublicCourseByIdCore(this.supabaseAdmin, id);
  }

  async getItem(id: string) {
    return this.getCourse(id);
  }

  async getBookingDetails(id: string) {
    return getBookingDetailsCore(this.supabaseAdmin, id);
  }

  async getSchoolProfile() {
    return getSchoolProfileCore(this.supabaseAdmin);
  }

  async updateSchoolProfile(profile: Partial<SchoolProfile>) {
    return updateSchoolProfileCore(this.supabaseAdmin, profile);
  }

  async uploadLogoAsset(dataUrl: string, fileName?: string): Promise<{ url: string }> {
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

    if (buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException('Dimensione del file supera il limite massimo di 5MB');
    }

    let ext = 'png';
    if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('svg')) ext = 'svg';
    else if (mimeType.includes('png')) ext = 'png';

    const filename = `logo-${Date.now()}.${ext}`;

    const { error: uploadError } = await this.supabaseAdmin.storage
      .from('brand-assets')
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      throw new BadRequestException(`Errore caricamento storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = this.supabaseAdmin.storage
      .from('brand-assets')
      .getPublicUrl(filename);

    return { url: publicUrlData.publicUrl };
  }

  async getAnalyticsSettings() {
    return getAnalyticsCredentials(this.supabaseAdmin);
  }

  async getDomainsSettings() {
    return getDomainsCredentials(this.supabaseAdmin);
  }
}

