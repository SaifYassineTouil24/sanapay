// Analytics JavaScript
let monthlyChart, categoryChart, yearlyChart;

// Load all analytics
async function loadAnalytics() {
    try {
        await loadSummary();
        await loadMonthlyChart();
        await loadCategoryChart();
        await loadYearlyChart();
    } catch (error) {
        console.error('Error loading analytics:', error);
        if (error.message.includes('Unauthorized')) {
            logout();
        }
    }
}

// Load summary statistics
async function loadSummary() {
    try {
        const summary = await api.getAnalyticsSummary();
        
        document.getElementById('currentBalance').textContent = `${summary.balance.toFixed(2)} MAD`;
        document.getElementById('totalDeposits').textContent = `${summary.totalDeposits.toFixed(2)} MAD`;
        document.getElementById('totalWithdrawals').textContent = `${summary.totalWithdrawals.toFixed(2)} MAD`;
        document.getElementById('pendingBills').textContent = summary.bills.pending;
    } catch (error) {
        console.error('Error loading summary:', error);
    }
}

// Load monthly chart
async function loadMonthlyChart() {
    try {
        const data = await api.getMonthlyAnalytics();
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        
        if (monthlyChart) {
            monthlyChart.destroy();
        }
        
        monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.months.map(m => m.month),
                datasets: [
                    {
                        label: 'Dépôts',
                        data: data.months.map(m => m.deposits),
                        backgroundColor: 'rgba(72, 187, 120, 0.6)',
                        borderColor: '#48bb78',
                        borderWidth: 2
                    },
                    {
                        label: 'Retraits',
                        data: data.months.map(m => m.withdrawals),
                        backgroundColor: 'rgba(245, 101, 101, 0.6)',
                        borderColor: '#f56565',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' MAD';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' MAD';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading monthly chart:', error);
    }
}

// Load category chart
async function loadCategoryChart() {
    try {
        const data = await api.getCategoryAnalytics();
        
        // Display top bills
        const topBillsContainer = document.getElementById('topBillsContainer');
        if (data.topBills && data.topBills.length > 0) {
            topBillsContainer.innerHTML = `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border);">
                            <th style="text-align: left; padding: 0.75rem;">Titre</th>
                            <th style="text-align: left; padding: 0.75rem;">Catégorie</th>
                            <th style="text-align: right; padding: 0.75rem;">Montant</th>
                            <th style="text-align: center; padding: 0.75rem;">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.topBills.map(bill => `
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 0.75rem;">${bill.title}</td>
                                <td style="padding: 0.75rem;">${getCategoryName(bill.category)}</td>
                                <td style="padding: 0.75rem; text-align: right; font-weight: bold; color: var(--primary);">
                                    ${bill.amount.toFixed(2)} MAD
                                </td>
                                <td style="padding: 0.75rem; text-align: center;">
                                    <span class="bill-status ${bill.status.toLowerCase()}">${getStatusText(bill.status)}</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            topBillsContainer.innerHTML = '<p class="text-center">Aucune facture trouvée</p>';
        }
        
        // Create pie chart
        if (data.categories && data.categories.length > 0) {
            const ctx = document.getElementById('categoryChart').getContext('2d');
            
            if (categoryChart) {
                categoryChart.destroy();
            }
            
            const colors = [
                '#667eea', '#764ba2', '#48bb78', '#f56565', '#ed8936',
                '#4299e1', '#9f7aea', '#38b2ac', '#f687b3'
            ];
            
            categoryChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: data.categories.map(c => getCategoryName(c.category)),
                    datasets: [{
                        data: data.categories.map(c => c.total),
                        backgroundColor: colors.slice(0, data.categories.length),
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value.toFixed(2)} MAD (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading category chart:', error);
    }
}

// Load yearly chart
async function loadYearlyChart() {
    try {
        const data = await api.getYearlyAnalytics();
        const ctx = document.getElementById('yearlyChart').getContext('2d');
        
        if (yearlyChart) {
            yearlyChart.destroy();
        }
        
        yearlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.years.map(y => y.year),
                datasets: [
                    {
                        label: 'Dépôts',
                        data: data.years.map(y => y.deposits),
                        borderColor: '#48bb78',
                        backgroundColor: 'rgba(72, 187, 120, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Retraits',
                        data: data.years.map(y => y.withdrawals),
                        borderColor: '#f56565',
                        backgroundColor: 'rgba(245, 101, 101, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Net',
                        data: data.years.map(y => y.net),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' MAD';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' MAD';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading yearly chart:', error);
    }
}

// Helper functions
function getCategoryName(category) {
    const names = {
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
    return names[category] || category;
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

// Logout function
function logout() {
    api.clearToken();
    window.location.href = 'login.html';
}

// Load analytics on page load
loadAnalytics();
