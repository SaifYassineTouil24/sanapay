
  document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault(); // empêche le rechargement du formulaire

  const email = document.getElementById('login-id').value;
  const password = document.getElementById('login-password').value;
  const message = document.getElementById('loginMessage');

  fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
    .then(response => response.text())
    .then(data => {
      message.textContent = data;

      if (data === 'Connexion réussie') {
        // Sauvegarder l'utilisateur connecté
        localStorage.setItem('userEmail', email);

        message.style.color = 'green';

        setTimeout(() => {
          window.location.href = 'account.html';
        }, 1000);
      } else {
        message.style.color = 'red';
      }
    })
    .catch(error => {
      console.error(error);
      message.textContent = 'Erreur de connexion au serveur';
      message.style.color = 'red';
    });
});
