export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    const expiration = payload.exp * 1000;

    return Date.now() >= expiration;
  } catch {
    return true;
  }
};

export const getTokenPayload = (token) => {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('staff');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return token && !isTokenExpired(token);
};
