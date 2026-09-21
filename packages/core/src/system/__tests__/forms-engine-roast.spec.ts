import { describe, it, expect } from 'vitest';
import {
  resolveActiveFormTemplate,
  getActiveFormFields,
  DEFAULT_BOOKING_FORM_TEMPLATE,
} from '../form-resolver.service';
import {
  FormType,
  FormFieldType,
  FormFieldTarget,
  FormTemplate,
  FormFieldConfig,
  SchoolProfile,
} from '@atena/api-types';
import { getFieldValue } from '../../notifications/trigger-matcher';

describe('🔥 Forms Engine & Quota Associativa — Hardcore Roast Test Suite', () => {
  // ==========================================================================
  // 1. FORM RESOLVER CASCADE & PRIORITIZATION
  // ==========================================================================
  describe('1. Form Resolver Cascade & Prioritization Roast', () => {
    const mockTemplates: FormTemplate[] = [
      {
        id: 'form-global-default',
        title: 'Global Default Booking Form',
        form_type: FormType.BOOKING,
        is_default: true,
        is_active: true,
        fields_config: [
          {
            id: 'f-default-1',
            key: 'referral_source',
            label: 'Come ci hai conosciuto?',
            field_type: FormFieldType.SELECT,
            target: FormFieldTarget.BOOKING,
            is_required: true,
            is_enabled: true,
            sort_order: 1,
            options: ['Instagram', 'Google', 'Passaparola'],
          },
        ],
      },
      {
        id: 'form-cat-languages',
        title: 'Languages Category Form',
        form_type: FormType.BOOKING,
        is_default: false,
        is_active: true,
        category_slug: 'lingue',
        fields_config: [
          {
            id: 'f-lang-1',
            key: 'current_level',
            label: 'Livello Attuale',
            field_type: FormFieldType.SELECT,
            target: FormFieldTarget.STUDENT,
            is_required: true,
            is_enabled: true,
            sort_order: 1,
            options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
          },
        ],
      },
      {
        id: 'form-course-cambridge-c2',
        title: 'Cambridge C2 Mastery Form',
        form_type: FormType.BOOKING,
        is_default: false,
        is_active: true,
        course_id: 'course-cambridge-c2',
        category_slug: 'lingue',
        fields_config: [
          {
            id: 'f-cambridge-1',
            key: 'target_exam_date',
            label: 'Data Sessione Esame Desiderata',
            field_type: FormFieldType.DATE,
            target: FormFieldTarget.STUDENT,
            is_required: true,
            is_enabled: true,
            sort_order: 1,
          },
        ],
      },
      {
        id: 'form-inactive-override',
        title: 'Inactive Override Form',
        form_type: FormType.BOOKING,
        is_default: false,
        is_active: false, // INACTIVE
        course_id: 'course-inactive-spec',
        fields_config: [],
      },
    ];

    it('P0: Exact course_id match has absolute priority over category and default', () => {
      const resolved = resolveActiveFormTemplate(mockTemplates, {
        form_type: FormType.BOOKING,
        course_id: 'course-cambridge-c2',
        category_slug: 'lingue',
      });
      expect(resolved.id).toBe('form-course-cambridge-c2');
      expect(resolved.fields_config[0].key).toBe('target_exam_date');
    });

    it('P1: Category match is chosen when course_id has no specific template', () => {
      const resolved = resolveActiveFormTemplate(mockTemplates, {
        form_type: FormType.BOOKING,
        course_id: 'course-spanish-base',
        category_slug: 'lingue',
      });
      expect(resolved.id).toBe('form-cat-languages');
      expect(resolved.fields_config[0].key).toBe('current_level');
    });

    it('P2: Global default is chosen when neither course_id nor category_slug matches', () => {
      const resolved = resolveActiveFormTemplate(mockTemplates, {
        form_type: FormType.BOOKING,
        course_id: 'course-robotics-1',
        category_slug: 'tecnologia',
      });
      expect(resolved.id).toBe('form-global-default');
      expect(resolved.fields_config[0].key).toBe('referral_source');
    });

    it('Ignores inactive templates even if course_id matches explicitly', () => {
      const resolved = resolveActiveFormTemplate(mockTemplates, {
        form_type: FormType.BOOKING,
        course_id: 'course-inactive-spec',
      });
      expect(resolved.id).toBe('form-global-default');
    });

    it('Zero-downtime fallback to DEFAULT_BOOKING_FORM_TEMPLATE when template list is empty or null', () => {
      const resolvedEmpty = resolveActiveFormTemplate([], { form_type: FormType.BOOKING });
      expect(resolvedEmpty.id).toBe(DEFAULT_BOOKING_FORM_TEMPLATE.id);
      expect(resolvedEmpty.is_default).toBe(true);

      const resolvedNull = resolveActiveFormTemplate(null as unknown as FormTemplate[], {
        form_type: FormType.BOOKING,
      });
      expect(resolvedNull.id).toBe(DEFAULT_BOOKING_FORM_TEMPLATE.id);
    });
  });

  // ==========================================================================
  // 2. FIELD FILTERING, ENABLING, AND SORTING
  // ==========================================================================
  describe('2. Field Filtering, Enabling & Sorting Roast', () => {
    it('filters out disabled fields and preserves strict ascending sort_order', () => {
      const template: FormTemplate = {
        id: 'test-filter',
        title: 'Filter Test',
        form_type: FormType.BOOKING,
        is_default: false,
        is_active: true,
        fields_config: [
          {
            id: 'f-3',
            key: 'field_c',
            label: 'Field C',
            field_type: FormFieldType.TEXT,
            target: FormFieldTarget.BOOKING,
            is_required: false,
            is_enabled: true,
            sort_order: 30,
          },
          {
            id: 'f-disabled',
            key: 'field_hidden',
            label: 'Hidden Field',
            field_type: FormFieldType.TEXT,
            target: FormFieldTarget.BOOKING,
            is_required: false,
            is_enabled: false, // Disabled
            sort_order: 5,
          },
          {
            id: 'f-1',
            key: 'field_a',
            label: 'Field A',
            field_type: FormFieldType.TEXT,
            target: FormFieldTarget.BOOKING,
            is_required: true,
            is_enabled: true,
            sort_order: 10,
          },
          {
            id: 'f-2',
            key: 'field_b',
            label: 'Field B',
            field_type: FormFieldType.TEXT,
            target: FormFieldTarget.BOOKING,
            is_required: false,
            is_enabled: true,
            sort_order: 20,
          },
        ],
      };

      const activeFields = getActiveFormFields(template);
      expect(activeFields.length).toBe(3);
      expect(activeFields.map((f) => f.key)).toEqual(['field_a', 'field_b', 'field_c']);
    });
  });

  // ==========================================================================
  // 3. CUSTOM FIELD VALIDATION & SCHEMA ROAST
  // ==========================================================================
  describe('3. Dynamic Custom Fields Submission & Validation Roast', () => {
    function validateCustomFields(
      fields: FormFieldConfig[],
      values: Record<string, any>
    ): { valid: boolean; errors: Record<string, string>; sanitized: Record<string, any> } {
      const errors: Record<string, string> = {};
      const sanitized: Record<string, any> = {};

      for (const field of fields) {
        if (!field.is_enabled) continue;

        // Security: Block dangerous keys
        if (field.key === '__proto__' || field.key === 'constructor' || field.key === 'prototype') {
          continue;
        }

        const val = values[field.key];
        const isBlank = val === undefined || val === null || val === '';

        if (field.is_required && isBlank) {
          errors[field.key] = `Il campo ${field.label} è obbligatorio`;
          continue;
        }

        if (!isBlank) {
          // Select validation against whitelist
          if (field.field_type === FormFieldType.SELECT || field.field_type === FormFieldType.RADIO) {
            if (field.options && !field.options.includes(String(val))) {
              errors[field.key] = `Valore non valido per ${field.label}`;
              continue;
            }
          }

          // Number validation
          if (field.field_type === FormFieldType.NUMBER) {
            const num = Number(val);
            if (isNaN(num)) {
              errors[field.key] = `${field.label} deve essere un numero valido`;
              continue;
            }
            sanitized[field.key] = num;
            continue;
          }

          sanitized[field.key] = val;
        }
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors,
        sanitized,
      };
    }

    const testFields: FormFieldConfig[] = [
      {
        id: 'f1',
        key: 'italian_level',
        label: 'Livello di Italiano',
        field_type: FormFieldType.SELECT,
        target: FormFieldTarget.STUDENT,
        is_required: true,
        is_enabled: true,
        sort_order: 1,
        options: ['Principiante', 'Intermedio', 'Avanzato'],
      },
      {
        id: 'f2',
        key: 'study_hours_per_week',
        label: 'Ore di studio settimanali',
        field_type: FormFieldType.NUMBER,
        target: FormFieldTarget.STUDENT,
        is_required: false,
        is_enabled: true,
        sort_order: 2,
      },
      {
        id: 'f3',
        key: 'special_requests',
        label: 'Richieste particolari',
        field_type: FormFieldType.TEXTAREA,
        target: FormFieldTarget.BOOKING,
        is_required: false,
        is_enabled: true,
        sort_order: 3,
      },
    ];

    it('accepts valid custom field payloads matching schemas', () => {
      const res = validateCustomFields(testFields, {
        italian_level: 'Intermedio',
        study_hours_per_week: '5',
        special_requests: 'Vorrei materiale in PDF',
      });

      expect(res.valid).toBe(true);
      expect(res.sanitized.italian_level).toBe('Intermedio');
      expect(res.sanitized.study_hours_per_week).toBe(5);
    });

    it('rejects submission when a required custom field is missing or empty', () => {
      const res = validateCustomFields(testFields, {
        study_hours_per_week: 10,
      });

      expect(res.valid).toBe(false);
      expect(res.errors.italian_level).toBeDefined();
    });

    it('rejects option injection when value is outside select whitelist', () => {
      const res = validateCustomFields(testFields, {
        italian_level: '<script>alert(1)</script>',
      });

      expect(res.valid).toBe(false);
      expect(res.errors.italian_level).toBe('Valore non valido per Livello di Italiano');
    });

    it('safely skips prototype pollution payload keys', () => {
      const maliciousFields: FormFieldConfig[] = [
        {
          id: 'bad',
          key: '__proto__',
          label: 'Exploit',
          field_type: FormFieldType.TEXT,
          target: FormFieldTarget.BOOKING,
          is_required: false,
          is_enabled: true,
          sort_order: 1,
        },
      ];

      const res = validateCustomFields(maliciousFields, {
        __proto__: { isAdmin: true },
      });

      expect(Object.prototype.hasOwnProperty.call(res.sanitized, '__proto__')).toBe(false);
      expect(({} as any).isAdmin).toBeUndefined();
    });
  });

  // ==========================================================================
  // 4. ITALIAN QUOTA ASSOCIATIVA (€30) CALCULATION & TOGGLE
  // ==========================================================================
  describe('4. Italian Quota Associativa (€30) Toggle & Calculation Roast', () => {
    function computeEffectiveFee(
      schoolProfile: Partial<SchoolProfile>,
      studentFeeStatus: { annualFeePaid: boolean },
      promoOverride?: { waiveRegistrationFee?: boolean }
    ): { feeAmount: number; isCharged: boolean } {
      const isFeeGloballyEnabled = schoolProfile.registration_fee_enabled !== false;
      const baseFee = isFeeGloballyEnabled ? (schoolProfile.registration_fee_eur ?? 30) : 0;

      if (!isFeeGloballyEnabled || baseFee === 0) {
        return { feeAmount: 0, isCharged: false };
      }

      if (promoOverride?.waiveRegistrationFee) {
        return { feeAmount: 0, isCharged: false };
      }

      if (studentFeeStatus.annualFeePaid) {
        return { feeAmount: 0, isCharged: false };
      }

      return { feeAmount: baseFee, isCharged: true };
    }

    it('charges €30 when fee is globally enabled and student has not paid annual membership', () => {
      const school: Partial<SchoolProfile> = {
        registration_fee_enabled: true,
        registration_fee_eur: 30,
      };
      const res = computeEffectiveFee(school, { annualFeePaid: false });
      expect(res.feeAmount).toBe(30);
      expect(res.isCharged).toBe(true);
    });

    it('returns €0 fee when school administrator disables registration_fee_enabled in Admin', () => {
      const school: Partial<SchoolProfile> = {
        registration_fee_enabled: false, // MASTER SWITCH OFF
        registration_fee_eur: 30,
      };
      const res = computeEffectiveFee(school, { annualFeePaid: false });
      expect(res.feeAmount).toBe(0);
      expect(res.isCharged).toBe(false);
    });

    it('supports custom amount configured in Admin (e.g. €50 or €20)', () => {
      const school: Partial<SchoolProfile> = {
        registration_fee_enabled: true,
        registration_fee_eur: 50,
      };
      const res = computeEffectiveFee(school, { annualFeePaid: false });
      expect(res.feeAmount).toBe(50);
      expect(res.isCharged).toBe(true);
    });

    it('returns €0 fee when student already paid membership in the current academic year', () => {
      const school: Partial<SchoolProfile> = {
        registration_fee_enabled: true,
        registration_fee_eur: 30,
      };
      const res = computeEffectiveFee(school, { annualFeePaid: true });
      expect(res.feeAmount).toBe(0);
      expect(res.isCharged).toBe(false);
    });

    it('waives fee when promo code with waiveRegistrationFee=true is applied', () => {
      const school: Partial<SchoolProfile> = {
        registration_fee_enabled: true,
        registration_fee_eur: 30,
      };
      const res = computeEffectiveFee(school, { annualFeePaid: false }, { waiveRegistrationFee: true });
      expect(res.feeAmount).toBe(0);
      expect(res.isCharged).toBe(false);
    });

    it('isForChild=true targets student CF: Parent has not paid, Child HAS paid -> €0 fee', () => {
      const parentFeeStatus = { annualFeePaid: false };
      const childFeeStatus = { annualFeePaid: true };
      const school: Partial<SchoolProfile> = { registration_fee_enabled: true, registration_fee_eur: 30 };

      // Strictly evaluate child status
      const res = computeEffectiveFee(school, childFeeStatus);
      expect(res.feeAmount).toBe(0);
      expect(res.isCharged).toBe(false);
    });

    it('isForChild=true targets student CF: Parent HAS paid, Child has NOT paid -> €30 fee due', () => {
      const parentFeeStatus = { annualFeePaid: true };
      const childFeeStatus = { annualFeePaid: false };
      const school: Partial<SchoolProfile> = { registration_fee_enabled: true, registration_fee_eur: 30 };

      // Strictly evaluate child status
      const res = computeEffectiveFee(school, childFeeStatus);
      expect(res.feeAmount).toBe(30);
      expect(res.isCharged).toBe(true);
    });
  });

  // ==========================================================================
  // 5. NOTIFICATION TRIGGER VARIABLE RESOLUTION FROM CUSTOM FIELDS
  // ==========================================================================
  describe('5. Notification Trigger Engine Variable Resolution Roast', () => {
    const mockPayload = {
      booking_id: 'b-999',
      course_name: 'Corso di Spagnolo Avanzato',
      student_name: 'Giulia Bianchi',
      amount_paid: '250.00',
      custom_fields: {
        study_level: 'B2.1',
        dietary_preference: 'Vegetariana',
        learning_goal: 'Certificazione DELE',
      },
    };

    it('resolves {{study_level}} directly from custom_fields', () => {
      const val = getFieldValue(mockPayload, 'study_level');
      expect(val).toBe('B2.1');
    });

    it('resolves {{custom.learning_goal}} with namespace prefix', () => {
      const val = getFieldValue(mockPayload, 'custom.learning_goal');
      expect(val).toBe('Certificazione DELE');
    });

    it('resolves {{custom_fields.dietary_preference}} with direct path', () => {
      const val = getFieldValue(mockPayload, 'custom_fields.dietary_preference');
      expect(val).toBe('Vegetariana');
    });

    it('returns undefined gracefully when variable is missing without throwing error', () => {
      const val = getFieldValue(mockPayload, 'non_existent_custom_var');
      expect(val).toBeUndefined();
    });
  });
});
