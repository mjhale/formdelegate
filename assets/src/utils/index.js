import jwtDecode from 'jwt-decode';

export const getCurrentUserId = (token = localStorage.getItem('fd_token')) => {
  if (!token) return;

  const decodedToken = jwtDecode(token);

  if (decodedToken) {
    return decodedToken.sub.match(/User:(\d+)/i)[1];
  }
};

export const isTokenCurrent = (token = localStorage.getItem('fd_token')) => {
  if (!token) return false;

  const decodedToken = jwtDecode(token);

  if (decodedToken && decodedToken.exp) {
    // Convert Date.now() as seconds from epoch instead of milliseconds
    return decodedToken.exp > Math.floor(Date.now() / 1000);
  }

  return false;
};
