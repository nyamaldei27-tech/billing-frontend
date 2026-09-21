import api from "./api";

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
  const response = await api.get<Plan[]>(
    `/api/plans`
  );

  return response.data;
};

export const createPlan = async (
  plan: PlanRequest
): Promise<Plan> => {
  const response = await api.post<Plan>(
    `/api/plans`,
    plan
  );

  return response.data;
};

export const updatePlan = async (
  id: number,
  plan: PlanRequest
): Promise<Plan> => {
  const response = await api.put<Plan>(
    `/api/plans/${id}`,
    plan
  );

  return response.data;
};

export const deletePlan = async (
  id: number
): Promise<void> => {
  await api.delete(
    `/api/plans/${id}`
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
  const response = await api.get<Subscription[]>(
    `/api/subscriptions`
  );

  return response.data;
};

export const createSubscription = async (
  subscription: SubscriptionRequest
): Promise<Subscription> => {
  const response = await api.post<Subscription>(
    `/api/subscriptions`,
    subscription
  );

  return response.data;
};

export const getSubscriptionById = async (
  id: number
): Promise<Subscription> => {
  const response = await api.get<Subscription>(
    `/api/subscriptions/${id}`
  );

  return response.data;
};

export const cancelSubscription = async (
  id: number
): Promise<Subscription> => {
  const response = await api.put<Subscription>(
    `/api/subscriptions/${id}/cancel`
  );

  return response.data;
};

export const getSubscriptionsByCustomerId = async (
  customerId: number
): Promise<Subscription[]> => {
  const response = await api.get<Subscription[]>(
    `/api/subscriptions/customer/${customerId}`
  );

  return response.data;
};

export const getChurnRisk = async (
    customerId: number
): Promise<ChurnRisk> => {
    const response = await api.get<ChurnRisk>(
        `/api/churn-risk/customer/${customerId}`
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
  receiptUrl: string | null;
}

export const getInvoices = async (): Promise<Invoice[]> => {
  const response = await api.get<Invoice[]>(
    `/api/invoices`
  );

  return response.data;
};

export const getInvoiceById = async (
  id: number
): Promise<Invoice> => {
  const response = await api.get<Invoice>(
    `/api/invoices/${id}`
  );

  return response.data;
};

export const getInvoicesByCustomerId = async (
  customerId: number
): Promise<Invoice[]> => {
  const response = await api.get<Invoice[]>(
    `/api/invoices/customer/${customerId}`
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
  const response = await api.post<Invoice>(
    `/api/invoices/${invoiceId}/payment`,
    {
      status: "SUCCESS",
    }
  );

  return response.data;
};

export const getPaymentAttempts =
  async (): Promise<PaymentAttempt[]> => {
    const response =
      await api.get<PaymentAttempt[]>(
        `/api/payment-attempts`
      );

    return response.data;
  };

export const getPaymentAttemptsByCustomerId = async (
  customerId: number
): Promise<PaymentAttempt[]> => {
  const response = await api.get<PaymentAttempt[]>(
    `/api/payment-attempts/customer/${customerId}`
  );

  return response.data;
};

export const changeSubscriptionPlan = async (
  subscriptionId: number,
  planId: number
): Promise<Subscription> => {
  const response = await api.put<Subscription>(
    `/api/subscriptions/${subscriptionId}/plan`,
    {
      planId,
    }
  );

  return response.data;
};

export interface ChurnRisk {
    customerId: number;
    riskScore: number;
    riskLevel: string;
}
