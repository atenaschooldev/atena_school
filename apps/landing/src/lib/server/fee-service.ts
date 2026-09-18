import { getSupabaseAdmin } from './supabase-admin';
import { checkFeeStatus as checkFeeStatusCore, CheckFeeParams as CheckFeeParamsCore } from '@atena/core';

export type CheckFeeParams = CheckFeeParamsCore;

export async function checkFeeStatus(params: CheckFeeParams) {
  const supabase = getSupabaseAdmin();
  return checkFeeStatusCore(supabase, params);
}
