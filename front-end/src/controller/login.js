console.log("login.js chargé en tant que MODULE");
import { login } from '../services/auth.js';

const form = document.getElementById('loginForm');
const message = document.getElementById('loginMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-id').value;
  const password = document.getElementById('login-password').value;

  message.textContent = 'Connexion en cours...';
  message.style.color = '#555';

  try {
    const data = await login(email, password);

    if (!data.access_token) {
      message.textContent = data.message || 'Identifiants invalides';
      message.style.color = 'red';
      return;
    }

    // ✅ Stockage du token
    localStorage.setItem('access_token', data.access_token);

    message.textContent = 'Connexion réussie';
    message.style.color = 'green';

    // ✅ REDIRECTION
    setTimeout(() => {
      window.location.href = 'account.html';
    }, 500);

  } catch (err) {
    console.error(err);
    message.textContent = 'Erreur serveur';
    message.style.color = 'red';
  }
});
