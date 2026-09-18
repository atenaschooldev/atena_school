import { getSupabaseAdmin } from '../supabase-admin';
import { submitContactWorkflow, ContactFormParams } from '@atena/core';

export async function submitContact(dto: ContactFormParams) {
  const supabase = getSupabaseAdmin();
  return submitContactWorkflow(supabase, dto);
}
