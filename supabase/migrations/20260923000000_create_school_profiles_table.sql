-- 1. Create table school_profiles
CREATE TABLE IF NOT EXISTS public.school_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_default BOOLEAN NOT NULL DEFAULT true,
  name VARCHAR(255) NOT NULL DEFAULT 'Atena School',
  legal_name VARCHAR(255),
  tagline VARCHAR(255),
  founders VARCHAR(255),
  logo_url TEXT,
  website VARCHAR(255),
  site_url VARCHAR(255),
  app_url VARCHAR(255),
  admin_url VARCHAR(255),
  address VARCHAR(255),
  city VARCHAR(100),
  cap VARCHAR(20),
  province VARCHAR(10),
  country VARCHAR(100) DEFAULT 'Italia',
  maps_url TEXT,
  phone VARCHAR(50),
  landline VARCHAR(50),
  whatsapp VARCHAR(50),
  email VARCHAR(255),
  secretariat_email VARCHAR(255),
  support_email VARCHAR(255),
  secretariat_hours TEXT,
  vat_code VARCHAR(100),
  registration_fee_enabled BOOLEAN NOT NULL DEFAULT true,
  registration_fee_eur NUMERIC(10,2) NOT NULL DEFAULT 30.00,
  academic_year VARCHAR(50) NOT NULL DEFAULT '2026/2027',
  iban VARCHAR(100),
  bank_name VARCHAR(100),
  account_holder VARCHAR(255),
  socials JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Migrate existing data from app_settings ('school_profile') if exists
DO $$
DECLARE
  profile_val JSONB;
BEGIN
  SELECT value INTO profile_val FROM public.app_settings WHERE key = 'school_profile';
  
  IF profile_val IS NOT NULL THEN
    INSERT INTO public.school_profiles (
      id, is_default, name, legal_name, tagline, founders, logo_url, website,
      site_url, app_url, admin_url, address, city, cap, province, country,
      maps_url, phone, landline, whatsapp, email, secretariat_email, support_email,
      secretariat_hours, vat_code, registration_fee_enabled, registration_fee_eur,
      academic_year, iban, bank_name, account_holder, socials, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      true,
      COALESCE(profile_val->>'name', 'Atena School'),
      profile_val->>'legal_name',
      profile_val->>'tagline',
      profile_val->>'founders',
      profile_val->>'logo_url',
      profile_val->>'website',
      profile_val->>'site_url',
      profile_val->>'app_url',
      profile_val->>'admin_url',
      profile_val->>'address',
      profile_val->>'city',
      profile_val->>'cap',
      profile_val->>'province',
      COALESCE(profile_val->>'country', 'Italia'),
      profile_val->>'maps_url',
      profile_val->>'phone',
      profile_val->>'landline',
      profile_val->>'whatsapp',
      profile_val->>'email',
      profile_val->>'secretariat_email',
      profile_val->>'support_email',
      profile_val->>'secretariat_hours',
      profile_val->>'vat_code',
      COALESCE((profile_val->>'registration_fee_enabled')::boolean, true),
      COALESCE((profile_val->>'registration_fee_eur')::numeric, 30.00),
      COALESCE(profile_val->>'academic_year', '2026/2027'),
      profile_val->>'iban',
      profile_val->>'bank_name',
      profile_val->>'account_holder',
      COALESCE(profile_val->'socials', '{}'::jsonb),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      legal_name = EXCLUDED.legal_name,
      tagline = EXCLUDED.tagline,
      founders = EXCLUDED.founders,
      logo_url = EXCLUDED.logo_url,
      website = EXCLUDED.website,
      site_url = EXCLUDED.site_url,
      app_url = EXCLUDED.app_url,
      admin_url = EXCLUDED.admin_url,
      address = EXCLUDED.address,
      city = EXCLUDED.city,
      cap = EXCLUDED.cap,
      province = EXCLUDED.province,
      country = EXCLUDED.country,
      maps_url = EXCLUDED.maps_url,
      phone = EXCLUDED.phone,
      landline = EXCLUDED.landline,
      whatsapp = EXCLUDED.whatsapp,
      email = EXCLUDED.email,
      secretariat_email = EXCLUDED.secretariat_email,
      support_email = EXCLUDED.support_email,
      secretariat_hours = EXCLUDED.secretariat_hours,
      vat_code = EXCLUDED.vat_code,
      registration_fee_enabled = EXCLUDED.registration_fee_enabled,
      registration_fee_eur = EXCLUDED.registration_fee_eur,
      academic_year = EXCLUDED.academic_year,
      iban = EXCLUDED.iban,
      bank_name = EXCLUDED.bank_name,
      account_holder = EXCLUDED.account_holder,
      socials = EXCLUDED.socials,
      updated_at = now();
  ELSE
    -- If no profile exists, insert the default record
    INSERT INTO public.school_profiles (
      id, is_default, name, legal_name, tagline, founders, logo_url, website,
      site_url, app_url, admin_url, address, city, cap, province, country,
      maps_url, phone, landline, whatsapp, email, secretariat_email, support_email,
      secretariat_hours, vat_code, registration_fee_enabled, registration_fee_eur,
      academic_year, iban, bank_name, account_holder, socials
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      true,
      'Atena School',
      'Atena School S.r.l.s.',
      'civitatis ornamento',
      'ELISABETTA & MARIA, FONDATRICI',
      '/assets/logo.webp',
      'https://atenaschool.com',
      'https://atenaschool.com',
      'https://app.atenaschool.com',
      'https://atena-school-admin.vercel.app',
      'Via Matteotti 11',
      'Cittanova',
      '89022',
      'RC',
      'Italia',
      'https://maps.app.goo.gl/4Vmvrk9hxz5EC5gM7',
      '+39 375 605 2362',
      '0966 447052',
      '+39 375 605 2362',
      'info@atenaschool.com',
      'atenaschool20@gmail.com',
      'supporto@atenaschool.com',
      'Martedì e Giovedì dalle ore 15:00 alle ore 18:00',
      'P.IVA/C.F. 03321620803',
      true,
      30.00,
      '2026/2027',
      'IT60X0542811101000000123456',
      'Banca Popolare',
      'Atena School S.r.l.s.',
      '{"instagram":"https://instagram.com/atenaschool","facebook":"https://facebook.com/atenaschool","linkedin":"https://linkedin.com/company/atenaschool"}'::jsonb
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 3. Permissions & RLS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.school_profiles TO anon, authenticated, service_role, postgres;

ALTER TABLE public.school_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view school profiles" ON public.school_profiles;
CREATE POLICY "Public can view school profiles" ON public.school_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated and service role can manage school profiles" ON public.school_profiles;
CREATE POLICY "Authenticated and service role can manage school profiles" ON public.school_profiles FOR ALL USING (true) WITH CHECK (true);
