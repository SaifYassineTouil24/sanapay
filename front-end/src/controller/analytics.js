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

        // Dark Mode Colors
        Chart.defaults.color = '#9ca3af';
        Chart.defaults.borderColor = 'rgba(75, 85, 99, 0.4)';

        monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.months.map(m => m.month),
                datasets: [
                    {
                        label: 'Dépôts',
                        data: data.months.map(m => m.deposits),
                        backgroundColor: '#10b981',
                        borderRadius: 4,
                        barPercentage: 0.6,
                    },
                    {
                        label: 'Retraits',
                        data: data.months.map(m => m.withdrawals),
                        backgroundColor: '#ef4444',
                        borderRadius: 4,
                        barPercentage: 0.6,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#e5e7eb' }
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [4, 4] }
                    },
                    x: {
                        grid: { display: false }
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

        // Display top bills (HTML generation remains same, ensuring classes match CSS)
        const topBillsContainer = document.getElementById('topBillsContainer');
        if (data.topBills && data.topBills.length > 0) {
            topBillsContainer.innerHTML = `
                <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
                    <tbody>
                        ${data.topBills.map(bill => `
                            <tr style="background: var(--bg-tertiary); border-radius: 8px;">
                                <td style="padding: 12px; border-radius: 8px 0 0 8px; color: var(--text-primary); font-weight:500;">${bill.title}</td>
                                <td style="padding: 12px; color: var(--text-secondary);">${getCategoryName(bill.category)}</td>
                                <td style="padding: 12px; text-align: right; font-weight: 700; color: var(--text-primary);">
                                    ${bill.amount.toFixed(2)} MAD
                                </td>
                                <td style="padding: 12px; text-align: center; border-radius: 0 8px 8px 0;">
                                    <span class="bill-status-badge ${bill.status.toLowerCase()}">${getStatusText(bill.status)}</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            topBillsContainer.innerHTML = '<p class="text-center" style="padding:20px;">Aucune facture trouvée</p>';
        }

        // Create pie chart
        if (data.categories && data.categories.length > 0) {
            const ctx = document.getElementById('categoryChart').getContext('2d');

            if (categoryChart) {
                categoryChart.destroy();
            }

            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

            categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.categories.map(c => getCategoryName(c.category)),
                    datasets: [{
                        data: data.categories.map(c => c.total),
                        backgroundColor: colors,
                        borderColor: '#1f2937',
                        borderWidth: 2,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { color: '#e5e7eb', boxWidth: 12 }
                        }
                    },
                    cutout: '70%'
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
                        label: 'Net',
                        data: data.years.map(y => y.net),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#3b82f6',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Revenus',
                        data: data.years.map(y => y.deposits),
                        borderColor: '#10b981',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#e5e7eb' } }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(75, 85, 99, 0.2)' }
                    },
                    x: {
                        grid: { display: false }
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
