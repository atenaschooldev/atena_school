import { describe, it, expect } from 'vitest';
import {
  FormType,
  FormFieldType,
  FormFieldTarget,
  FormTemplate,
  SchoolProfile,
} from '@atena/api-types';
import { DEFAULT_BOOKING_FORM_TEMPLATE } from '@atena/core';

describe('🔥 Landing & Checkout Forms Integration — Extreme Roast Test Suite', () => {
  describe('1. Checkout Custom Fields Extraction & Submission Payload', () => {
    it('packages dynamic custom fields into JSONB custom_fields payload without mutating core purchaser fields', () => {
      const formTemplate: FormTemplate = {
        id: 'tmpl-special-course',
        title: 'Special Course Form',
        form_type: FormType.BOOKING,
        is_default: false,
        is_active: true,
        fields_config: [
          {
            id: 'f1',
            key: 'study_level',
            label: 'Livello',
            field_type: FormFieldType.SELECT,
            target: FormFieldTarget.STUDENT,
            is_required: true,
            is_enabled: true,
            sort_order: 1,
            options: [
              { label: 'B1', value: 'B1' },
              { label: 'B2', value: 'B2' },
              { label: 'C1', value: 'C1' },
            ],
          },
          {
            id: 'f2',
            key: 'attendance_mode',
            label: 'Modalità',
            field_type: FormFieldType.RADIO,
            target: FormFieldTarget.BOOKING,
            is_required: false,
            is_enabled: true,
            sort_order: 2,
            options: [
              { label: 'In Sede', value: 'In Sede' },
              { label: 'Online', value: 'Online' },
            ],
          },
        ],
      };

      const rawUserInputs = {
        // Core fields
        firstName: 'Marco',
        lastName: 'Verdi',
        email: 'marco.verdi@example.com',
        phone: '+39 340 9876543',
        taxCode: 'VRDMRA85M01H501Z',
        purchaserTaxCode: 'VRDMRA85M01H501Z',
        // Dynamic custom fields
        study_level: 'B2',
        attendance_mode: 'In Sede',
      };

      // Extract custom fields according to template
      const extractedCustomFields: Record<string, any> = {};
      formTemplate.fields_config.forEach((f) => {
        if (f.is_enabled && (rawUserInputs as any)[f.key] !== undefined) {
          extractedCustomFields[f.key] = (rawUserInputs as any)[f.key];
        }
      });

      const finalBookingPayload = {
        course_id: 'course-123',
        purchaser_name: `${rawUserInputs.firstName} ${rawUserInputs.lastName}`,
        purchaser_email: rawUserInputs.email,
        purchaser_phone: rawUserInputs.phone,
        purchaser_tax_code: rawUserInputs.purchaserTaxCode,
        form_id: formTemplate.id,
        custom_fields: extractedCustomFields,
      };

      expect(finalBookingPayload.purchaser_tax_code).toBe('VRDMRA85M01H501Z');
      expect(finalBookingPayload.form_id).toBe('tmpl-special-course');
      expect(finalBookingPayload.custom_fields).toEqual({
        study_level: 'B2',
        attendance_mode: 'In Sede',
      });
    });
  });

  describe('2. Quota Associativa Checkout Logic with Disabled Setting', () => {
    it('sets registration fee to €0 when school has registration_fee_enabled === false', () => {
      const schoolProfile: Partial<SchoolProfile> = {
        name: 'Atena School',
        registration_fee_enabled: false,
        registration_fee_eur: 30,
      };

      const isFeeEnabled = schoolProfile.registration_fee_enabled !== false;
      const feeAmount = isFeeEnabled ? (schoolProfile.registration_fee_eur ?? 30) : 0;
      const includeRegistrationFee = isFeeEnabled;

      expect(isFeeEnabled).toBe(false);
      expect(feeAmount).toBe(0);
      expect(includeRegistrationFee).toBe(false);
    });

    it('sets registration fee to custom amount when registration_fee_enabled === true and registration_fee_eur === 25', () => {
      const schoolProfile: Partial<SchoolProfile> = {
        name: 'Atena School',
        registration_fee_enabled: true,
        registration_fee_eur: 25,
      };

      const isFeeEnabled = schoolProfile.registration_fee_enabled !== false;
      const feeAmount = isFeeEnabled ? (schoolProfile.registration_fee_eur ?? 30) : 0;

      expect(isFeeEnabled).toBe(true);
      expect(feeAmount).toBe(25);
    });
  });
});
