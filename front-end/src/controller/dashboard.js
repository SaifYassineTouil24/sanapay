const API_BASE = "http://localhost:3000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "login.html";
    return {};
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

window.openModal = openModal;
window.closeModals = closeModals;

window.makeDeposit = makeDeposit;
window.makeWithdraw = makeWithdraw;
window.makeTransfer = makeTransfer;

window.toggle2FA = toggle2FA;
window.toggleNotifications = toggleNotifications;

window.copyWalletNumber = copyWalletNumber;
window.logout = logout;


let state = {
  user: {
    name: "Utilisateur",
    memberSince: "2024",
    accountType: "Premium",
    verified: true
  },
  wallet: {
    number: "WALLET-8392741",
    balance: 0.00
  },
  stats: {
    monthlyDeposits: 0,
    monthlyWithdrawals: 0,
    transfers: 0,
    paidBills: 0
  },
  transactions: []
};

/* ==========================
   INIT
========================== */
document.addEventListener("DOMContentLoaded", () => {
   const depositBtn = document.getElementById("depositBtn");
    if (depositBtn) {
    depositBtn.addEventListener("click", makeDeposit);
  }
  loadUser();          // 👈 AJOUT
  loadWallet();
  loadTransactions();
  loadStats();
});

/* ==========================
   USER / WALLET
========================== */
async function loadUser() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) logout();
    return;
  }

  const data = await res.json();

  // Nom complet
  document.getElementById("userName").textContent =
    data.firstName + " " + data.lastName;

  // Avatar dynamique (optionnel)
  const avatar = document.getElementById("userAvatar");
  if (avatar) {
    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      data.firstName + " " + data.lastName
    )}&background=3b82f6&color=fff&size=128&bold=true`;
  }

  // Date d'inscription
  if (data.createdAt) {
    const year = new Date(data.createdAt).getFullYear();
    document.getElementById("memberSince").textContent =
      "Membre depuis " + year;
  }
}


async function loadWallet() {
  const res = await fetch(`${API_BASE}/ewallet/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) logout();
    return;
  }

  const wallet = await res.json();

  document.getElementById("walletNumber").textContent =
    wallet.walletNumber;

  document.getElementById("balance").textContent =
    Number(wallet.balance).toFixed(2) + " MAD";
}


function updateBalance() {
  document.getElementById("balance").textContent =
    state.wallet.balance.toFixed(2) + " MAD";
}

/* ==========================
   STATS
========================== */
function loadStats() {
  document.getElementById("monthlyDeposits").textContent =
    state.stats.monthlyDeposits.toFixed(2) + " MAD";

  document.getElementById("monthlyWithdrawals").textContent =
    state.stats.monthlyWithdrawals.toFixed(2) + " MAD";

  document.getElementById("totalTransfers").textContent =
    state.stats.transfers;

  document.getElementById("paidBills").textContent =
    state.stats.paidBills;
}

/* ==========================
   MODALS
========================== */
function openModal(type) {
  closeModals();
  document.getElementById(type + "Modal").classList.add("active");
}

function closeModals() {
  document.querySelectorAll(".modal").forEach(modal => {
    modal.classList.remove("active");
    
  });
}


/* ==========================
   TRANSACTIONS
========================== */
function addTransaction(type, amount, description) {
  state.transactions.unshift({
    type,
    amount,
    description,
    date: new Date().toLocaleString()
  });
  renderTransactions();
}

function renderTransactions() {
  const container = document.getElementById("transactionsList");
  container.innerHTML = "";

  if (state.transactions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-receipt"></i>
        <p>Aucune transaction pour le moment</p>
      </div>`;
    return;
  }

  state.transactions.forEach(tx => {
    const sign = tx.type === "deposit" ? "+" : "-";
    const color = tx.type === "deposit" ? "success" :
                  tx.type === "withdraw" ? "danger" : "primary";

    container.innerHTML += `
      <div class="transaction-item ${color}">
        <div>
          <strong>${tx.type.toUpperCase()}</strong>
          <p>${tx.description || "—"}</p>
          <small>${tx.date}</small>
        </div>
        <div class="amount">
          ${sign}${tx.amount.toFixed(2)} MAD
        </div>
      </div>
    `;
  });
}

/* ==========================
   ACTIONS
========================== */


async function makeDeposit(e) {
  e.preventDefault();

  const msg = document.getElementById("depositMessage");
  msg.textContent = "Traitement...";
  msg.style.color = "#aaa";

  const amount = Number(document.getElementById("depositAmount").value);

  try {
    const res = await fetch(`${API_BASE}/transactions/deposit`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.message || "Erreur dépôt";
      msg.style.color = "red";
      return;
    }

    msg.textContent = "✅ Dépôt effectué avec succès";
    msg.style.color = "lime";

    // ✅ mise à jour immédiate du solde
    document.getElementById("balance").textContent =
      data.balance + " MAD";

    // ✅ reload transactions
    await loadTransactions();

    // ✅ reset + fermeture du modal
    setTimeout(() => {
      document.getElementById("depositAmount").value = "";
      document.getElementById("depositMethod").value = "";
      document.getElementById("depositDescription").value = "";
      closeModals();
    }, 700);

  } catch (err) {
    console.error(err);
    msg.textContent = "Erreur serveur";
    msg.style.color = "red";
  }
  await loadStats();

}


function resetDepositForm() {
  document.getElementById("depositAmount").value = "";
  document.getElementById("depositMethod").value = "";
  document.getElementById("depositDescription").value = "";

  const msg = document.getElementById("depositMessage");
  if (msg) msg.textContent = "";
}



async function makeWithdraw(e) {
  e.preventDefault();

  const msg = document.getElementById("withdrawMessage");
  msg.textContent = "Traitement...";
  msg.style.color = "#aaa";

  const amount = Number(
    document.getElementById("withdrawAmount").value
  );

  try {
    const res = await fetch(`${API_BASE}/transactions/withdraw`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.message || "Erreur retrait";
      msg.style.color = "red";
      return;
    }

    // ✅ MESSAGE OK
    msg.textContent = "✅ Retrait effectué avec succès";
    msg.style.color = "lime";

    // ✅ SOLDE MIS À JOUR IMMÉDIATEMENT
    document.getElementById("balance").textContent =
      data.balance + " MAD";

    // ✅ RELOAD TRANSACTIONS
    await loadTransactions();

    // ✅ RESET + FERMETURE MODAL
    setTimeout(() => {
      document.getElementById("withdrawAmount").value = "";
      document.getElementById("withdrawMethod").value = "";
      document.getElementById("withdrawDescription").value = "";
      closeModals();
    }, 700);

  } catch (err) {
    console.error(err);
    msg.textContent = "Erreur serveur";
    msg.style.color = "red";
  }
  await loadStats();

}


async function makeTransfer(e) {
  e.preventDefault();

  const walletNumber = document.getElementById("transferWallet").value.trim();
  const amount = Number(document.getElementById("transferAmount").value);
  const description = document.getElementById("transferDescription").value;

  if (!walletNumber || amount <= 0) {
    alert("Veuillez remplir correctement les champs");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/transactions/transfer`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        walletNumber,
        amount,
        description,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Erreur lors du transfert");
      return;
    }

    // ✅ Mise à jour immédiate du solde
    document.getElementById("balance").textContent =
      Number(data.balanceAfter).toFixed(2) + " MAD";

    // ✅ Fermer le modal
    closeModals();

    // ✅ Vider les champs
    document.getElementById("transferWallet").value = "";
    document.getElementById("transferAmount").value = "";
    document.getElementById("transferDescription").value = "";

    // ✅ Rafraîchir les transactions
    loadTransactions();

  } catch (err) {
    console.error(err);
    alert("Erreur serveur");
  }
}

async function loadTransactions() {
  const res = await fetch(`${API_BASE}/transactions/history`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) return;

  const data = await res.json();
  const transactions = data.transactions;

  const container = document.getElementById("transactionsList");
  container.innerHTML = "";

  if (!Array.isArray(transactions) || transactions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Aucune transaction</p>
      </div>`;
    return;
  }

  transactions.forEach(tx => {
    const sign = tx.type === "DEPOSIT" ? "+" : "-";
    const color = tx.type === "DEPOSIT" ? "success" : "danger";

    container.innerHTML += `
      <div class="transaction-item ${color}">
        <div>
          <strong>${tx.type}</strong>
          <small>${new Date(tx.createdAt).toLocaleString()}</small>
        </div>
        <div>${sign}${tx.amount} MAD</div>
      </div>
    `;
  });
}


/* ==========================
   SECURITY
========================== */
function toggle2FA() {
  const enabled = document.getElementById("toggle2FA").checked;
  alert(enabled ? "2FA activée" : "2FA désactivée");
}

function toggleNotifications() {
  const enabled = document.getElementById("toggleNotifications").checked;
  alert(enabled ? "Notifications activées" : "Notifications désactivées");
}

/* ==========================
   UTILS
========================== */
function copyWalletNumber() {
  navigator.clipboard.writeText(state.wallet.number);
  alert("Numéro de portefeuille copié");
}

function logout() {
  localStorage.removeItem("access_token");
  window.location.href = "login.html";
}
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/transactions/stats`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      console.error("Erreur stats", res.status);
      return;
    }

    const stats = await res.json();
    console.log("STATS BACKEND:", stats);

    // ✅ Dépôts (total)
    document.getElementById("monthlyDeposits").textContent =
      stats.totalDeposited.toFixed(2) + " MAD";

    // ✅ Retraits (total)
    document.getElementById("monthlyWithdrawals").textContent =
      stats.totalWithdrawn.toFixed(2) + " MAD";

    // ✅ Nombre de transactions
    document.getElementById("totalTransfers").textContent =
      stats.totalTransactions;

    // ✅ Factures (pas encore implémentées)
    document.getElementById("paidBills").textContent = "0";

  } catch (err) {
    console.error("Erreur JS stats", err);
  }
}


// ===== EXPORT GLOBAL FUNCTIONS =====
window.openModal = openModal;
window.closeModals = closeModals;

window.makeDeposit = makeDeposit;
window.makeWithdraw = makeWithdraw;
window.makeTransfer = makeTransfer;

window.toggle2FA = toggle2FA;
window.toggleNotifications = toggleNotifications;

window.copyWalletNumber = copyWalletNumber;
window.logout = logout;