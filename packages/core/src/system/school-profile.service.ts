import { AppSettingKey, SchoolProfile, DEFAULT_SCHOOL_PROFILE } from '@atena/api-types';
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
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', AppSettingKey.SCHOOL_PROFILE)
      .maybeSingle();

    if (error || !data || !data.value) {
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

    const val = data.value as Partial<SchoolProfile>;
    return {
      ...DEFAULT_SCHOOL_PROFILE,
      ...val,
      site_url: isDev ? 'http://localhost:3000' : (val.site_url || DEFAULT_SCHOOL_PROFILE.site_url),
      app_url: isDev ? 'http://localhost:3002' : (val.app_url || DEFAULT_SCHOOL_PROFILE.app_url),
      admin_url: isDev ? 'http://localhost:3001' : (val.admin_url || DEFAULT_SCHOOL_PROFILE.admin_url),
      address: cleanStreetAddress(val.address || DEFAULT_SCHOOL_PROFILE.address),
      socials: {
        ...DEFAULT_SCHOOL_PROFILE.socials,
        ...(val.socials || {}),
      },
    };
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

  const { error } = await supabase
    .from('app_settings')
    .upsert({
      key: AppSettingKey.SCHOOL_PROFILE,
      value: updated,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });

  if (error) {
    throw new Error(`Failed to update school profile: ${error.message}`);
  }

  return updated;
}

