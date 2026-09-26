import { AppSettingKey, SchoolProfile, DEFAULT_SCHOOL_PROFILE } from '@atena/api-types';
import { getCurrentAcademicYear } from '@atena/utils';
import type { SupabaseClient } from '@supabase/supabase-js';

export { DEFAULT_SCHOOL_PROFILE };

/**
 * Clean street address to ensure it does not have old city/province/CAP appended
 * E.g. "Via Matteotti 11, Cittanova (RC)" -> "Via Matteotti 11"
 */
export function cleanStreetAddress(rawAddress?: string): string {
  if (!rawAddress) return '';
  const trimmed = rawAddress.trim();
  // If address contains a comma followed by city/prov/cap info (e.g. "Via Matteotti 11, Cittanova (RC)")
  // strip everything after the first comma if it looks like city/prov/cap
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      return parts[0] || trimmed;
    }
  }
  return trimmed;
}

/**
 * Format complete postal address cleanly: "Via Matteotti 11, 89022 Polistena (RC)"
 */
export function formatFullSchoolAddress(school: Partial<SchoolProfile>): string {
  const street = cleanStreetAddress(school.address);
  const city = school.city?.trim() || '';
  const province = school.province?.trim() || '';
  const cap = school.cap?.trim() || '';

  const cityPart = [cap, city, province ? `(${province})` : ''].filter(Boolean).join(' ');
  return [street, cityPart].filter(Boolean).join(', ');
}

export async function getSchoolProfile(supabase?: SupabaseClient | null): Promise<SchoolProfile> {
  const isDev = process.env.NODE_ENV === 'development';

  if (!supabase) {
    if (isDev) {
      return {
        ...DEFAULT_SCHOOL_PROFILE,
        site_url: 'http://localhost:3000',
        app_url: 'http://localhost:3002',
        admin_url: 'http://localhost:3001',
      };
    }
    return DEFAULT_SCHOOL_PROFILE;
  }

  try {
    // 1. Primary source: dedicated school_profiles table
    const { data: row, error } = await supabase
      .from('school_profiles')
      .select('*')
      .order('is_default', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && row) {
      return {
        ...DEFAULT_SCHOOL_PROFILE,
        id: row.id,
        is_default: row.is_default,
        name: row.name || DEFAULT_SCHOOL_PROFILE.name,
        legal_name: row.legal_name || DEFAULT_SCHOOL_PROFILE.legal_name,
        tagline: row.tagline || DEFAULT_SCHOOL_PROFILE.tagline,
        founders: row.founders || DEFAULT_SCHOOL_PROFILE.founders,
        logo_url: row.logo_url || DEFAULT_SCHOOL_PROFILE.logo_url,
        website: row.website || DEFAULT_SCHOOL_PROFILE.website,
        site_url: isDev ? 'http://localhost:3000' : (row.site_url || DEFAULT_SCHOOL_PROFILE.site_url),
        app_url: isDev ? 'http://localhost:3002' : (row.app_url || DEFAULT_SCHOOL_PROFILE.app_url),
        admin_url: isDev ? 'http://localhost:3001' : (row.admin_url || DEFAULT_SCHOOL_PROFILE.admin_url),
        address: cleanStreetAddress(row.address || DEFAULT_SCHOOL_PROFILE.address),
        city: row.city || DEFAULT_SCHOOL_PROFILE.city,
        cap: row.cap || DEFAULT_SCHOOL_PROFILE.cap,
        province: row.province || DEFAULT_SCHOOL_PROFILE.province,
        country: row.country || DEFAULT_SCHOOL_PROFILE.country,
        maps_url: row.maps_url || DEFAULT_SCHOOL_PROFILE.maps_url,
        phone: row.phone || DEFAULT_SCHOOL_PROFILE.phone,
        landline: row.landline || DEFAULT_SCHOOL_PROFILE.landline,
        whatsapp: row.whatsapp || DEFAULT_SCHOOL_PROFILE.whatsapp,
        email: row.email || DEFAULT_SCHOOL_PROFILE.email,
        secretariat_email: row.secretariat_email || DEFAULT_SCHOOL_PROFILE.secretariat_email,
        support_email: row.support_email || DEFAULT_SCHOOL_PROFILE.support_email,
        secretariat_hours: row.secretariat_hours || DEFAULT_SCHOOL_PROFILE.secretariat_hours,
        vat_code: row.vat_code || DEFAULT_SCHOOL_PROFILE.vat_code,
        registration_fee_enabled: row.registration_fee_enabled !== false,
        registration_fee_eur: row.registration_fee_eur != null ? Number(row.registration_fee_eur) : DEFAULT_SCHOOL_PROFILE.registration_fee_eur,
        academic_year: row.academic_year || DEFAULT_SCHOOL_PROFILE.academic_year,
        iban: row.iban || DEFAULT_SCHOOL_PROFILE.iban,
        bank_name: row.bank_name || DEFAULT_SCHOOL_PROFILE.bank_name,
        account_holder: row.account_holder || DEFAULT_SCHOOL_PROFILE.account_holder,
        socials: {
          ...DEFAULT_SCHOOL_PROFILE.socials,
          ...(row.socials || {}),
        },
      };
    }

    if (isDev) {
      return {
        ...DEFAULT_SCHOOL_PROFILE,
        site_url: 'http://localhost:3000',
        app_url: 'http://localhost:3002',
        admin_url: 'http://localhost:3001',
      };
    }
    return DEFAULT_SCHOOL_PROFILE;
  } catch (err) {
    console.warn('[SchoolProfile] Failed to load school profile from DB, falling back to defaults:', err);
    if (isDev) {
      return {
        ...DEFAULT_SCHOOL_PROFILE,
        site_url: 'http://localhost:3000',
        app_url: 'http://localhost:3002',
        admin_url: 'http://localhost:3001',
      };
    }
    return DEFAULT_SCHOOL_PROFILE;
  }
}

export async function updateSchoolProfile(
  supabase: SupabaseClient,
  profile: Partial<SchoolProfile>
): Promise<SchoolProfile> {
  const current = await getSchoolProfile(supabase);
  const updated: SchoolProfile = {
    ...current,
    ...profile,
    address: cleanStreetAddress(profile.address || current.address),
    socials: {
      ...current.socials,
      ...(profile.socials || {}),
    },
  };

  const recordId = current.id || '00000000-0000-0000-0000-000000000001';

  // Save directly to dedicated school_profiles table
  const { error: profileError } = await supabase
    .from('school_profiles')
    .upsert({
      id: recordId,
      is_default: true,
      name: updated.name,
      legal_name: updated.legal_name,
      tagline: updated.tagline,
      founders: updated.founders,
      logo_url: updated.logo_url,
      website: updated.website,
      site_url: updated.site_url,
      app_url: updated.app_url,
      admin_url: updated.admin_url,
      address: updated.address,
      city: updated.city,
      cap: updated.cap,
      province: updated.province,
      country: updated.country,
      maps_url: updated.maps_url,
      phone: updated.phone,
      landline: updated.landline,
      whatsapp: updated.whatsapp,
      email: updated.email,
      secretariat_email: updated.secretariat_email,
      support_email: updated.support_email,
      secretariat_hours: updated.secretariat_hours,
      vat_code: updated.vat_code,
      registration_fee_enabled: updated.registration_fee_enabled !== false,
      registration_fee_eur: updated.registration_fee_eur != null ? Number(updated.registration_fee_eur) : (current.registration_fee_eur != null ? Number(current.registration_fee_eur) : 0),
      academic_year: updated.academic_year || current.academic_year || getCurrentAcademicYear().academicYear,
      iban: updated.iban,
      bank_name: updated.bank_name,
      account_holder: updated.account_holder,
      socials: updated.socials || {},
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (profileError) {
    throw new Error(`Failed to update school profile: ${profileError.message}`);
  }

  return updated;
}

