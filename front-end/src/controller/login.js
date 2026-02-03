const API_BASE = 'http://localhost:3000';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-id').value;
  const password = document.getElementById('login-password').value;
  const messageEl = document.getElementById('loginMessage');

  if (!email || !password) {
    messageEl.textContent = 'Veuillez remplir tous les champs';
    messageEl.style.color = 'red';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      messageEl.textContent = result.message || 'Identifiants invalides';
      messageEl.style.color = 'red';
      return;
    }

    // ✅ STOCKAGE CORRECT
    localStorage.setItem('token', result.access_token);
    localStorage.setItem(
      'sanapay_user',
      JSON.stringify(result.data)
    );

    messageEl.style.color = 'green';
    messageEl.textContent = 'Connexion réussie';

    setTimeout(() => {
      window.location.href = 'account.html';
    }, 500);

  } catch (err) {
    console.error(err);
    messageEl.textContent = 'Erreur de connexion au serveur';
    messageEl.style.color = 'red';
  }
});

