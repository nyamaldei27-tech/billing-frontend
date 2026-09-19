import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import "./UserDashboard.css";

import useBillingStore from "../../stores/billingStore";
import useCustomerStore from "../../stores/customerStore";

function UserDashboard() {
  const navigate = useNavigate();

  const fetchCurrentCustomer = useCustomerStore(
    (state) => state.fetchCurrentCustomer
  );

  const {
    plans,
    subscriptions,
    invoices,
    loadingPlans,
    loadingSubscriptions,
    loadingInvoices,
    plansError,
    subscriptionsError,
    invoicesError,
    fetchPlans,
    fetchSubscriptionsByCustomerId,
    fetchInvoicesByCustomerId,
  } = useBillingStore();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        let customer =
          useCustomerStore.getState().currentCustomer;

        if (!customer) {
          customer = await fetchCurrentCustomer();
        }

        if (!customer) {
          console.error(
            "No current customer found."
          );

          return;
        }

        await Promise.all([
          fetchPlans(),

          fetchSubscriptionsByCustomerId(
            customer.id
          ),

          fetchInvoicesByCustomerId(
            customer.id
          ),
        ]);
      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error
        );
      }
    };

    loadDashboard();
  }, [
    fetchCurrentCustomer,
    fetchPlans,
    fetchSubscriptionsByCustomerId,
    fetchInvoicesByCustomerId,
  ]);

  const loading =
    loadingPlans ||
    loadingSubscriptions ||
    loadingInvoices;

  const error =
    plansError ||
    subscriptionsError ||
    invoicesError;

  /*
   * PREFER THE ACTIVE SUBSCRIPTION.
   *
   * If there is no active subscription,
   * show the latest subscription instead.
   *
   * This prevents the dashboard from randomly
   * displaying Basic after another plan is canceled.
   */
  const activeSubscription =
    subscriptions.find(
      (subscription) =>
        subscription.status.toUpperCase() === "ACTIVE"
    ) || null;

  const latestSubscription =
    [...subscriptions]
      .sort((a, b) => b.id - a.id)[0] || null;

  const subscription =
    activeSubscription || latestSubscription;

  const currentPlan = plans.find(
    (plan) => plan.id === subscription?.planId
  );

  const formatMoney = (cents: number) => {
    return `ETB ${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (
    date: string | null | undefined
  ) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString();
  };

  /*
   * OUTSTANDING BALANCE
   */
  const outstandingAmount = invoices
    .filter(
      (invoice) =>
        invoice.status === "PENDING"
    )
    .reduce(
      (total, invoice) =>
        total + invoice.amountCents,
      0
    );

  /*
   * NEXT PAYMENT
   *
   * Only an ACTIVE subscription can have
   * an upcoming payment.
   */
  const nextInvoice =
    subscription?.status?.toUpperCase() ===
    "ACTIVE"
      ? invoices
          .filter(
            (invoice) =>
              invoice.status === "PENDING" &&
              invoice.subscriptionId ===
                subscription.id
          )
          .sort(
            (a, b) =>
              new Date(a.dueDate).getTime() -
              new Date(b.dueDate).getTime()
          )[0]
      : null;

  const nextPaymentAmount =
    nextInvoice?.amountCents ??
    (subscription?.status?.toUpperCase() ===
    "ACTIVE"
      ? currentPlan?.priceCents ?? 0
      : 0);

  if (loading) {
    return (
      <main className="user-dashboard-page">
        <h1>Loading...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="user-dashboard-page">
        <h1>Unable to load dashboard</h1>

        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="user-dashboard-page">

      {/* HEADER */}

      <div className="user-dashboard-header">
        <div>
          <h1>Welcome back</h1>

          <p>
            Here's an overview of your subscription
            and billing.
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="user-dashboard-stats">

        {/* CURRENT PLAN */}

        <div className="user-dashboard-card">
          <span className="card-label">
            Current Plan
          </span>

          <strong className="card-value">
            {currentPlan?.name || "No plan"}
          </strong>

          <span className="card-description">
            {currentPlan?.billingCycle
              ? `${currentPlan.billingCycle.toLowerCase()} subscription`
              : "No subscription"}
          </span>
        </div>

        {/* SUBSCRIPTION STATUS */}

        <div className="user-dashboard-card">
          <span className="card-label">
            Subscription Status
          </span>

          <strong className="card-value">
            {subscription?.status ||
              "No subscription"}
          </strong>

          <span className="card-description">
            {subscription
              ? `Your subscription is ${subscription.status.toLowerCase()}`
              : "No active subscription"}
          </span>
        </div>

        {/* NEXT PAYMENT */}

        <div className="user-dashboard-card">
          <span className="card-label">
            Next Payment
          </span>

          <strong className="card-value">
            {formatMoney(nextPaymentAmount)}
          </strong>

          <span className="card-description">
            {nextInvoice
              ? `Due ${formatDate(
                  nextInvoice.dueDate
                )}`
              : subscription?.status?.toUpperCase() ===
                "ACTIVE"
              ? `Due ${formatDate(
                  subscription.currentPeriodEnd
                )}`
              : "No upcoming payment"}
          </span>
        </div>

        {/* OUTSTANDING */}

        <div className="user-dashboard-card">
          <span className="card-label">
            Outstanding
          </span>

          <strong className="card-value">
            {formatMoney(outstandingAmount)}
          </strong>

          <span className="card-description">
            {outstandingAmount > 0
              ? "Payment required"
              : "No outstanding balance"}
          </span>
        </div>

      </div>

      {/* SUBSCRIPTION */}

      <section className="user-dashboard-section">

        <div className="user-section-header">
          <div>
            <h2>My Subscription</h2>

            <p>
              Your current subscription details.
            </p>
          </div>
        </div>

        <div className="subscription-card">

          <div>
            <span>Plan</span>

            <strong>
              {currentPlan?.name || "No plan"}
            </strong>
          </div>

          <div>
            <span>Billing Cycle</span>

            <strong>
              {currentPlan?.billingCycle || "N/A"}
            </strong>
          </div>

          <div>
            <span>Status</span>

            <strong className="user-status-active">
              {subscription?.status ||
                "No subscription"}
            </strong>
          </div>

          <div>
            <span>Next Billing Date</span>

            <strong>
              {subscription?.status?.toUpperCase() ===
              "ACTIVE"
                ? formatDate(
                    subscription.currentPeriodEnd
                  )
                : "No upcoming billing"}
            </strong>
          </div>

        </div>

      </section>

      {/* QUICK ACTIONS */}

      <section className="user-dashboard-section">

        <div className="user-section-header">

          <div>
            <h2>Quick Actions</h2>

            <p>
              Manage your account and billing.
            </p>
          </div>

        </div>

        <div className="user-quick-actions">

          <button
            type="button"
            className="user-action-button"
            onClick={() =>
              navigate({
                to: "/user/subscription",
              })
            }
          >
            View Subscription
          </button>

          <button
            type="button"
            className="user-action-button"
            onClick={() =>
              navigate({
                to: "/user/invoices",
              })
            }
          >
            View Invoices
          </button>

          <button
            type="button"
            className="user-action-button"
            onClick={() =>
              navigate({
                to: "/user/payment-history",
              })
            }
          >
            View Payment History
          </button>

          <button
            type="button"
            className="user-action-button"
            onClick={() =>
              navigate({
                to: "/user/profile",
              })
            }
          >
            Edit Profile
          </button>

        </div>

      </section>

    </main>
  );
}

export default UserDashboard;