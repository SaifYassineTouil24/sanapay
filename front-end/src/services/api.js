export const API_URL = 'http://localhost:3000/api';

export function authHeaders() {
  const token = localStorage.getItem('access_token');
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}
