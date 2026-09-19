import { create } from "zustand";

import {
  createPlan,
  getPlans,
  updatePlan,
  deletePlan,
  createSubscription,
  getSubscriptions,
  getSubscriptionsByCustomerId,
  cancelSubscription,
  changeSubscriptionPlan,
  getInvoices,
  getInvoicesByCustomerId,
  getInvoiceById,
  payInvoice,
  getPaymentAttempts,
  getPaymentAttemptsByCustomerId,
  getChurnRisk,
  type Plan,
  type Subscription,
  type Invoice,
  type PaymentAttempt,
  type ChurnRisk,
} from "../services/billingService";

interface BillingState {
  plans: Plan[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  paymentAttempts: PaymentAttempt[];

  /*
   * Churn risks are now stored for multiple customers.
   *
   * Example:
   * {
   *   1: { customerId: 1, riskScore: 20, riskLevel: "LOW" },
   *   2: { customerId: 2, riskScore: 75, riskLevel: "HIGH" }
   * }
   */
  churnRisks: Record<number, ChurnRisk>;

  loadingPlans: boolean;
  loadingSubscriptions: boolean;
  loadingInvoices: boolean;
  loadingPaymentAttempts: boolean;
  loadingChurnRisk: boolean;

  plansError: string | null;
  subscriptionsError: string | null;
  invoicesError: string | null;
  paymentAttemptsError: string | null;
  churnRiskError: string | null;

  /* PLANS */

  fetchPlans: () => Promise<void>;

  createPlan: (plan: {
    name: string;
    priceCents: number;
    billingCycle: string;
  }) => Promise<void>;

  updatePlan: (
    id: number,
    plan: {
      name: string;
      priceCents: number;
      billingCycle: string;
    }
  ) => Promise<void>;

  deletePlan: (id: number) => Promise<void>;

  /* SUBSCRIPTIONS */

  fetchSubscriptions: () => Promise<void>;

  fetchSubscriptionsByCustomerId: (
    customerId: number
  ) => Promise<void>;

  createSubscription: (subscription: {
    customerId: number;
    planId: number;
  }) => Promise<void>;

  cancelSubscription: (
    id: number
  ) => Promise<void>;

  changeSubscriptionPlan: (
    id: number,
    planId: number
  ) => Promise<void>;

  /* INVOICES */

  fetchInvoices: () => Promise<void>;

  fetchInvoiceById: (
    id: number
  ) => Promise<Invoice | null>;

  fetchInvoicesByCustomerId: (
    customerId: number
  ) => Promise<void>;

  payInvoice: (
    invoiceId: number
  ) => Promise<void>;

  /* PAYMENT ATTEMPTS */

  fetchPaymentAttempts: () => Promise<void>;

  fetchPaymentAttemptsByCustomerId: (
    customerId: number
  ) => Promise<void>;

  /* CHURN RISK */

  fetchChurnRisk: (
    customerId: number
  ) => Promise<void>;

  fetchChurnRisks: (
    customerIds: number[]
  ) => Promise<void>;
}

const useBillingStore = create<BillingState>((set) => ({
  plans: [],
  subscriptions: [],
  invoices: [],
  paymentAttempts: [],

  churnRisks: {},

  loadingPlans: false,
  loadingSubscriptions: false,
  loadingInvoices: false,
  loadingPaymentAttempts: false,
  loadingChurnRisk: false,

  plansError: null,
  subscriptionsError: null,
  invoicesError: null,
  paymentAttemptsError: null,
  churnRiskError: null,

  /* =========================================================
     PLANS
     ========================================================= */

  fetchPlans: async () => {
    set({
      loadingPlans: true,
      plansError: null,
    });

    try {
      const plans = await getPlans();

      set({
        plans,
        loadingPlans: false,
      });
    } catch (error) {
      console.error(
        "Failed to load plans:",
        error
      );

      set({
        loadingPlans: false,
        plansError: "Failed to load plans.",
      });
    }
  },

  createPlan: async (plan) => {
    try {
      const newPlan = await createPlan(plan);

      set((state) => ({
        plans: [
          ...state.plans,
          newPlan,
        ],
      }));
    } catch (error) {
      console.error(
        "Failed to create plan:",
        error
      );

      throw error;
    }
  },

  updatePlan: async (id, plan) => {
    try {
      const updatedPlan =
        await updatePlan(id, plan);

      set((state) => ({
        plans: state.plans.map(
          (existingPlan) =>
            existingPlan.id === id
              ? updatedPlan
              : existingPlan
        ),
      }));
    } catch (error) {
      console.error(
        "Failed to update plan:",
        error
      );

      throw error;
    }
  },

  deletePlan: async (id) => {
    try {
      await deletePlan(id);

      set((state) => ({
        plans: state.plans.filter(
          (plan) => plan.id !== id
        ),
      }));
    } catch (error) {
      console.error(
        "Failed to delete plan:",
        error
      );

      throw error;
    }
  },

  /* =========================================================
     SUBSCRIPTIONS
     ========================================================= */

  fetchSubscriptions: async () => {
    set({
      loadingSubscriptions: true,
      subscriptionsError: null,
    });

    try {
      const subscriptions =
        await getSubscriptions();

      set({
        subscriptions,
        loadingSubscriptions: false,
      });
    } catch (error) {
      console.error(
        "Failed to load subscriptions:",
        error
      );

      set({
        loadingSubscriptions: false,
        subscriptionsError:
          "Failed to load subscriptions.",
      });
    }
  },

  fetchSubscriptionsByCustomerId: async (
    customerId
  ) => {
    set({
      loadingSubscriptions: true,
      subscriptionsError: null,
    });

    try {
      const subscriptions =
        await getSubscriptionsByCustomerId(
          customerId
        );

      set({
        subscriptions,
        loadingSubscriptions: false,
      });
    } catch (error) {
      console.error(
        "Failed to load customer subscriptions:",
        error
      );

      set({
        loadingSubscriptions: false,
        subscriptionsError:
          "Failed to load customer subscriptions.",
      });
    }
  },

  createSubscription: async (
    subscription
  ) => {
    try {
      const newSubscription =
        await createSubscription(
          subscription
        );

      set((state) => ({
        subscriptions: [
          ...state.subscriptions,
          newSubscription,
        ],
      }));
    } catch (error) {
      console.error(
        "Failed to create subscription:",
        error
      );

      throw error;
    }
  },

  cancelSubscription: async (id) => {
    try {
      const updatedSubscription =
        await cancelSubscription(id);

      set((state) => ({
        subscriptions:
          state.subscriptions.map(
            (subscription) =>
              subscription.id === id
                ? updatedSubscription
                : subscription
          ),
      }));
    } catch (error) {
      console.error(
        "Failed to cancel subscription:",
        error
      );

      throw error;
    }
  },

  changeSubscriptionPlan: async (
    id,
    planId
  ) => {
    try {
      const updatedSubscription =
        await changeSubscriptionPlan(
          id,
          planId
        );

      set((state) => ({
        subscriptions:
          state.subscriptions.map(
            (subscription) =>
              subscription.id === id
                ? updatedSubscription
                : subscription
          ),
      }));
    } catch (error) {
      console.error(
        "Failed to change subscription plan:",
        error
      );

      throw error;
    }
  },

  /* =========================================================
     INVOICES
     ========================================================= */

  fetchInvoices: async () => {
    set({
      loadingInvoices: true,
      invoicesError: null,
    });

    try {
      const invoices =
        await getInvoices();

      set({
        invoices,
        loadingInvoices: false,
      });
    } catch (error) {
      console.error(
        "Failed to load invoices:",
        error
      );

      set({
        loadingInvoices: false,
        invoicesError:
          "Failed to load invoices.",
      });
    }
  },

  fetchInvoiceById: async (id) => {
    try {
      const invoice =
        await getInvoiceById(id);

      set((state) => {
        const exists =
          state.invoices.some(
            (existingInvoice) =>
              existingInvoice.id ===
              invoice.id
          );

        return {
          invoices: exists
            ? state.invoices.map(
                (existingInvoice) =>
                  existingInvoice.id ===
                  invoice.id
                    ? invoice
                    : existingInvoice
              )
            : [
                ...state.invoices,
                invoice,
              ],
        };
      });

      return invoice;
    } catch (error) {
      console.error(
        "Failed to load invoice:",
        error
      );

      throw error;
    }
  },

  fetchInvoicesByCustomerId: async (
    customerId
  ) => {
    set({
      loadingInvoices: true,
      invoicesError: null,
    });

    try {
      const invoices =
        await getInvoicesByCustomerId(
          customerId
        );

      set({
        invoices,
        loadingInvoices: false,
      });
    } catch (error) {
      console.error(
        "Failed to load customer invoices:",
        error
      );

      set({
        loadingInvoices: false,
        invoicesError:
          "Failed to load customer invoices.",
      });
    }
  },

  payInvoice: async (invoiceId) => {
    try {
      const updatedInvoice =
        await payInvoice(invoiceId);

      set((state) => ({
        invoices:
          state.invoices.map(
            (invoice) =>
              invoice.id === invoiceId
                ? updatedInvoice
                : invoice
          ),
      }));
    } catch (error) {
      console.error(
        "Failed to pay invoice:",
        error
      );

      throw error;
    }
  },

  /* =========================================================
     PAYMENT ATTEMPTS
     ========================================================= */

  fetchPaymentAttempts: async () => {
    set({
      loadingPaymentAttempts: true,
      paymentAttemptsError: null,
    });

    try {
      const paymentAttempts =
        await getPaymentAttempts();

      set({
        paymentAttempts,
        loadingPaymentAttempts: false,
      });
    } catch (error) {
      console.error(
        "Failed to load payment attempts:",
        error
      );

      set({
        loadingPaymentAttempts: false,
        paymentAttemptsError:
          "Failed to load payment attempts.",
      });
    }
  },

  fetchPaymentAttemptsByCustomerId:
    async (customerId) => {
      set({
        loadingPaymentAttempts: true,
        paymentAttemptsError: null,
      });

      try {
        const paymentAttempts =
          await getPaymentAttemptsByCustomerId(
            customerId
          );

        set({
          paymentAttempts,
          loadingPaymentAttempts: false,
        });
      } catch (error) {
        console.error(
          "Failed to load customer payment attempts:",
          error
        );

        set({
          loadingPaymentAttempts: false,
          paymentAttemptsError:
            "Failed to load customer payment attempts.",
        });
      }
    },

  /* =========================================================
     CHURN RISK
     ========================================================= */

  fetchChurnRisk: async (customerId) => {
    set({
      loadingChurnRisk: true,
      churnRiskError: null,
    });

    try {
      const churnRisk =
        await getChurnRisk(customerId);

      set((state) => ({
        churnRisks: {
          ...state.churnRisks,
          [customerId]: churnRisk,
        },
        loadingChurnRisk: false,
      }));
    } catch (error) {
      console.error(
        `Failed to load churn risk for customer ${customerId}:`,
        error
      );

      set({
        loadingChurnRisk: false,
        churnRiskError:
          "Failed to load churn risk.",
      });
    }
  },

  fetchChurnRisks: async (
    customerIds
  ) => {
    set({
      loadingChurnRisk: true,
      churnRiskError: null,
    });

    try {
      const uniqueCustomerIds =
        [...new Set(customerIds)];

      const results =
        await Promise.all(
          uniqueCustomerIds.map(
            async (customerId) => {
              const result =
                await getChurnRisk(
                  customerId
                );

              return {
                customerId,
                result,
              };
            }
          )
        );

      const churnRisks: Record<
        number,
        ChurnRisk
      > = {};

      results.forEach(
        ({ customerId, result }) => {
          churnRisks[customerId] =
            result;
        }
      );

      set({
        churnRisks,
        loadingChurnRisk: false,
      });
    } catch (error) {
      console.error(
        "Failed to load churn risks:",
        error
      );

      set({
        loadingChurnRisk: false,
        churnRiskError:
          "Failed to load churn risks.",
      });
    }
  },
}));

export default useBillingStore;