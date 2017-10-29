import jwtDecode from 'jwt-decode';

export const getCurrentAccountId = () => {
  const token = localStorage.getItem('fd_token');

  if (token) {
    const authToken = jwtDecode(localStorage.getItem('fd_token'));
    return authToken.sub.match(/Account:(\d+)/i)[1];
  }
};
