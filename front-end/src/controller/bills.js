/**
 * ====================================
 * SANAPAY - BILLS MANAGEMENT
 * ====================================
 * Gestion complète des factures avec API
 * @version 1.0.0
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
    updateStats();
});

// ============================================
// BILLS DATA LOADING
// ============================================
async function loadBills() {
    showLoader("Chargement des factures...");
    
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
        updateStats();
        
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
        <div class="bills-grid-layout">
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
        <div class="bill-card-item ${statusClass}" data-bill-id="${bill.id}">
            <div class="bill-card-header">
                <span class="bill-icon">${categoryIcon}</span>
                <span class="bill-status-badge ${statusClass}">${statusText}</span>
            </div>
            
            <div class="bill-card-body">
                <h3 class="bill-title">${escapeHtml(bill.title)}</h3>
                <div class="bill-amount">${Number(bill.amount).toFixed(2)} <span class="currency">MAD</span></div>
                
                <div class="bill-details">
                    ${bill.dueDate ? `
                        <div class="bill-detail-row">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Échéance: ${formattedDate}</span>
                        </div>
                        ${daysUntilDue !== null ? `
                            <div class="bill-detail-row ${daysUntilDue < 0 ? 'overdue-text' : daysUntilDue <= 7 ? 'warning-text' : ''}">
                                <i class="fas fa-clock"></i>
                                <span>${daysUntilDue < 0 ? Math.abs(daysUntilDue) + ' jours de retard' : daysUntilDue === 0 ? "Aujourd'hui" : 'Dans ' + daysUntilDue + ' jours'}</span>
                            </div>
                        ` : ''}
                    ` : ''}
                    
                    ${bill.accountNumber ? `
                        <div class="bill-detail-row">
                            <i class="fas fa-hashtag"></i>
                            <span>${escapeHtml(bill.accountNumber)}</span>
                        </div>
                    ` : ''}
                    
                    ${bill.notes ? `
                        <div class="bill-detail-row">
                            <i class="fas fa-sticky-note"></i>
                            <span>${escapeHtml(bill.notes)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="bill-card-footer">
                ${bill.status === 'PENDING' ? `
                    <button onclick="openPayBillModal('${bill.id}')" class="btn-bill-action btn-pay">
                        <i class="fas fa-credit-card"></i>
                        Payer
                    </button>
                ` : ''}
                
                <button onclick="openEditBillModal('${bill.id}')" class="btn-bill-action btn-edit">
                    <i class="fas fa-edit"></i>
                    Modifier
                </button>
                
                <button onclick="deleteBill('${bill.id}')" class="btn-bill-action btn-delete">
                    <i class="fas fa-trash"></i>
                    Supprimer
                </button>
            </div>
        </div>
    `;
}

function renderEmptyState(message = null) {
    const container = document.getElementById('billsContainer');
    container.innerHTML = `
        <div class="empty-state-bills">
            <i class="fas fa-file-invoice fa-4x"></i>
            <h3>${message || 'Aucune facture trouvée'}</h3>
            <p>Commencez par créer votre première facture</p>
            ${!message ? '<button onclick="openCreateBillModal()" class="btn btn-primary"><i class="fas fa-plus"></i> Créer une facture</button>' : ''}
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
    const sortFilter = document.getElementById('sortFilter')?.value || 'date-desc';
    
    billsState.filters = {
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
        sort: sortFilter
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
    
    // Sort
    billsState.filteredBills.sort((a, b) => {
        switch (sortFilter) {
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'amount-desc':
                return b.amount - a.amount;
            case 'amount-asc':
                return a.amount - b.amount;
            default:
                return 0;
        }
    });
    
    renderBills();
}

// ============================================
// STATS UPDATE
// ============================================
function updateStats() {
    const stats = {
        pending: { count: 0, amount: 0 },
        paid: { count: 0, amount: 0 },
        overdue: { count: 0, amount: 0 },
        total: { count: 0, amount: 0 }
    };
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    billsState.bills.forEach(bill => {
        const billDate = new Date(bill.createdAt);
        const isCurrentMonth = billDate.getMonth() === currentMonth && 
                              billDate.getFullYear() === currentYear;
        
        if (isCurrentMonth) {
            stats.total.count++;
            stats.total.amount += Number(bill.amount);
        }
        
        if (bill.status === 'PENDING') {
            stats.pending.count++;
            stats.pending.amount += Number(bill.amount);
        } else if (bill.status === 'PAID') {
            stats.paid.count++;
            stats.paid.amount += Number(bill.amount);
        } else if (bill.status === 'OVERDUE') {
            stats.overdue.count++;
            stats.overdue.amount += Number(bill.amount);
        }
    });
    
    // Update DOM
    document.getElementById('pendingCount').textContent = stats.pending.count;
    document.getElementById('pendingAmount').textContent = stats.pending.amount.toFixed(2) + ' MAD';
    
    document.getElementById('paidCount').textContent = stats.paid.count;
    document.getElementById('paidAmount').textContent = stats.paid.amount.toFixed(2) + ' MAD';
    
    document.getElementById('overdueCount').textContent = stats.overdue.count;
    document.getElementById('overdueAmount').textContent = stats.overdue.amount.toFixed(2) + ' MAD';
    
    document.getElementById('totalCount').textContent = stats.total.count;
    document.getElementById('totalAmount').textContent = stats.total.amount.toFixed(2) + ' MAD';
}

// ============================================
// MODAL MANAGEMENT
// ============================================
function openCreateBillModal() {
    document.getElementById('createBillForm').reset();
    openModal('createBillModal');
}

function openEditBillModal(billId) {
    const bill = billsState.bills.find(b => b.id === billId);
    if (!bill) return;
    
    document.getElementById('editBillId').value = bill.id;
    document.getElementById('editBillTitle').value = bill.title;
    document.getElementById('editBillAmount').value = bill.amount;
    document.getElementById('editBillCategory').value = bill.category;
    document.getElementById('editBillDueDate').value = bill.dueDate || '';
    document.getElementById('editBillAccountNumber').value = bill.accountNumber || '';
    document.getElementById('editBillNotes').value = bill.notes || '';
    
    openModal('editBillModal');
}

function openPayBillModal(billId) {
    const bill = billsState.bills.find(b => b.id === billId);
    if (!bill) return;
    
    billsState.currentBill = bill;
    
    const infoDiv = document.getElementById('payBillInfo');
    infoDiv.innerHTML = `
        <div class="payment-detail-row">
            <span class="payment-label">Facture:</span>
            <span class="payment-value">${escapeHtml(bill.title)}</span>
        </div>
        <div class="payment-detail-row">
            <span class="payment-label">Montant:</span>
            <span class="payment-value payment-amount">${Number(bill.amount).toFixed(2)} MAD</span>
        </div>
        ${bill.accountNumber ? `
            <div class="payment-detail-row">
                <span class="payment-label">Compte:</span>
                <span class="payment-value">${escapeHtml(bill.accountNumber)}</span>
            </div>
        ` : ''}
        ${bill.dueDate ? `
            <div class="payment-detail-row">
                <span class="payment-label">Échéance:</span>
                <span class="payment-value">${formatDate(bill.dueDate)}</span>
            </div>
        ` : ''}
    `;
    
    openModal('payBillModal');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
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
        accountNumber: document.getElementById('billAccountNumber').value || null,
        notes: document.getElementById('billNotes').value || null,
    };
    
    showLoader("Création de la facture...");
    
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

async function handleEditBill(e) {
    e.preventDefault();
    
    const billId = document.getElementById('editBillId').value;
    const billData = {
        title: document.getElementById('editBillTitle').value,
        amount: Number(document.getElementById('editBillAmount').value),
        category: document.getElementById('editBillCategory').value,
        dueDate: document.getElementById('editBillDueDate').value || null,
        accountNumber: document.getElementById('editBillAccountNumber').value || null,
        notes: document.getElementById('editBillNotes').value || null,
    };
    
    showLoader("Modification de la facture...");
    
    try {
        const response = await fetch(`${API_BASE}/bills/${billId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(billData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || "Erreur lors de la modification");
        }
        
        showToast("✓ Facture modifiée avec succès", "success");
        closeModal('editBillModal');
        await loadBills();
        
    } catch (error) {
        console.error("Error updating bill:", error);
        showToast(error.message || "Erreur lors de la modification", "error");
    } finally {
        hideLoader();
    }
}

async function confirmPayBill() {
    if (!billsState.currentBill) return;
    
    showLoader("Traitement du paiement...");
    
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
    
    showLoader("Suppression de la facture...");
    
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
// EXPORT FUNCTIONALITY
// ============================================
async function exportBills() {
    showLoader("Génération du fichier...");
    
    try {
        // Prepare CSV data
        const csvData = [
            ['Titre', 'Montant', 'Catégorie', 'Statut', 'Échéance', 'Compte', 'Notes'].join(',')
        ];
        
        billsState.bills.forEach(bill => {
            csvData.push([
                `"${bill.title}"`,
                bill.amount,
                bill.category,
                bill.status,
                bill.dueDate || '',
                bill.accountNumber || '',
                `"${bill.notes || ''}"`
            ].join(','));
        });
        
        const csvContent = csvData.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `factures_sanapay_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast("✓ Export réussi", "success");
        
    } catch (error) {
        console.error("Error exporting bills:", error);
        showToast("Erreur lors de l'export", "error");
    } finally {
        hideLoader();
    }
}

// ============================================
// UI HELPERS
// ============================================
function showLoader(message = "Chargement...") {
    const loader = document.getElementById('globalLoader');
    const messageEl = loader?.querySelector('.loader-message');
    if (messageEl) messageEl.textContent = message;
    loader?.classList.add('show');
}

function hideLoader() {
    const loader = document.getElementById('globalLoader');
    loader?.classList.remove('show');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">✕</button>
    `;
    
    container.appendChild(toast);
    
    // Show animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
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
        month: 'long',
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
window.openCreateBillModal = openCreateBillModal;
window.openEditBillModal = openEditBillModal;
window.openPayBillModal = openPayBillModal;
window.confirmPayBill = confirmPayBill;
window.deleteBill = deleteBill;
window.closeModal = closeModal;
window.closeModals = closeModals;
window.filterBills = filterBills;
window.exportBills = exportBills;
window.logout = logout;
window.handleCreateBill = handleCreateBill;
window.handleEditBill = handleEditBill;
