import { API_URL } from './api.js';

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

export function logout() {
  localStorage.removeItem('access_token');
  window.location.href = 'login.html';
}
