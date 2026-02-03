// ================================
// SanaPay - Dashboard Controller
// VERSION FINALE STABLE
// ================================

const API_BASE_URL = 'http://localhost:3000';
const token = localStorage.getItem('token');

// 🔐 Sécurité : accès interdit sans token
if (!token) {
  window.location.href = 'login.html';
}

// Headers avec JWT
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + token,
  };
}

// ================================
// INITIALISATION
// ================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
  await loadStats();
  await loadHistory();
});

// ================================
// 👤 PROFIL UTILISATEUR (RÉEL)
// ================================
async function loadProfile() {
  try {
    const res = await fetch('http://localhost:3000/user/profile', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    });

    if (!res.ok) throw new Error('Erreur profil');

    const data = await res.json();

    document.getElementById('userName').textContent =
      `${data.firstName} ${data.lastName}`;

    document.getElementById('walletNumber').textContent =
      data.walletNumber ?? '—';
  } catch (err) {
    console.error(err);
  }
}


// ================================
// 📊 STATS + SOLDE
// ================================
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions/stats`, {
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error('Erreur stats');

    const data = await res.json();

    document.getElementById('balance').textContent =
      data.balance.toFixed(2) + ' MAD';

    document.getElementById('monthlyDeposits').textContent =
      data.totalDeposits.toFixed(2) + ' MAD';

    document.getElementById('monthlyWithdrawals').textContent =
      data.totalWithdraws.toFixed(2) + ' MAD';

    document.getElementById('totalTransfers').textContent =
      data.transactionsCount;

    document.getElementById('paidBills').textContent = 0;

  } catch (err) {
    console.error('Erreur stats:', err);
  }
}

// ================================
// 📜 HISTORIQUE DES TRANSACTIONS
// ================================
async function loadHistory() {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions/history`, {
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error('Erreur historique');

    const transactions = await res.json();
    const container = document.getElementById('transactionsList');
    container.innerHTML = '';

    if (transactions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-receipt"></i>
          <p>Aucune transaction</p>
        </div>`;
      return;
    }

    transactions.forEach((tx) => {
      const isDeposit = tx.type === 'DEPOSIT';
      const sign = isDeposit ? '+' : '-';
      const amountClass = isDeposit ? 'positive' : 'negative';

      const div = document.createElement('div');
      div.className = 'transaction-item';

      div.innerHTML = `
        <div>
          <strong>${tx.type}</strong>
          <div class="transaction-date">
            ${new Date(tx.createdAt).toLocaleString()}
          </div>
        </div>
        <div class="transaction-amount ${amountClass}">
          ${sign}${tx.amount.toFixed(2)} MAD
        </div>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error('Erreur historique:', err);
  }
}

// ================================
// 💳 DÉPÔT
// ================================
window.makeDeposit = async (e) => {
  e.preventDefault();

  const amount = Number(document.getElementById('depositAmount').value);
  if (!amount || amount <= 0) return alert('Montant invalide');

  await fetch(`${API_BASE_URL}/transactions/deposit`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ amount }),
  });

  closeModals();
  loadStats();
  loadHistory();
};

// ================================
// 💸 RETRAIT
// ================================
window.makeWithdraw = async (e) => {
  e.preventDefault();

  const amount = Number(document.getElementById('withdrawAmount').value);
  if (!amount || amount <= 0) return alert('Montant invalide');

  await fetch(`${API_BASE_URL}/transactions/withdraw`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ amount }),
  });

  closeModals();
  loadStats();
  loadHistory();
};

// ================================
// 🧭 UI
// ================================
window.openModal = (type) =>
  document.getElementById(type + 'Modal')?.classList.add('active');

window.closeModals = () =>
  document.querySelectorAll('.modal').forEach((m) =>
    m.classList.remove('active')
  );

// ================================
// 🚪 LOGOUT
// ================================
window.logout = () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
};

// ================================
// PLACEHOLDERS (FUTUR)
// ================================
window.copyWalletNumber = () => alert('Fonctionnalité bientôt disponible');
window.filterTransactions = () => alert('Filtrage bientôt disponible');
window.toggle2FA = () => alert('2FA non implémenté');
window.toggleNotifications = () => alert('Notifications non implémentées');
