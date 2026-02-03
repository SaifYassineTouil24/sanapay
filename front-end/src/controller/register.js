const API_BASE = 'http://localhost:3000';

document.querySelector('.register-container').addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('register-prenom').value;
    const lastName = document.getElementById('register-nom').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;

    // Validate password match
    if (password !== passwordConfirm) {
        alert('Les mots de passe ne correspondent pas');
        return;
    }

    // Validate password length
    if (password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                firstName,
                lastName,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || 'Compte créé avec succès!');
            // Redirect to login
            window.location.href = 'login.html';
        } else {
            alert(data.message || 'Erreur lors de la création du compte');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Erreur de connexion au serveur');
    }
});
