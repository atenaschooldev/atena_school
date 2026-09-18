import { getSupabaseAdmin } from '../supabase-admin';
import {
  getStripeClient,
  getSystemSettings as getSystemSettingsCore,
  updateSystemSettings as updateSystemSettingsCore,
  createCustomerPortalSession as createCustomerPortalSessionCore,
  createStripeSession as createStripeSessionCore,
  verifyPayment as verifyPaymentCore,
  handleStripeWebhook as handleStripeWebhookCore,
  CreateReservationParams,
  VerifyPaymentParams,
} from '@atena/core';

export function getStripe() {
  return getStripeClient();
}

export async function getSystemSettings() {
  const supabase = getSupabaseAdmin();
  return getSystemSettingsCore(supabase);
}

export async function updateSystemSettings(settings: { stripeEnabled?: boolean; subscriptionsEnabled?: boolean }) {
  const supabase = getSupabaseAdmin();
  return updateSystemSettingsCore(supabase, settings);
}

export async function createCustomerPortalSession(params: {
  customerId?: string;
  bookingId?: string;
  email?: string;
  returnUrl?: string;
}) {
  const supabase = getSupabaseAdmin();
  return createCustomerPortalSessionCore(supabase, params);
}

export async function createStripeSession(dto: CreateReservationParams) {
  const supabase = getSupabaseAdmin();
  return createStripeSessionCore(supabase, dto);
}

export async function verifyPayment(params: VerifyPaymentParams) {
  const supabase = getSupabaseAdmin();
  return verifyPaymentCore(supabase, params);
}

export async function handleStripeWebhook(rawBody: string | Buffer, signature: string) {
  const supabase = getSupabaseAdmin();
  return handleStripeWebhookCore(supabase, rawBody, signature);
}
