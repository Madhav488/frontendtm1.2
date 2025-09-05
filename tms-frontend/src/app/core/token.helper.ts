export function decodeJwtPayload(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * role extraction helper: JWT produced by the backend includes role
 * under a claim. Try common keys.
 */
export function getRoleFromPayload(payload: any): string | null {
  if (!payload) return null;
  if (payload['role']) return payload['role'];
  if (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  }
  if (payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role']) {
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'];
  }
  return null;
}
