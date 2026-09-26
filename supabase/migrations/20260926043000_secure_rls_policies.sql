-- Migration: Secure RLS Policies across sensitive tables
-- 1. Enable RLS and add strict policies for public.documents
-- 2. Clean up overly permissive {public} full access policies on annual_memberships and lessons
-- 3. Ensure service_role and authenticated staff have precise role-based access

-- ==========================================
-- 1. DOCUMENTS TABLE
-- ==========================================
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access on documents" ON public.documents;
CREATE POLICY "Allow service_role full access on documents"
  ON public.documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin staff full access on documents" ON public.documents;
CREATE POLICY "Allow admin staff full access on documents"
  ON public.documents
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 5, 6)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 5, 6)
  ));

DROP POLICY IF EXISTS "Users can read own documents" ON public.documents;
CREATE POLICY "Users can read own documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (
    student_email = (auth.jwt() ->> 'email')
    OR student_name = (auth.jwt() ->> 'name')
  );

-- ==========================================
-- 2. ANNUAL MEMBERSHIPS TABLE
-- ==========================================
DROP POLICY IF EXISTS "Allow all access to annual_memberships" ON public.annual_memberships;

DROP POLICY IF EXISTS "Allow service_role full access on annual_memberships" ON public.annual_memberships;
CREATE POLICY "Allow service_role full access on annual_memberships"
  ON public.annual_memberships
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin full access on annual_memberships" ON public.annual_memberships;
CREATE POLICY "Allow admin full access on annual_memberships"
  ON public.annual_memberships
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 5, 6)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 5, 6)
  ));

-- ==========================================
-- 3. LESSONS TABLE
-- ==========================================
DROP POLICY IF EXISTS "Allow all access to lessons" ON public.lessons;

DROP POLICY IF EXISTS "Allow service_role full access on lessons" ON public.lessons;
CREATE POLICY "Allow service_role full access on lessons"
  ON public.lessons
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow staff full access on lessons" ON public.lessons;
CREATE POLICY "Allow staff full access on lessons"
  ON public.lessons
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 4, 5, 6)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 4, 5, 6)
  ));

-- ==========================================
-- 4. STRIPE WEBHOOK EVENTS TABLE
-- ==========================================
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access on stripe_webhook_events" ON public.stripe_webhook_events;
CREATE POLICY "Allow service_role full access on stripe_webhook_events"
  ON public.stripe_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin read on stripe_webhook_events" ON public.stripe_webhook_events;
CREATE POLICY "Allow admin read on stripe_webhook_events"
  ON public.stripe_webhook_events
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 5, 6)
  ));
