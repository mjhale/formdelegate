import jwtDecode from 'jwt-decode';

export const getCurrentUserId = token => {
  if (token) {
    const decodedToken = jwtDecode(token);

    if (decodedToken) {
      return decodedToken.sub.match(/User:(\d+)/i)[1];
    }
  }
};

export const isTokenCurrent = token => {
  if (token) {
    const decodedToken = jwtDecode(token);

    if (decodedToken && decodedToken.exp) {
      // Convert Date.now() as seconds from epoch instead of milliseconds
      return decodedToken.exp > Math.floor(Date.now() / 1000);
    }
  }

  return false;
};