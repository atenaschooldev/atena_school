// Centralized API Types & DTO Interfaces (Single Source of Truth)
// Decomposed into clean domain modules with full backward-compatibility

// Common
export * from './common/dictionary.types';
export * from './common/days-of-week';
export * from './common/error-codes';

// Auth & Users
export * from './auth/users';

// Academic Domain
export * from './academic/courses';
export * from './academic/lessons';
export * from './academic/attendance';
export * from './academic/students';
export * from './academic/memberships';

// Commerce Domain
export * from './commerce/bookings';
export * from './commerce/payments';
export * from './commerce/discounts';

// System & Platform Domain
export * from './system/settings';
export * from './system/notifications';
export * from './system/contact';
