-- ==============================================================================
-- ATENA SCHOOL — CLEAN FULL DATABASE INITIALIZATION (PROD / DEV)
-- ==============================================================================

-- 1. CLEAN RESET PUBLIC SCHEMA (Wipes all half-created tables and creates clean schema)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- 2. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. USERS TABLE
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role SMALLINT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  phone TEXT,
  tax_code TEXT,
  sdi_code TEXT,
  pec_email TEXT,
  avatar_url TEXT,
  notes TEXT
);

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_tax_code ON public.users(tax_code);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- 4. COURSES TABLE
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category SMALLINT NOT NULL DEFAULT 1,
  status SMALLINT NOT NULL DEFAULT 1,
  sort_order INT DEFAULT 0,
  photo_url TEXT,
  description TEXT,
  teacher_id UUID,
  course_format SMALLINT NOT NULL DEFAULT 1,
  schedule_type SMALLINT NOT NULL DEFAULT 1,
  schedule_days INT[],
  start_time TEXT,
  end_time TEXT,
  lesson_duration_minutes INT,
  lessons_per_week INT,
  total_lessons INT,
  total_hours INT,
  billing_type SMALLINT NOT NULL DEFAULT 1,
  price NUMERIC(10, 2),
  subscription_price NUMERIC(10, 2),
  stripe_monthly_price_id TEXT
);

CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_category ON public.courses(category);

-- 5. TEACHERS TABLE
CREATE TABLE public.teachers (
  teacher_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  full_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  experience TEXT,
  photo_url TEXT,
  color_value BIGINT DEFAULT 4279899379,
  hire_date DATE DEFAULT CURRENT_DATE,
  birth_date DATE,
  contract_id UUID
);

CREATE INDEX idx_teachers_is_active ON public.teachers(is_active);
CREATE INDEX idx_teachers_hire_date ON public.teachers(hire_date);
CREATE INDEX idx_teachers_created_at ON public.teachers(created_at DESC);

-- Add teacher foreign key on courses
ALTER TABLE public.courses ADD CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES public.teachers(teacher_id) ON DELETE SET NULL;
CREATE INDEX idx_courses_teacher_id ON public.courses(teacher_id);

-- 6. COURSE_TEACHERS TABLE
CREATE TABLE public.course_teachers (
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(teacher_id) ON DELETE CASCADE,
  role SMALLINT NOT NULL DEFAULT 1,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  PRIMARY KEY (course_id, teacher_id)
);

CREATE INDEX idx_course_teachers_teacher_id ON public.course_teachers(teacher_id);

-- 7. STUDENTS TABLE
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  tax_code TEXT,
  birth_date DATE,
  photo_url TEXT,
  language_level SMALLINT NOT NULL DEFAULT 1,
  status SMALLINT NOT NULL DEFAULT 1,
  annual_fee_paid BOOLEAN NOT NULL DEFAULT false,
  annual_fee_paid_at TIMESTAMPTZ(6),
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  parent_id UUID,
  student_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  contract_id UUID
);

CREATE INDEX idx_students_parent_id ON public.students(parent_id);
CREATE INDEX idx_students_student_user_id ON public.students(student_user_id);
CREATE INDEX idx_students_tax_code ON public.students(tax_code);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_students_email ON public.students(email);
CREATE INDEX idx_students_created_at ON public.students(created_at DESC);

-- 8. GROUPS TABLE
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.teachers(teacher_id) ON DELETE SET NULL,
  room TEXT,
  max_students INT NOT NULL DEFAULT 8,
  status SMALLINT NOT NULL DEFAULT 1,
  start_date DATE,
  end_date DATE,
  schedule_days INT[],
  start_time TEXT,
  end_time TEXT,
  notes TEXT
);

CREATE INDEX idx_groups_course_id ON public.groups(course_id);
CREATE INDEX idx_groups_teacher_id ON public.groups(teacher_id);
CREATE INDEX idx_groups_status ON public.groups(status);

-- 9. PROMO_CODES TABLE
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type SMALLINT NOT NULL DEFAULT 1,
  discount_value NUMERIC(10, 2) NOT NULL,
  waive_registration_fee BOOLEAN NOT NULL DEFAULT false,
  max_uses INT,
  valid_from TIMESTAMPTZ(6),
  valid_until TIMESTAMPTZ(6),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_codes_is_active ON public.promo_codes(is_active);

-- 10. BOOKINGS TABLE
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  session_id TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE SET NULL,
  course_name TEXT,

  student_name TEXT NOT NULL,
  student_email TEXT,
  student_phone TEXT,
  student_tax_code TEXT,
  student_birth_date DATE,

  purchaser_name TEXT,
  purchaser_email TEXT,
  purchaser_phone TEXT,
  purchaser_tax_code TEXT,
  sdi_code TEXT,
  pec_email TEXT,

  booking_status SMALLINT NOT NULL DEFAULT 1,
  payment_status SMALLINT NOT NULL DEFAULT 1,
  scheduling_status SMALLINT NOT NULL DEFAULT 1,

  billing_scheme SMALLINT NOT NULL DEFAULT 1,
  payment_method SMALLINT NOT NULL DEFAULT 1,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  registration_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  promo_code TEXT,

  start_date DATE,
  schedule_days INT[],
  start_time TEXT,
  end_time TEXT,
  total_lessons_count INT,
  notes TEXT,

  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status SMALLINT,
  subscription_starts_at TIMESTAMPTZ(6),
  subscription_ends_at TIMESTAMPTZ(6),
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_student_id ON public.bookings(student_id);
CREATE INDEX idx_bookings_course_id ON public.bookings(course_id);
CREATE INDEX idx_bookings_group_id ON public.bookings(group_id);
CREATE INDEX idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX idx_bookings_booking_status ON public.bookings(booking_status);
CREATE INDEX idx_bookings_purchaser_tax_code ON public.bookings(purchaser_tax_code);
CREATE INDEX idx_bookings_student_tax_code ON public.bookings(student_tax_code);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at DESC);

-- 11. LESSONS TABLE
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) DEFAULT NOW(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.teachers(teacher_id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ(6) NOT NULL,
  ends_at TIMESTAMPTZ(6) NOT NULL,
  status INT NOT NULL DEFAULT 1,
  attendance INT NOT NULL DEFAULT 1,
  location_type INT NOT NULL DEFAULT 1,
  meeting_link TEXT,
  homework TEXT,
  teacher_notes TEXT,
  reschedule_count INT NOT NULL DEFAULT 0,
  rescheduled_at TIMESTAMPTZ(6)
);

CREATE INDEX idx_lessons_booking_id ON public.lessons(booking_id);
CREATE INDEX idx_lessons_group_id ON public.lessons(group_id);
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_student_id ON public.lessons(student_id);
CREATE INDEX idx_lessons_teacher_id ON public.lessons(teacher_id);
CREATE INDEX idx_lessons_starts_at ON public.lessons(starts_at);
CREATE INDEX idx_lessons_status ON public.lessons(status);

-- 12. PAYMENTS TABLE
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ(6) DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) DEFAULT NOW(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency SMALLINT NOT NULL DEFAULT 1,
  type SMALLINT NOT NULL DEFAULT 1,
  status SMALLINT NOT NULL DEFAULT 2,
  payment_method SMALLINT NOT NULL DEFAULT 1,
  provider SMALLINT NOT NULL DEFAULT 1,
  provider_transaction_id TEXT,
  notes TEXT
);

CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_student_id ON public.payments(student_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_type ON public.payments(type);

-- 13. ANNUAL_MEMBERSHIPS TABLE
CREATE TABLE public.annual_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  tax_code TEXT NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  membership_number TEXT,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 30.00,
  payment_method SMALLINT NOT NULL DEFAULT 1,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  status SMALLINT NOT NULL DEFAULT 1,
  academic_year TEXT NOT NULL DEFAULT '2026/2027',
  paid_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT uq_tax_academic_year UNIQUE (tax_code, academic_year)
);

CREATE INDEX idx_annual_memberships_student_id ON public.annual_memberships(student_id);
CREATE INDEX idx_annual_memberships_user_id ON public.annual_memberships(user_id);
CREATE INDEX idx_annual_memberships_academic_year ON public.annual_memberships(academic_year);

-- 14. GROUP_MEMBERS TABLE
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  status SMALLINT NOT NULL DEFAULT 1,
  CONSTRAINT uq_group_student UNIQUE (group_id, student_id)
);

CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_student_id ON public.group_members(student_id);

-- 15. ATTENDANCE_RECORDS TABLE
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  marked_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  status SMALLINT NOT NULL DEFAULT 1,
  marked_by TEXT,
  notes TEXT,
  CONSTRAINT uq_attendance_lesson_student UNIQUE (lesson_id, student_id)
);

CREATE INDEX idx_attendance_records_lesson_id ON public.attendance_records(lesson_id);
CREATE INDEX idx_attendance_records_student_id ON public.attendance_records(student_id);

-- 16. CONTACT_MESSAGES TABLE
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest TEXT,
  message TEXT NOT NULL,
  status SMALLINT NOT NULL DEFAULT 1,
  notes TEXT
);

CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);

-- 17. APP_SETTINGS TABLE
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- 18. SYSTEM LOGS & NOTIFICATIONS TABLES
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  channel SMALLINT NOT NULL,
  notification_type SMALLINT NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  request JSONB NOT NULL DEFAULT '{}'::jsonb,
  response JSONB,
  status SMALLINT NOT NULL
);

CREATE INDEX idx_notification_logs_created_at ON public.notification_logs(created_at DESC);
CREATE INDEX idx_notification_logs_recipient ON public.notification_logs(recipient);

CREATE TABLE public.landing_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  controller VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  http_method VARCHAR(10) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_role SMALLINT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request JSONB,
  response JSONB,
  status_code INT NOT NULL,
  session_id TEXT,
  guest_identifier TEXT
);

CREATE INDEX idx_landing_api_logs_created_at ON public.landing_api_logs(created_at DESC);

CREATE TABLE public.app_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  controller VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  http_method VARCHAR(10) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_role SMALLINT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request JSONB,
  response JSONB,
  status_code INT NOT NULL,
  session_id TEXT,
  guest_identifier TEXT
);

CREATE TABLE public.admin_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  controller VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  http_method VARCHAR(10) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_role SMALLINT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request JSONB,
  response JSONB,
  status_code INT NOT NULL
);

CREATE TABLE public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- 19. ACTIVE SERVICES VIEW
CREATE OR REPLACE VIEW public.active_services WITH (security_invoker = true) AS
SELECT 
  b.id AS booking_id,
  b.student_id,
  b.user_id,
  b.course_id,
  b.group_id,
  b.booking_status,
  b.payment_status,
  b.scheduling_status,
  b.amount_paid,
  b.registration_fee,
  b.created_at,
  b.start_date,
  b.start_time,
  b.end_time,
  b.schedule_days,
  c.name AS course_name,
  c.slug AS course_slug,
  c.category AS course_category,
  c.photo_url AS course_photo_url,
  c.total_lessons,
  s.first_name AS student_first_name,
  s.last_name AS student_last_name,
  s.tax_code AS student_tax_code,
  s.annual_fee_paid,
  g.name AS group_name
FROM public.bookings b
JOIN public.courses c ON b.course_id = c.id
LEFT JOIN public.students s ON b.student_id = s.id
LEFT JOIN public.groups g ON b.group_id = g.id
WHERE b.booking_status IN (1, 2)
  AND (b.payment_status = 2 OR b.payment_method = 1);

-- 20. PROMO CODE COUNTER SYNC TRIGGER
CREATE OR REPLACE FUNCTION public.trg_bookings_sync_promo_used_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    IF OLD.promo_code_id IS NOT NULL AND (OLD.booking_status IS NULL OR OLD.booking_status != 3) THEN
      UPDATE public.promo_codes
      SET used_count = GREATEST(0, used_count - 1),
          updated_at = NOW()
      WHERE id = OLD.promo_code_id;
    END IF;
    RETURN OLD;
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.booking_status IS NULL OR OLD.booking_status != 3) AND NEW.booking_status = 3 THEN
      IF NEW.promo_code_id IS NOT NULL THEN
        UPDATE public.promo_codes
        SET used_count = GREATEST(0, used_count - 1),
            updated_at = NOW()
        WHERE id = NEW.promo_code_id;
      END IF;
    ELSIF OLD.booking_status = 3 AND (NEW.booking_status IS NULL OR NEW.booking_status != 3) THEN
      IF NEW.promo_code_id IS NOT NULL THEN
        UPDATE public.promo_codes
        SET used_count = used_count + 1,
            updated_at = NOW()
        WHERE id = NEW.promo_code_id;
      END IF;
    ELSIF (OLD.promo_code_id IS DISTINCT FROM NEW.promo_code_id) THEN
      IF OLD.promo_code_id IS NOT NULL THEN
        UPDATE public.promo_codes
        SET used_count = GREATEST(0, used_count - 1),
            updated_at = NOW()
        WHERE id = OLD.promo_code_id;
      END IF;
      IF NEW.promo_code_id IS NOT NULL THEN
        UPDATE public.promo_codes
        SET used_count = used_count + 1,
            updated_at = NOW()
        WHERE id = NEW.promo_code_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bookings_sync_promo
AFTER DELETE OR UPDATE OF booking_status, promo_code_id ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.trg_bookings_sync_promo_used_count();

-- 21. SEED INITIAL SCHOOL PROFILE SETTINGS
INSERT INTO public.app_settings (key, value, description)
VALUES 
(
  'school_profile',
  '{
    "name": "Atena School",
    "legal_name": "Atena School S.r.l.s.",
    "tagline": "civitatis ornamento",
    "address": "Via Matteotti 11",
    "city": "Cittanova",
    "cap": "89022",
    "province": "RC",
    "country": "Italia",
    "phone": "+39 375 605 2362",
    "landline": "0966 447052",
    "whatsapp": "+39 375 605 2362",
    "email": "info@atenaschool.com",
    "secretariat_email": "atenaschool20@gmail.com",
    "support_email": "supporto@atenaschool.com",
    "website": "https://atenaschool.com",
    "vat_code": "P.IVA/C.F. 03321620803",
    "secretariat_hours": "Martedì e Giovedì dalle ore 15:00 alle ore 18:00",
    "registration_fee_eur": 30,
    "academic_year": "2026/2027",
    "iban": "IT60X0542811101000000123456",
    "bank_name": "Banca Popolare",
    "account_holder": "Atena School S.r.l.s.",
    "logo_url": "/assets/logo.webp",
    "maps_url": "https://maps.app.goo.gl/4Vmvrk9hxz5EC5gM7",
    "founders": "ELISABETTA & MARIA, FONDATRICI",
    "socials": {
      "instagram": "https://instagram.com/atenaschool",
      "facebook": "https://facebook.com/atenaschool",
      "linkedin": "https://linkedin.com/company/atenaschool"
    }
  }'::jsonb,
  'Official school profile, address, contact and banking details'
),
(
  'stripe_enabled',
  'true'::jsonb,
  'Enable or disable Stripe online payments gateway'
),
(
  'subscriptions_enabled',
  'false'::jsonb,
  'Enable or disable monthly course subscriptions'
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = NOW();

-- 22. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 23. RLS POLICIES FOR PUBLIC READ ACCESS
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public read teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Public read course_teachers" ON public.course_teachers FOR SELECT USING (true);
CREATE POLICY "Public read app_settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Public insert contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read documents" ON public.documents FOR SELECT USING (true);

-- 24. GRANT FULL PERMISSIONS TO ROLES
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

