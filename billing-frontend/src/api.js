import axios from 'axios';

// Ensure this matches your actual running Spring Boot port (e.g., 8080 or 8088)
const API_BASE_URL = 'http://localhost:8088/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const billingApi = {

    // ==========================================
    // CUSTOMER & PLAN CONTROLLER ENDPOINTS
    // ==========================================

    // --- Plan Routes ---
    getPlans: () =>
        apiClient.get('/plans').then(res => res.data), // Returns list of Plan entities

    getPlanById: (id) =>
        apiClient.get(`/plans/${id}`).then(res => res.data),

    createPlan: (planData) =>
        apiClient.post('/plans', planData).then(res => res.data), // Payload: { name, billingCycle, priceCents }

    // --- Customer Routes ---
    getAllCustomers: () =>
        apiClient.get('/customers').then(res => res.data),

    getCustomerById: (id) =>
        apiClient.get(`/customers/${id}`).then(res => res.data),

    createCustomer: (customerRequestPayload) =>
        apiClient.post('/customers', customerRequestPayload).then(res => res.data), // Payload matches CustomerRequest DTO
    // --- BILLING CONTROLLER ENDPOINTS ---

    // 1. Subscription Endpoints
    createSubscription: (subRequest) =>
        apiClient.post('/subscriptions', subRequest).then(res => res.data), // Payload: { customerId: X, planId: Y }

    getAllSubscriptions: () =>
        apiClient.get('/subscriptions').then(res => res.data),

    getSubscriptionById: (id) =>
        apiClient.get(`/subscriptions/${id}`).then(res => res.data),

    // 2. Invoice Endpoints
    getAllInvoices: () =>
        apiClient.get('/invoices').then(res => res.data),

    getInvoiceById: (id) =>
        apiClient.get(`/invoices/${id}`).then(res => res.data),

    getInvoicesByCustomer: (customerId) =>
        apiClient.get(`/invoices/customer/${customerId}`).then(res => res.data),

    // 3. Payment Processing Endpoints
    payInvoiceViaPath: (invoiceId, statusString) =>
        apiClient.post(`/invoices/${invoiceId}/payment`, { status: statusString }).then(res => res.data), // status: "SUCCESS" or "FAILED"

    processPaymentViaBody: (paymentRequest) =>
        apiClient.post('/payments/process', paymentRequest).then(res => res.data), // Payload: { invoiceId: X, status: "SUCCESS" }

    // 4. Payment Attempts & Churn Analytics Endpoints
    getAllPaymentAttempts: () =>
        apiClient.get('/payment-attempts').then(res => res.data),

    getPaymentAttemptsByCustomer: (customerId) =>
        apiClient.get(`/customers/${customerId}/payment-attempts`).then(res => res.data),
};