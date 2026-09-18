import { Injectable } from '@nestjs/common';
import { renderDictionaryHtml } from './dictionary.template';
import {
  getBookingsDictionary,
  getPaymentsDictionary,
  getDiscountsDictionary,
  getCertificationsDictionary,
} from './registries/commerce.registry';
import {
  getCoursesDictionary,
  getLessonsDictionary,
  getAttendanceRecordsDictionary,
  getStudentsDictionary,
  getAnnualMembershipsDictionary,
} from './registries/academic.registry';
import {
  getUsersDictionary,
  getAppSettingsDictionary,
  getNotificationsDictionary,
  getContactMessagesDictionary,
  getContactTopicsDictionary,
  getErrorCodesDictionary,
  getDaysOfWeekDictionary,
} from './registries/system.registry';

@Injectable()
export class DictionaryService {
  // Commerce Domain
  getBookingsDictionary() {
    return getBookingsDictionary();
  }

  getPaymentsDictionary() {
    return getPaymentsDictionary();
  }

  getDiscountsDictionary() {
    return getDiscountsDictionary();
  }

  getCertificationsDictionary() {
    return getCertificationsDictionary();
  }

  // Academic Domain
  getCoursesDictionary() {
    return getCoursesDictionary();
  }

  getLessonsDictionary() {
    return getLessonsDictionary();
  }

  getAttendanceRecordsDictionary() {
    return getAttendanceRecordsDictionary();
  }

  getStudentsDictionary() {
    return getStudentsDictionary();
  }

  getAnnualMembershipsDictionary() {
    return getAnnualMembershipsDictionary();
  }

  // System & Platform Domain
  getUsersDictionary() {
    return getUsersDictionary();
  }

  getAppSettingsDictionary() {
    return getAppSettingsDictionary();
  }

  getNotificationsDictionary() {
    return getNotificationsDictionary();
  }

  getContactMessagesDictionary() {
    return getContactMessagesDictionary();
  }

  getContactTopicsDictionary() {
    return getContactTopicsDictionary();
  }

  getErrorCodesDictionary() {
    return getErrorCodesDictionary();
  }

  getDaysOfWeekDictionary() {
    return getDaysOfWeekDictionary();
  }

  getAll() {
    return {
      version: '2.0.0',
      description: 'Централизованный словарь перечислений и системных настроек Atena School',
      tables: {
        bookings: this.getBookingsDictionary(),
        payments: this.getPaymentsDictionary(),
        lessons: this.getLessonsDictionary(),
        attendance_records: this.getAttendanceRecordsDictionary(),
        courses: this.getCoursesDictionary(),
        students: this.getStudentsDictionary(),
        annual_memberships: this.getAnnualMembershipsDictionary(),
        users: this.getUsersDictionary(),
        contact_messages: this.getContactMessagesDictionary(),
        notifications: this.getNotificationsDictionary(),
        app_settings: this.getAppSettingsDictionary(),
        error_codes: this.getErrorCodesDictionary(),
        days_of_week: this.getDaysOfWeekDictionary(),
        discounts: this.getDiscountsDictionary(),
        exam_certifications: this.getCertificationsDictionary(),
        contact_topics: this.getContactTopicsDictionary(),
      },
    };
  }

  renderHtml(): string {
    return renderDictionaryHtml(this.getAll());
  }
}
