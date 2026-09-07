import axios from "axios";

const API_URL = "http://localhost:8083";

export interface Plan {
  id: number;
  name: string;
  priceCents: number;
  billingCycle: string;
}

export interface PlanRequest {
  name: string;
  priceCents: number;
  billingCycle: string;
}

export const getPlans = async (): Promise<Plan[]> => {
  const response = await axios.get<Plan[]>(
    `${API_URL}/api/plans`
  );

  return response.data;
};

export const createPlan = async (
  plan: PlanRequest
): Promise<Plan> => {
  const response = await axios.post<Plan>(
    `${API_URL}/api/plans`,
    plan
  );

  return response.data;
};

export const updatePlan = async (
  id: number,
  plan: PlanRequest
): Promise<Plan> => {
  const response = await axios.put<Plan>(
    `${API_URL}/api/plans/${id}`,
    plan
  );

  return response.data;
};

export const deletePlan = async (
  id: number
): Promise<void> => {
  await axios.delete(
    `${API_URL}/api/plans/${id}`
  );
};


/* =========================
   SUBSCRIPTIONS
   ========================= */

export interface Subscription {
  id: number;
  customerId: number;
  planId: number;
  status: string;
  currentPeriodEnd: string;
}

export interface SubscriptionRequest {
  customerId: number;
  planId: number;
}

export const getSubscriptions = async (): Promise<Subscription[]> => {
  const response = await axios.get<Subscription[]>(
    `${API_URL}/api/subscriptions`
  );

  return response.data;
};

export const createSubscription = async (
  subscription: SubscriptionRequest
): Promise<Subscription> => {
  const response = await axios.post<Subscription>(
    `${API_URL}/api/subscriptions`,
    subscription
  );

  return response.data;
};

export const getSubscriptionById = async (
  id: number
): Promise<Subscription> => {
  const response = await axios.get<Subscription>(
    `${API_URL}/api/subscriptions/${id}`
  );

  return response.data;
};

export const cancelSubscription = async (
  id: number
): Promise<Subscription> => {
  const response = await axios.put<Subscription>(
    `${API_URL}/api/subscriptions/${id}/cancel`
  );

  return response.data;
};

export const getSubscriptionsByCustomerId = async (
  customerId: number
): Promise<Subscription[]> => {
  const response = await axios.get<Subscription[]>(
    `${API_URL}/api/subscriptions/customer/${customerId}`
  );

  return response.data;
};


/* =========================
   INVOICES
   ========================= */

export interface Invoice {
  id: number;
  subscriptionId: number;
  customerId: number;
  amountCents: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
}

export const getInvoices = async (): Promise<Invoice[]> => {
  const response = await axios.get<Invoice[]>(
    `${API_URL}/api/invoices`
  );

  return response.data;
};

export const getInvoiceById = async (
  id: number
): Promise<Invoice> => {
  const response = await axios.get<Invoice>(
    `${API_URL}/api/invoices/${id}`
  );

  return response.data;
};

export const getInvoicesByCustomerId = async (
  customerId: number
): Promise<Invoice[]> => {
  const response = await axios.get<Invoice[]>(
    `${API_URL}/api/invoices/customer/${customerId}`
  );

  return response.data;
};


/* =========================
   PAYMENTS
   ========================= */

export interface PaymentRequest {
  status: string;
}

export interface PaymentAttempt {
  id: number;
  invoiceId: number;
  status: string;
  attemptedAt: string;
}

export const payInvoice = async (
  invoiceId: number
): Promise<Invoice> => {
  const response = await axios.post<Invoice>(
    `${API_URL}/api/invoices/${invoiceId}/payment`,
    {
      status: "SUCCESS",
    }
  );

  return response.data;
};

export const getPaymentAttempts =
  async (): Promise<PaymentAttempt[]> => {
    const response =
      await axios.get<PaymentAttempt[]>(
        `${API_URL}/api/payment-attempts`
      );

    return response.data;
  };

export const getPaymentAttemptsByCustomerId = async (
  customerId: number
): Promise<PaymentAttempt[]> => {
  const response = await axios.get<PaymentAttempt[]>(
    `${API_URL}/api/payment-attempts/customer/${customerId}`
  );

  return response.data;
};

export const changeSubscriptionPlan = async (
  subscriptionId: number,
  planId: number
): Promise<Subscription> => {
  const response = await axios.put<Subscription>(
    `${API_URL}/api/subscriptions/${subscriptionId}/plan`,
    {
      planId,
    }
  );

  return response.data;
};