const API_BASE = 'http://localhost:3000';


// Bills Management JavaScript
let currentBillId = null;

// Category icons mapping
const categoryIcons = {
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

// Category names in French
const categoryNames = {
    ELECTRICITY: 'Électricité',
    WATER: 'Eau',
    INTERNET: 'Internet',
    PHONE: 'Téléphone',
    GAS: 'Gaz',
    INSURANCE: 'Assurance',
    SUBSCRIPTION: 'Abonnement',
    RENT: 'Loyer',
    OTHER: 'Autre'
};

// Load all bills
async function loadBills() {
    try {
        const statusFilter = document.getElementById('statusFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        const filters = {};
        if (statusFilter) filters.status = statusFilter;
        if (categoryFilter) filters.category = categoryFilter;
        
        const response = await api.getBills(filters);
        displayBills(response.bills);
    } catch (error) {
        console.error('Error loading bills:', error);
        document.getElementById('billsContainer').innerHTML = 
            `<p class="text-center" style="color: var(--danger);">Erreur: ${error.message}</p>`;
    }
}

// Display bills
function displayBills(bills) {
    const container = document.getElementById('billsContainer');
    
    if (bills.length === 0) {
        container.innerHTML = '<p class="text-center">Aucune facture trouvée</p>';
        return;
    }
    
    container.innerHTML = bills.map(bill => `
        <div class="bill-card">
            <div class="bill-header">
                <div class="bill-category-icon">${categoryIcons[bill.category] || '📋'}</div>
                <span class="bill-status ${bill.status.toLowerCase()}">${getStatusText(bill.status)}</span>
            </div>
            <div class="bill-title">${bill.title}</div>
            <div class="bill-amount">${bill.amount.toFixed(2)} MAD</div>
            <div class="bill-details">
                <p><strong>Catégorie:</strong> ${categoryNames[bill.category] || bill.category}</p>
                ${bill.dueDate ? `<p><strong>Échéance:</strong> ${formatDate(bill.dueDate)}</p>` : ''}
                ${bill.accountNumber ? `<p><strong>Compte:</strong> ${bill.accountNumber}</p>` : ''}
                ${bill.notes ? `<p><strong>Notes:</strong> ${bill.notes}</p>` : ''}
            </div>
            <div class="bill-actions">
                ${bill.status === 'PENDING' || bill.status === 'OVERDUE' ? 
                    `<button onclick="openPayBillModal('${bill.id}')" class="btn btn-sm btn-success">💰 Payer</button>` : ''}
                ${bill.status !== 'PAID' ? 
                    `<button onclick="openEditBillModal('${bill.id}')" class="btn btn-sm btn-primary">✏️ Modifier</button>` : ''}
                ${bill.status !== 'PAID' ? 
                    `<button onclick="deleteBill('${bill.id}')" class="btn btn-sm btn-danger">🗑️ Supprimer</button>` : ''}
            </div>
        </div>
    `).join('');
}

// Get status text in French
function getStatusText(status) {
    const statusTexts = {
        PENDING: 'En attente',
        PAID: 'Payée',
        OVERDUE: 'En retard',
        CANCELLED: 'Annulée'
    };
    return statusTexts[status] || status;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Filter bills
function filterBills() {
    loadBills();
}

// Open create bill modal
function openCreateBillModal() {
    document.getElementById('createBillModal').style.display = 'block';
    document.getElementById('createBillForm').reset();
}

// Open edit bill modal
async function openEditBillModal(billId) {
    try {
        const bill = await api.getBill(billId);
        
        document.getElementById('editBillId').value = bill.id;
        document.getElementById('editBillTitle').value = bill.title;
        document.getElementById('editBillAmount').value = bill.amount;
        document.getElementById('editBillCategory').value = bill.category;
        document.getElementById('editBillDueDate').value = bill.dueDate ? bill.dueDate.split('T')[0] : '';
        document.getElementById('editBillAccountNumber').value = bill.accountNumber || '';
        document.getElementById('editBillNotes').value = bill.notes || '';
        
        document.getElementById('editBillModal').style.display = 'block';
    } catch (error) {
        alert('Erreur: ' + error.message);
    }
}

// Open pay bill modal
async function openPayBillModal(billId) {
    try {
        const bill = await api.getBill(billId);
        currentBillId = billId;
        
        document.getElementById('payBillInfo').innerHTML = `
            <div style="padding: 1rem; background: var(--light); border-radius: 8px; margin-bottom: 1rem;">
                <h4>${bill.title}</h4>
                <p style="font-size: 1.5rem; font-weight: bold; color: var(--primary); margin: 1rem 0;">
                    ${bill.amount.toFixed(2)} MAD
                </p>
                <p><strong>Catégorie:</strong> ${categoryNames[bill.category]}</p>
                ${bill.dueDate ? `<p><strong>Échéance:</strong> ${formatDate(bill.dueDate)}</p>` : ''}
            </div>
            <p style="color: var(--warning);">⚠️ Le montant sera déduit de votre portefeuille.</p>
        `;
        
        document.getElementById('payBillModal').style.display = 'block';
    } catch (error) {
        alert('Erreur: ' + error.message);
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Create bill form handler
document.getElementById('createBillForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const billData = {
        title: document.getElementById('billTitle').value,
        amount: parseFloat(document.getElementById('billAmount').value),
        category: document.getElementById('billCategory').value,
        dueDate: document.getElementById('billDueDate').value || undefined,
        accountNumber: document.getElementById('billAccountNumber').value || undefined,
        notes: document.getElementById('billNotes').value || undefined
    };
    
    try {
        await api.createBill(billData);
        closeModal('createBillModal');
        await loadBills();
        alert('Facture créée avec succès!');
    } catch (error) {
        alert('Erreur: ' + error.message);
    }
});

// Edit bill form handler
document.getElementById('editBillForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const billId = document.getElementById('editBillId').value;
    const billData = {
        title: document.getElementById('editBillTitle').value,
        amount: parseFloat(document.getElementById('editBillAmount').value),
        category: document.getElementById('editBillCategory').value,
        dueDate: document.getElementById('editBillDueDate').value || undefined,
        accountNumber: document.getElementById('editBillAccountNumber').value || undefined,
        notes: document.getElementById('editBillNotes').value || undefined
    };
    
    try {
        await api.updateBill(billId, billData);
        closeModal('editBillModal');
        await loadBills();
        alert('Facture mise à jour avec succès!');
    } catch (error) {
        alert('Erreur: ' + error.message);
    }
});

// Confirm pay bill
async function confirmPayBill() {
    if (!currentBillId) return;
    
    try {
        const result = await api.payBill(currentBillId);
        closeModal('payBillModal');
        await loadBills();
        alert(`Facture payée avec succès! Nouveau solde: ${result.remainingBalance.toFixed(2)} MAD`);
        currentBillId = null;
    } catch (error) {
        alert('Erreur: ' + error.message);
    }
}

// Delete bill
async function deleteBill(billId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture?')) return;
    
    try {
        await api.deleteBill(billId);
        await loadBills();
        alert('Facture supprimée avec succès!');
    } catch (error) {
        alert('Erreur: ' + error.message);
    }
}

// Logout function
function logout() {
    api.clearToken();
    window.location.href = 'login.html';
}

// Load bills on page load
loadBills();
