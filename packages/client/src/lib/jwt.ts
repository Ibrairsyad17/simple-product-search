export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

export const getEmailFromToken = (token: string): string | null => {
  const payload = decodeJWT(token);
  return payload?.email || null;
};

export const getUserIdFromToken = (token: string): string | null => {
  const payload = decodeJWT(token);
  return payload?.userId || null;
};

export const getTokenExpiryTime = (token: string): number => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return 0;

  const currentTime = Math.floor(Date.now() / 1000);
  const remaining = payload.exp - currentTime;
  return remaining > 0 ? remaining : 0;
};
