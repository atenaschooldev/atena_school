/**
 * URL resolution helpers for Atena School apps.
 * Strictly guarantees that whenever accessed on localhost (or in local dev),
 * all inter-app links stay on the respective localhost ports.
 */

export function getStudentPortalUrl(path = ''): string {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
      return `http://localhost:3002${cleanPath}`;
    }
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://app.atenaschool.com';
  if (process.env.NODE_ENV === 'development' && !base.includes('localhost') && !base.includes('127.0.0.1')) {
    const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
    return `http://localhost:3002${cleanPath}`;
  }

  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${base.replace(/\/$/, '')}${cleanPath}`;
}

export function getLandingSiteUrl(path = ''): string {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
      return `http://localhost:3000${cleanPath}`;
    }
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://atenaschool.com';
  if (process.env.NODE_ENV === 'development' && !base.includes('localhost') && !base.includes('127.0.0.1')) {
    const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
    return `http://localhost:3000${cleanPath}`;
  }

  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${base.replace(/\/$/, '')}${cleanPath}`;
}
