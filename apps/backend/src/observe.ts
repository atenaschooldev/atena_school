import { createObserveModule } from '@nestjs/observe';

/**
 * Official NestJS Observe integration.
 * Provides auto-instrumented zero-config APM, request tracing, performance waterfalls, and metrics.
 */
export const { ObserveModule, ObserveInstrument } = createObserveModule();
