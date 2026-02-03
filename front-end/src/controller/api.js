// API Service - Central API communication
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    getToken() {
        return this.token || localStorage.getItem('token');
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.getToken()) {
            headers['Authorization'] = `Bearer ${this.getToken()}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Une erreur est survenue');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async getMe() {
        return this.request('/auth/me');
    }

    // User endpoints
    async getProfile() {
        return this.request('/user/profile');
    }

    async updateProfile(data) {
        return this.request('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async changePassword(data) {
        return this.request('/user/password', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Transaction endpoints
    async deposit(amount, description) {
        return this.request('/transactions/deposit', {
            method: 'POST',
            body: JSON.stringify({ amount, description }),
        });
    }

    async withdraw(amount, description) {
        return this.request('/transactions/withdraw', {
            method: 'POST',
            body: JSON.stringify({ amount, description }),
        });
    }

    async getTransactions(limit = 50) {
        return this.request(`/transactions/history?limit=${limit}`);
    }

    async getStats() {
        return this.request('/transactions/stats');
    }

    // Bills endpoints
    async getBills(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/bills?${params}`);
    }

    async createBill(billData) {
        return this.request('/bills', {
            method: 'POST',
            body: JSON.stringify(billData),
        });
    }

    async getBill(id) {
        return this.request(`/bills/${id}`);
    }

    async updateBill(id, data) {
        return this.request(`/bills/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteBill(id) {
        return this.request(`/bills/${id}`, {
            method: 'DELETE',
        });
    }

    async payBill(id) {
        return this.request(`/bills/${id}/pay`, {
            method: 'POST',
        });
    }

    // Analytics endpoints
    async getAnalyticsSummary() {
        return this.request('/analytics/summary');
    }

    async getMonthlyAnalytics() {
        return this.request('/analytics/monthly');
    }

    async getYearlyAnalytics() {
        return this.request('/analytics/yearly');
    }

    async getCategoryAnalytics() {
        return this.request('/analytics/categories');
    }
}

// Create global instance
const api = new ApiService();
