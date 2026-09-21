import { describe, it, expect } from 'vitest';
import {
  resolveActiveFormTemplate,
  getActiveFormFields,
  DEFAULT_BOOKING_FORM_TEMPLATE,
} from './form-resolver.service';
import { FormType, FormFieldType, FormFieldTarget, FormTemplate } from '@atena/api-types';

describe('FormResolverService', () => {
  const mockTemplates: FormTemplate[] = [
    {
      id: 'default-booking',
      title: 'Global Default Booking',
      form_type: FormType.BOOKING,
      is_default: true,
      is_active: true,
      fields_config: [
        {
          id: 'f1',
          key: 'level',
          label: 'Level',
          field_type: FormFieldType.TEXT,
          target: FormFieldTarget.STUDENT,
          is_required: true,
          is_enabled: true,
          sort_order: 1,
        },
      ],
    },
    {
      id: 'category-kids',
      title: 'Kids Category Form',
      form_type: FormType.BOOKING,
      is_default: false,
      is_active: true,
      category_slug: 'kids',
      fields_config: [
        {
          id: 'f2',
          key: 'school_name',
          label: 'School Name',
          field_type: FormFieldType.TEXT,
          target: FormFieldTarget.STUDENT,
          is_required: true,
          is_enabled: true,
          sort_order: 1,
        },
      ],
    },
    {
      id: 'course-c2',
      title: 'C2 Specific Form',
      form_type: FormType.BOOKING,
      is_default: false,
      is_active: true,
      course_id: 'course-123',
      category_slug: 'languages',
      fields_config: [
        {
          id: 'f3',
          key: 'exam_target',
          label: 'Exam Target',
          field_type: FormFieldType.SELECT,
          target: FormFieldTarget.STUDENT,
          is_required: true,
          is_enabled: true,
          sort_order: 1,
        },
      ],
    },
  ];

  it('resolves course-specific form with highest priority', () => {
    const resolved = resolveActiveFormTemplate(mockTemplates, {
      form_type: FormType.BOOKING,
      course_id: 'course-123',
      category_slug: 'kids',
    });
    expect(resolved.id).toBe('course-c2');
  });

  it('resolves category form when no course-specific match exists', () => {
    const resolved = resolveActiveFormTemplate(mockTemplates, {
      form_type: FormType.BOOKING,
      course_id: 'other-course-456',
      category_slug: 'kids',
    });
    expect(resolved.id).toBe('category-kids');
  });

  it('resolves default form when neither course nor category matches', () => {
    const resolved = resolveActiveFormTemplate(mockTemplates, {
      form_type: FormType.BOOKING,
      course_id: 'other-course-456',
      category_slug: 'adults',
    });
    expect(resolved.id).toBe('default-booking');
  });

  it('falls back to DEFAULT_BOOKING_FORM_TEMPLATE when list is empty', () => {
    const resolved = resolveActiveFormTemplate([], {
      form_type: FormType.BOOKING,
    });
    expect(resolved.id).toBe(DEFAULT_BOOKING_FORM_TEMPLATE.id);
  });

  it('filters out disabled fields and sorts active fields', () => {
    const fields = getActiveFormFields({
      id: 'test',
      title: 'Test',
      form_type: FormType.BOOKING,
      is_default: true,
      is_active: true,
      fields_config: [
        {
          id: '2',
          key: 'two',
          label: 'Two',
          field_type: FormFieldType.TEXT,
          target: FormFieldTarget.BOOKING,
          is_required: false,
          is_enabled: true,
          sort_order: 2,
        },
        {
          id: 'disabled',
          key: 'hidden',
          label: 'Hidden',
          field_type: FormFieldType.TEXT,
          target: FormFieldTarget.BOOKING,
          is_required: false,
          is_enabled: false,
          sort_order: 0,
        },
        {
          id: '1',
          key: 'one',
          label: 'One',
          field_type: FormFieldType.TEXT,
          target: FormFieldTarget.BOOKING,
          is_required: false,
          is_enabled: true,
          sort_order: 1,
        },
      ],
    });

    expect(fields.length).toBe(2);
    expect(fields[0].key).toBe('one');
    expect(fields[1].key).toBe('two');
  });
});
