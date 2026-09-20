/**
 * Declarative condition matching helper for dynamic notification triggers
 */

export function matchesTriggerConditions(
  payload: Record<string, any>,
  conditions?: Record<string, any> | null
): boolean {
  if (!conditions || Object.keys(conditions).length === 0) {
    return true;
  }

  for (const [key, expectedValue] of Object.entries(conditions)) {
    if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
      continue;
    }

    const actualValue = payload[key];

    // Array inclusion
    if (Array.isArray(expectedValue)) {
      if (!expectedValue.includes(actualValue)) {
        return false;
      }
      continue;
    }

    // Min amount comparison
    if (key.startsWith('min_') && typeof expectedValue === 'number') {
      const field = key.replace('min_', '');
      const num = Number(payload[field] ?? payload.total_amount ?? payload.amount_paid ?? 0);
      if (num < expectedValue) return false;
      continue;
    }

    // Max amount comparison
    if (key.startsWith('max_') && typeof expectedValue === 'number') {
      const field = key.replace('max_', '');
      const num = Number(payload[field] ?? payload.total_amount ?? payload.amount_paid ?? 0);
      if (num > expectedValue) return false;
      continue;
    }

    // String / numeric comparison (case-insensitive for strings)
    if (typeof expectedValue === 'string' && typeof actualValue === 'string') {
      if (expectedValue.toLowerCase().trim() !== actualValue.toLowerCase().trim()) {
        return false;
      }
      continue;
    }

    if (String(actualValue) !== String(expectedValue)) {
      return false;
    }
  }

  return true;
}
