/**
 * ====================================
 * SANAPAY - BILLS MANAGEMENT
 * ====================================
 * Gestion complète des factures avec API
 * @version 2.0.0 (Account Theme Compatible)
 */

const API_BASE = "http://localhost:3000/api";

// ============================================
// STATE MANAGEMENT
// ============================================
let billsState = {
    bills: [],
    filteredBills: [],
    currentBill: null,
    filters: {
        status: '',
        category: '',
        search: '',
        sort: 'date-desc'
    }
};

// ============================================
// AUTHENTICATION & HEADERS
// ============================================
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

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
    await loadBills();

    // Bind form events
    document.getElementById('createBillForm')?.addEventListener('submit', handleCreateBill);
    // document.getElementById('editBillForm')?.addEventListener('submit', handleEditBill);
});

// ============================================
// BILLS DATA LOADING
// ============================================
async function loadBills() {
    // showLoader("Chargement des factures...");
    const container = document.getElementById('billsContainer');
    if (!billsState.bills.length) {
        container.innerHTML = `
         <div class="empty-state" style="text-align: center; padding: 50px; color: var(--text-tertiary);">
            <i class="fas fa-circle-notch fa-spin" style="font-size: 2rem; margin-bottom: 20px;"></i>
            <p>Chargement de vos factures...</p>
         </div>`;
    }

    try {
        const response = await fetch(`${API_BASE}/bills`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error("Erreur lors du chargement des factures");
        }

        const data = await response.json();
        billsState.bills = data.bills || [];
        billsState.filteredBills = [...billsState.bills];

        renderBills();

    } catch (error) {
        console.error("Error loading bills:", error);
        showToast("Erreur lors du chargement des factures", "error");
        renderEmptyState("Erreur de chargement");
    } finally {
        hideLoader();
    }
}

// ============================================
// BILLS RENDERING
// ============================================
function renderBills() {
    const container = document.getElementById('billsContainer');

    if (!billsState.filteredBills || billsState.filteredBills.length === 0) {
        renderEmptyState();
        return;
    }

    container.innerHTML = `
        <div class="bills-list-layout">
            ${billsState.filteredBills.map(bill => createBillCard(bill)).join('')}
        </div>
    `;
}

function createBillCard(bill) {
    const categoryIcon = getCategoryIcon(bill.category);
    const statusClass = bill.status.toLowerCase();
    const statusText = getStatusText(bill.status);
    const formattedDate = bill.dueDate ? formatDate(bill.dueDate) : 'Non définie';
    const daysUntilDue = bill.dueDate ? getDaysUntilDue(bill.dueDate) : null;

    return `
        <div class="bill-grid-item ${statusClass}" data-bill-id="${bill.id}">
            <div class="bill-header-row">
                <div style="display:flex; gap:15px; align-items:center;">
                    <div class="bill-icon">
                        <span>${categoryIcon}</span>
                    </div>
                    <div class="bill-info">
                        <h3>${escapeHtml(bill.title)}</h3>
                        <p>${escapeHtml(bill.category)} • ${bill.accountNumber ? escapeHtml(bill.accountNumber) : 'Pas de compte'}</p>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div class="bill-amount-tag">${Number(bill.amount).toFixed(2)} MAD</div>
                    <div style="margin-top:5px;">
                        <span class="bill-status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
            </div>
            
            <div class="bill-details-row" style="display:flex; justify-content:space-between; font-size:0.9rem; color:var(--text-tertiary); margin-bottom: 10px;">
                <div>
                    ${bill.dueDate ? `
                        <i class="fas fa-calendar-alt"></i> Échéance: ${formattedDate}
                        ${daysUntilDue !== null && bill.status === 'PENDING' ? `
                            <span style="font-weight:600; margin-left:5px; color: ${daysUntilDue < 0 ? 'var(--danger-color)' : daysUntilDue <= 7 ? 'var(--warning-color)' : 'var(--success-color)'}">
                                (${daysUntilDue < 0 ? Math.abs(daysUntilDue) + 'j retard' : daysUntilDue + 'j restants'})
                            </span>
                        ` : ''}
                    ` : ''}
                </div>
                <div>Created: ${formatDate(bill.createdAt)}</div>
            </div>
            
            ${bill.notes ? `
                <div style="background:var(--bg-tertiary); padding:10px; border-radius:8px; font-size:0.9rem; color:var(--text-secondary); margin-bottom:10px;">
                    <i class="fas fa-sticky-note"></i> ${escapeHtml(bill.notes)}
                </div>
            ` : ''}

            <div class="bill-actions-row">
                 ${bill.status === 'PENDING' ? `
                    <button onclick="openPayBillModal('${bill.id}')" class="btn btn-sm" style="background:var(--success-color); color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;">
                        <i class="fas fa-credit-card"></i> Payer
                    </button>
                    <button onclick="openEditBillModal('${bill.id}')" class="btn btn-sm" style="background:var(--primary-blue); color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                ` : ''}
                
                <button onclick="deleteBill('${bill.id}')" class="btn btn-sm" style="background:transparent; border:1px solid var(--danger-color); color:var(--danger-color); padding:8px 16px; border-radius:8px; cursor:pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function renderEmptyState(message = null) {
    const container = document.getElementById('billsContainer');
    container.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 50px; color: var(--text-tertiary); background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <i class="fas fa-file-invoice fa-3x" style="margin-bottom: 20px; color: var(--text-tertiary); opacity: 0.5;"></i>
            <h3 style="color: var(--text-primary); margin-bottom: 10px;">${message || 'Aucune facture trouvée'}</h3>
            <p>Utilisez le bouton + pour ajouter une nouvelle facture.</p>
        </div>
    `;
}

// ============================================
// FILTERS & SEARCH
// ============================================
function filterBills() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';

    billsState.filters = {
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter
    };

    billsState.filteredBills = billsState.bills.filter(bill => {
        const matchesSearch = !searchTerm ||
            bill.title.toLowerCase().includes(searchTerm) ||
            bill.notes?.toLowerCase().includes(searchTerm) ||
            bill.accountNumber?.toLowerCase().includes(searchTerm);

        const matchesStatus = !statusFilter || bill.status === statusFilter;
        const matchesCategory = !categoryFilter || bill.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Always sort by newest first
    billsState.filteredBills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    renderBills();
}


// ============================================
// MODAL MANAGEMENT
// ============================================
function openCreateBillModal() {
    document.getElementById('createBillForm').reset();
    document.getElementById('createBillModal').classList.add('active');
}

// NOTE: Edit Modal HTML is not present in new design yet, 
// using Create Modal for simplicity or alerting user
function openEditBillModal(billId) {
    // For now, let's just use delete and recreate as a workaround 
    // or notify user it's coming soon if we strictly follow the provided HTML which didn't include Edit Modal
    // But to be helpful, let's support delete.
    // If strict on "Edit", we would need to add Edit Modal HTML back.
    // Let's rely on Create for now.
    alert("Functionality update in progress. Please delete and recreate for now.");
}

function openPayBillModal(billId) {
    const bill = billsState.bills.find(b => b.id === billId);
    if (!bill) return;

    billsState.currentBill = bill;

    const infoDiv = document.getElementById('payBillInfo');
    infoDiv.innerHTML = `
        <h3 style="margin-bottom:10px; color:var(--text-primary);">${escapeHtml(bill.title)}</h3>
        <div style="font-size:2rem; font-weight:800; color:var(--text-primary); margin-bottom:10px;">${Number(bill.amount).toFixed(2)} <span style="font-size:1rem; color:var(--text-tertiary);">MAD</span></div>
        <p style="color:var(--text-secondary);">Êtes-vous sûr de vouloir payer cette facture ?</p>
    `;

    document.getElementById('payBillModal').classList.add('active');
}


// ============================================
// BILL CRUD OPERATIONS
// ============================================
async function handleCreateBill(e) {
    e.preventDefault();

    const billData = {
        title: document.getElementById('billTitle').value,
        amount: Number(document.getElementById('billAmount').value),
        category: document.getElementById('billCategory').value,
        dueDate: document.getElementById('billDueDate').value || null,
        // accountNumber: document.getElementById('billAccountNumber').value || null, 
        // notes: document.getElementById('billNotes').value || null,
        // Using simplified form for now as per new HTML
    };

    // showLoader("Création de la facture...");

    try {
        const response = await fetch(`${API_BASE}/bills`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(billData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Erreur lors de la création");
        }

        showToast("✓ Facture créée avec succès", "success");
        closeModal('createBillModal');
        await loadBills();

    } catch (error) {
        console.error("Error creating bill:", error);
        showToast(error.message || "Erreur lors de la création", "error");
    } finally {
        hideLoader();
    }
}


async function confirmPayBill() {
    if (!billsState.currentBill) return;

    // showLoader("Traitement du paiement...");

    try {
        const response = await fetch(`${API_BASE}/bills/${billsState.currentBill.id}/pay`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Erreur lors du paiement");
        }

        showToast("✓ Facture payée avec succès", "success");
        closeModal('payBillModal');
        billsState.currentBill = null;
        await loadBills();

    } catch (error) {
        console.error("Error paying bill:", error);
        showToast(error.message || "Erreur lors du paiement", "error");
    } finally {
        hideLoader();
    }
}

async function deleteBill(billId) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
        return;
    }

    // showLoader("Suppression de la facture...");

    try {
        const response = await fetch(`${API_BASE}/bills/${billId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Erreur lors de la suppression");
        }

        showToast("✓ Facture supprimée avec succès", "success");
        await loadBills();

    } catch (error) {
        console.error("Error deleting bill:", error);
        showToast(error.message || "Erreur lors de la suppression", "error");
    } finally {
        hideLoader();
    }
}


// ============================================
// UI HELPERS
// ============================================
function showLoader() {
    // Optional: Implement if UI requires blocking interaction
}

function hideLoader() {
    // Optional
}

function showToast(message, type = 'info') {
    const container = document.body; // Append directly to body if no container

    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.style.marginTop = '10px';
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function getCategoryIcon(category) {
    const icons = {
        ELECTRICITY: '⚡',
        WATER: '💧',
        INTERNET: '🌐',
        PHONE: '📱',
        GAS: '🔥',
        INSURANCE: '🛡️',
        SUBSCRIPTION: '📺',
        RENT: '🏠',
        OTHER: '📋'
    };
    return icons[category] || '📋';
}

function getStatusText(status) {
    const texts = {
        PENDING: 'En attente',
        PAID: 'Payée',
        OVERDUE: 'En retard',
        CANCELLED: 'Annulée'
    };
    return texts[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getDaysUntilDue(dueDate) {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function logout() {
    localStorage.removeItem("access_token");
    window.location.href = "login.html";
}

// ============================================
// GLOBAL EXPORTS
// ============================================
// window.openCreateBillModal = openCreateBillModal; // Already defined in HTML mostly
// Exporting helpers if needed by inline HTML handlers
window.filterBills = filterBills;
window.logout = logout;
window.handleCreateBill = handleCreateBill;
window.openPayBillModal = openPayBillModal;
window.confirmPayBill = confirmPayBill;
window.deleteBill = deleteBill;
window.openCreateBillModal = openCreateBillModal;
