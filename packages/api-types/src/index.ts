/**
 * ============================================================================
 * ATENA SCHOOL — CENTRALIZED API TYPES & DTO INTERFACES
 * ============================================================================
 * @module @atena/api-types
 * @description
 * Единый источник правды (Single Source of Truth) для всей монорепы Atena School:
 * - apps/landing (онлайн запись, чекаут Stripe, формы)
 * - apps/app (личный кабинет студента, расписание)
 * - apps/admin (CRM, касса, управление курсами и студентами)
 * - apps/backend (NestJS REST API, сервисы, вебхуки)
 * - packages/utils (бизнес-хелперы, расчёт дат)
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. Common Types & System Standards
// ----------------------------------------------------------------------------
export * from './common/dictionary';
export * from './common/days-of-week';
export * from './common/error-codes';

// ----------------------------------------------------------------------------
// 2. Auth, Users & RBAC
// ----------------------------------------------------------------------------
export * from './auth/users';

// ----------------------------------------------------------------------------
// 3. Academic Domain (Courses, Curricula, Lessons, Attendance, Students)
// ----------------------------------------------------------------------------
export * from './academic/courses';
export * from './academic/lessons';
export * from './academic/attendance';
export * from './academic/students';
export * from './academic/memberships';

// ----------------------------------------------------------------------------
// 4. Commerce Domain (Bookings, Payments, Subscriptions, Discounts)
// ----------------------------------------------------------------------------
export * from './commerce/bookings';
export * from './commerce/payments';
export * from './commerce/discounts';

// ----------------------------------------------------------------------------
// 5. System & Platform Domain (Settings, Notifications, Contact Leads)
// ----------------------------------------------------------------------------
export * from './system/settings';
export * from './system/notifications';
export * from './system/contact';
