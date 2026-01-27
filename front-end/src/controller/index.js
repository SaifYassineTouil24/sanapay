
  const email = document.getElementById('login-id').value;
  const password = document.getElementById('login-password').value;

  fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then((response) => response.text())
    .then((data) => {
      if (data === 'Connexion réussie') {
        // redirection simple (niveau prof)
        window.location.href = 'index.html';
      } else {
        alert(data);
      }
    })
    .catch((error) => {
      console.error('Erreur:', error);
      alert('Erreur de connexion au serveur');
    });

