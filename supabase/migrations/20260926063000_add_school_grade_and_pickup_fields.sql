-- ============================================================================
-- Migration: 20260926063000_add_school_grade_and_pickup_fields.sql
-- Purpose:
--   Add official fields from Atena School Enrollment Document (Allegato 2):
--   - student_school_and_grade (Scuola e Classe Frequentata)
--   - pickup_delegate_1_* & pickup_delegate_2_* (Delega al ritiro minori)
--   - self_exit_authorized_11plus (Uscita autonoma dagli 11 anni in su)
--   All optional (is_required_default = false), ready for custom form usage.
-- ============================================================================

INSERT INTO public.form_fields (
    key, label_it, label_en, placeholder_it, placeholder_en, field_type, target, is_system, is_required_default, sort_order, options
) VALUES
    -- School & Grade
    (
        'student_school_and_grade',
        'Scuola e Classe Frequentata',
        'School and Grade / Class Attended',
        'es. Scuola Media Pascoli, 2B',
        'e.g. Pascoli Middle School, 2B',
        'text',
        'student',
        true,
        false,
        145,
        '[]'::jsonb
    ),
    -- Allegato 2: Delega Ritiro Minori (Delegato 1)
    (
        'pickup_delegate_1_name',
        'Delegato Ritiro 1: Nome e Cognome',
        'Pickup Delegate 1: Full Name',
        'es. Maria Rossi',
        'e.g. Jane Doe',
        'text',
        'student',
        true,
        false,
        300,
        '[]'::jsonb
    ),
    (
        'pickup_delegate_1_relation',
        'Delegato Ritiro 1: Relazione con il Minore',
        'Pickup Delegate 1: Relation with Minor',
        'es. Nonno, Nonna, Babysitter, Zio',
        'e.g. Grandparent, Babysitter, Uncle',
        'text',
        'student',
        true,
        false,
        305,
        '[]'::jsonb
    ),
    (
        'pickup_delegate_1_phone',
        'Delegato Ritiro 1: Telefono / Cellulare',
        'Pickup Delegate 1: Phone',
        '+39 333 1234567',
        '+1 555 123456',
        'phone',
        'student',
        true,
        false,
        310,
        '[]'::jsonb
    ),
    (
        'pickup_delegate_1_doc',
        'Delegato Ritiro 1: Tipo e N. Documento d''Identità',
        'Pickup Delegate 1: ID Document Details',
        'es. C.I. n. CA1234567',
        'e.g. ID Card n. CA1234567',
        'text',
        'student',
        true,
        false,
        315,
        '[]'::jsonb
    ),
    -- Allegato 2: Delega Ritiro Minori (Delegato 2)
    (
        'pickup_delegate_2_name',
        'Delegato Ritiro 2: Nome e Cognome',
        'Pickup Delegate 2: Full Name',
        'es. Giuseppe Bianchi',
        'e.g. John Smith',
        'text',
        'student',
        true,
        false,
        320,
        '[]'::jsonb
    ),
    (
        'pickup_delegate_2_relation',
        'Delegato Ritiro 2: Relazione con il Minore',
        'Pickup Delegate 2: Relation with Minor',
        'es. Zio, Babysitter',
        'e.g. Uncle, Babysitter',
        'text',
        'student',
        true,
        false,
        325,
        '[]'::jsonb
    ),
    (
        'pickup_delegate_2_phone',
        'Delegato Ritiro 2: Telefono / Cellulare',
        'Pickup Delegate 2: Phone',
        '+39 333 9876543',
        '+1 555 987654',
        'phone',
        'student',
        true,
        false,
        330,
        '[]'::jsonb
    ),
    (
        'pickup_delegate_2_doc',
        'Delegato Ritiro 2: Tipo e N. Documento d''Identità',
        'Pickup Delegate 2: ID Document Details',
        'es. C.I. n. CB7654321',
        'e.g. ID Card n. CB7654321',
        'text',
        'student',
        true,
        false,
        335,
        '[]'::jsonb
    ),
    -- Allegato 2: Uscita Autonoma (11+ anni, Art. 19-bis D.L. 148/2017)
    (
        'self_exit_authorized_11plus',
        'Autorizzazione Uscita Autonoma (Studenti da 11 anni)',
        'Autonomous School Departure (Students 11+ years)',
        'Autorizzo il minore a lasciare autonomamente la scuola',
        'I authorize the minor to leave school autonomously',
        'checkbox',
        'student',
        true,
        false,
        340,
        '[]'::jsonb
    )
ON CONFLICT (key) DO UPDATE SET
    label_it = EXCLUDED.label_it,
    label_en = EXCLUDED.label_en,
    placeholder_it = EXCLUDED.placeholder_it,
    placeholder_en = EXCLUDED.placeholder_en,
    field_type = EXCLUDED.field_type,
    target = EXCLUDED.target,
    is_system = EXCLUDED.is_system,
    sort_order = EXCLUDED.sort_order;
