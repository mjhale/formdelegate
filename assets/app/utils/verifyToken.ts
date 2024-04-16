import { jwtDecode } from 'jwt-decode';

export const verifyToken = (token) => {
  if (!token) return false;

  const decodedToken = jwtDecode(token);

  if (decodedToken && decodedToken.exp) {
    // Convert Date.now() as seconds from epoch instead of milliseconds
    return decodedToken.exp > Math.floor(Date.now() / 1000);
  }

  return false;
};
