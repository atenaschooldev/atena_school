import { describe, it, expect } from 'vitest';
import {
  extractCleanTime,
  computeEndTime,
  computeTotalLessonsCount,
} from '../course.service';
import { CourseScheduleType } from '@atena/api-types';

describe('Course Domain Service Utilities', () => {
  describe('extractCleanTime', () => {
    it('extracts HH:mm from standard string', () => {
      expect(extractCleanTime('15:30')).toBe('15:30');
      expect(extractCleanTime('09:00')).toBe('09:00');
    });

    it('extracts time from formatted text', () => {
      expect(extractCleanTime('Dalle 18:45 in poi')).toBe('18:45');
    });

    it('returns null on null or undefined', () => {
      expect(extractCleanTime(null)).toBeNull();
      expect(extractCleanTime(undefined)).toBeNull();
      expect(extractCleanTime('')).toBeNull();
    });
  });

  describe('computeEndTime', () => {
    it('computes end time correctly for 60 minute duration', () => {
      expect(computeEndTime('10:00', 60)).toBe('11:00');
      expect(computeEndTime('14:30', 60)).toBe('15:30');
    });

    it('computes end time correctly for 90 minute duration', () => {
      expect(computeEndTime('10:00', 90)).toBe('11:30');
    });

    it('handles hour overflow correctly', () => {
      expect(computeEndTime('23:30', 60)).toBe('00:30');
    });

    it('returns null for invalid or empty inputs', () => {
      expect(computeEndTime(null)).toBeNull();
      expect(computeEndTime('invalid')).toBeNull();
    });
  });

  describe('computeTotalLessonsCount', () => {
    it('returns course.total_lessons if explicitly defined', () => {
      const course = { total_lessons: 12 } as any;
      expect(computeTotalLessonsCount(course, 8)).toBe(12);
    });

    it('returns null if total_hours is set', () => {
      const course = { total_hours: 30 } as any;
      expect(computeTotalLessonsCount(course, 8)).toBeNull();
    });

    it('computes flexible lessons per week * 4', () => {
      const course = {
        schedule_type: CourseScheduleType.FLEXIBLE,
        lessons_per_week: 2,
      } as any;
      expect(computeTotalLessonsCount(course, 8)).toBe(8);
    });

    it('falls back to calculated lessons count or default 8', () => {
      expect(computeTotalLessonsCount(null, 10)).toBe(10);
      expect(computeTotalLessonsCount(null, 0)).toBe(8);
    });
  });
});
