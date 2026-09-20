import { Injectable, Logger } from '@nestjs/common';
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

  async getAnalyticsSettings() {
    return getAnalyticsCredentials(this.supabaseAdmin);
  }

  async getDomainsSettings() {
    return getDomainsCredentials(this.supabaseAdmin);
  }
}

