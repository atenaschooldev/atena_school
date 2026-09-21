/**
 * Safely resolves nested property paths (e.g. 'course.schedule.is_evening')
 * with instant O(1) fallback for direct top-level keys.
 */
export function getFieldValue(obj: Record<string, any>, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, path)) {
    return obj[path];
  }
  if (!path.includes('.')) {
    return obj[path];
  }
  return path.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined || typeof acc !== 'object') {
      return undefined;
    }
    return acc[part];
  }, obj);
}

/**
 * Normalizes boolean-like values (1/"true"/true vs 0/"false"/false/null/undefined)
 */
export function normalizeBoolean(val: any): boolean {
  if (val === true || val === 1 || val === '1' || val === 'true' || val === 'TRUE') {
    return true;
  }
  return false;
}

/**
 * Evaluates a single rule / operator condition against an actual value
 */
function evaluateCondition(actualValue: any, condition: any, payload: Record<string, any>): boolean {
  // 1. Boolean comparison
  if (typeof condition === 'boolean') {
    return normalizeBoolean(actualValue) === condition;
  }

  // 2. Direct array inclusion
  if (Array.isArray(condition)) {
    return condition.some((item) => {
      if (typeof item === 'string' && typeof actualValue === 'string') {
        return item.toLowerCase().trim() === actualValue.toLowerCase().trim();
      }
      return String(item) === String(actualValue);
    });
  }

  // 3. Structured operator object: { gte, lte, eq, neq, contains, not_contains, in, not_in, is_empty, is_not_empty }
  if (condition && typeof condition === 'object' && !(condition instanceof Date) && !Array.isArray(condition)) {
    for (const [op, opVal] of Object.entries(condition)) {
      switch (op) {
        case '=':
        case '==':
        case 'eq': {
          if (typeof opVal === 'boolean') {
            if (normalizeBoolean(actualValue) !== opVal) return false;
          } else if (typeof opVal === 'string' && typeof actualValue === 'string') {
            if (opVal.toLowerCase().trim() !== actualValue.toLowerCase().trim()) return false;
          } else if (String(actualValue) !== String(opVal)) {
            return false;
          }
          break;
        }

        case '!=':
        case '<>':
        case 'neq': {
          if (typeof opVal === 'boolean') {
            if (normalizeBoolean(actualValue) === opVal) return false;
          } else if (typeof opVal === 'string' && typeof actualValue === 'string') {
            if (opVal.toLowerCase().trim() === actualValue.toLowerCase().trim()) return false;
          } else if (String(actualValue) === String(opVal)) {
            return false;
          }
          break;
        }

        case '>':
        case 'gt': {
          const numActual = Number(actualValue ?? 0);
          const numExpected = Number(opVal);
          if (isNaN(numActual) || isNaN(numExpected) || numActual <= numExpected) return false;
          break;
        }

        case '>=':
        case 'gte': {
          const numActual = Number(actualValue ?? 0);
          const numExpected = Number(opVal);
          if (isNaN(numActual) || isNaN(numExpected) || numActual < numExpected) return false;
          break;
        }

        case '<':
        case 'lt': {
          const numActual = Number(actualValue ?? 0);
          const numExpected = Number(opVal);
          if (isNaN(numActual) || isNaN(numExpected) || numActual >= numExpected) return false;
          break;
        }

        case '<=':
        case 'lte': {
          const numActual = Number(actualValue ?? 0);
          const numExpected = Number(opVal);
          if (isNaN(numActual) || isNaN(numExpected) || numActual > numExpected) return false;
          break;
        }

        case 'contains': {
          const strActual = String(actualValue ?? '').toLowerCase();
          const strExpected = String(opVal ?? '').toLowerCase();
          if (!strActual.includes(strExpected)) return false;
          break;
        }

        case 'not_contains': {
          const strActual = String(actualValue ?? '').toLowerCase();
          const strExpected = String(opVal ?? '').toLowerCase();
          if (strActual.includes(strExpected)) return false;
          break;
        }

        case 'starts_with': {
          const strActual = String(actualValue ?? '').toLowerCase().trim();
          const strExpected = String(opVal ?? '').toLowerCase().trim();
          if (!strActual.startsWith(strExpected)) return false;
          break;
        }

        case 'ends_with': {
          const strActual = String(actualValue ?? '').toLowerCase().trim();
          const strExpected = String(opVal ?? '').toLowerCase().trim();
          if (!strActual.endsWith(strExpected)) return false;
          break;
        }

        case 'in': {
          if (Array.isArray(opVal)) {
            const matched = opVal.some((item) => {
              if (typeof item === 'string' && typeof actualValue === 'string') {
                return item.toLowerCase().trim() === actualValue.toLowerCase().trim();
              }
              return String(item) === String(actualValue);
            });
            if (!matched) return false;
          }
          break;
        }

        case 'not_in': {
          if (Array.isArray(opVal)) {
            const matched = opVal.some((item) => {
              if (typeof item === 'string' && typeof actualValue === 'string') {
                return item.toLowerCase().trim() === actualValue.toLowerCase().trim();
              }
              return String(item) === String(actualValue);
            });
            if (matched) return false;
          }
          break;
        }

        case 'is_empty': {
          const isEmpty = actualValue === undefined || actualValue === null || actualValue === '' || (Array.isArray(actualValue) && actualValue.length === 0);
          if (isEmpty !== Boolean(opVal)) return false;
          break;
        }

        case 'is_not_empty': {
          const isNotEmpty = actualValue !== undefined && actualValue !== null && actualValue !== '' && (!Array.isArray(actualValue) || actualValue.length > 0);
          if (isNotEmpty !== Boolean(opVal)) return false;
          break;
        }

        default:
          break;
      }
    }
    return true;
  }

  // 4. Case-insensitive string comparison
  if (typeof condition === 'string' && typeof actualValue === 'string') {
    return condition.toLowerCase().trim() === actualValue.toLowerCase().trim();
  }

  // 5. Primitive equality fallback
  return String(actualValue) === String(condition);
}

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

    // Min amount legacy comparison
    if (key.startsWith('min_') && typeof expectedValue === 'number') {
      const field = key.replace('min_', '');
      const num = Number(getFieldValue(payload, field) ?? payload.total_amount ?? payload.amount_paid ?? 0);
      if (num < expectedValue) return false;
      continue;
    }

    // Max amount legacy comparison
    if (key.startsWith('max_') && typeof expectedValue === 'number') {
      const field = key.replace('max_', '');
      const num = Number(getFieldValue(payload, field) ?? payload.total_amount ?? payload.amount_paid ?? 0);
      if (num > expectedValue) return false;
      continue;
    }

    const actualValue = getFieldValue(payload, key);
    if (!evaluateCondition(actualValue, expectedValue, payload)) {
      return false;
    }
  }

  return true;
}

export function resolveRecipient(
  recipientType: number,
  channel: number,
  customRecipient?: string | null,
  payload: Record<string, any> = {},
  fallbackAdminEmail = 'info@atenaschool.com'
): string | null {
  if (customRecipient && customRecipient.trim()) {
    return customRecipient.trim();
  }

  if (Number(channel) === 1 /* EMAIL */) {
    if (Number(recipientType) === 1 /* CUSTOMER */) {
      return payload.purchaser_email || payload.customer_email || payload.email || payload.student_email || payload.purchaserEmail || null;
    }
    if (Number(recipientType) === 3 /* TEACHER */) {
      return payload.teacher_email || payload.teacherEmail || getFieldValue(payload, 'course.teacher.email') || null;
    }
    if (Number(recipientType) === 2 /* ADMIN */) {
      return payload.admin_email || fallbackAdminEmail;
    }
  } else if (Number(channel) === 2 /* TELEGRAM */) {
    if (Number(recipientType) === 2 /* ADMIN */) {
      return payload.admin_telegram_chat_id || null;
    }
    if (Number(recipientType) === 3 /* TEACHER */) {
      return payload.teacher_telegram_chat_id || null;
    }
    if (Number(recipientType) === 1 /* CUSTOMER */) {
      return payload.customer_phone || payload.phone || null;
    }
  }

  return null;
}



