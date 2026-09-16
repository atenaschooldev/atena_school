/**
 * Checkout Service Facade
 * 
 * Re-exports domain services for complete backward compatibility across all API routes.
 * Individual domain implementations are modularized under `./services/`:
 *  - Course catalog & details: `./services/course.service`
 *  - Student & Membership linking: `./services/student.service`
 *  - Reservations & Lesson generation: `./services/reservation.service`
 *  - Stripe sessions & webhooks: `./services/stripe.service`
 *  - Contact forms: `./services/contact.service`
 *  - Fee status checking: `./fee-service`
 *  - Transactional emails: `./email-service`
 */

export * from './services';
export * from './fee-service';
export * from './email-service';
