import { jwtDecode } from 'jwt-decode';

export const getCurrentUserId = (token) => {
  if (!token) return;

  const decodedToken = jwtDecode(token);

  if (decodedToken) {
    const userId = decodedToken.sub.match(/User:(\d+)/i)[1];
    return Number(userId);
  }
};

export const isTokenCurrent = (token) => {
  if (!token) return false;

  const decodedToken = jwtDecode(token);

  if (decodedToken && decodedToken.exp) {
    // Convert Date.now() as seconds from epoch instead of milliseconds
    return decodedToken.exp > Math.floor(Date.now() / 1000);
  }

  return false;
};
