import { useEffect, useState } from "react";

import useBillingStore from "../../stores/billingStore";

import "./UserSubscription.css";

function UserSubscription() {
  const customerId = 2;

  const {
    subscriptions,
    plans,
    loadingSubscriptions,
    loadingPlans,
    subscriptionsError,
    plansError,
    fetchSubscriptionsByCustomerId,
    fetchPlans,
    cancelSubscription,
    changeSubscriptionPlan,
  } = useBillingStore();

  const [showChangePlan, setShowChangePlan] =
    useState(false);

  const [selectedPlanId, setSelectedPlanId] =
    useState<number | null>(null);

  const [canceling, setCanceling] =
    useState(false);

  const [changingPlan, setChangingPlan] =
    useState(false);

  const subscription =
    subscriptions.find(
      (item) =>
        item.status.toUpperCase() === "ACTIVE"
    ) || null;

  const plan =
    subscription
      ? plans.find(
          (item) =>
            item.id === subscription.planId
        ) || null
      : null;

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription?"
    );

    if (!confirmed) return;

    try {
      setCanceling(true);

      await cancelSubscription(subscription.id);
    } catch (error) {
      console.error(
        "Failed to cancel subscription:",
        error
      );
    } finally {
      setCanceling(false);
    }
  };

  const handleChangePlan = async () => {
    if (!subscription || !selectedPlanId) {
      return;
    }

    if (selectedPlanId === subscription.planId) {
      window.alert(
        "This is already your current plan."
      );
      return;
    }

    const selectedPlan = plans.find(
      (item) => item.id === selectedPlanId
    );

    const confirmed = window.confirm(
      `Are you sure you want to switch to the ${selectedPlan?.name} plan?`
    );

    if (!confirmed) return;

    try {
      setChangingPlan(true);

      await changeSubscriptionPlan(
        subscription.id,
        selectedPlanId
      );

      setSelectedPlanId(selectedPlanId);

      setShowChangePlan(false);
    } catch (error) {
      console.error(
        "Failed to change subscription plan:",
        error
      );

      window.alert(
        "Failed to change subscription plan."
      );
    } finally {
      setChangingPlan(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionsByCustomerId(customerId);
    fetchPlans();
  }, [
    fetchSubscriptionsByCustomerId,
    fetchPlans,
  ]);

  useEffect(() => {
    if (subscription) {
      setSelectedPlanId(subscription.planId);
    }
  }, [subscription]);

  const loading =
    loadingSubscriptions || loadingPlans;

  if (loading) {
    return (
      <main className="user-subscription-page">
        <h1>My Subscription</h1>
        <p>Loading subscription...</p>
      </main>
    );
  }

  if (
    subscriptionsError ||
    plansError
  ) {
    return (
      <main className="user-subscription-page">
        <div className="user-subscription-header">
          <h1>My Subscription</h1>

          <p>
            View and manage your current subscription.
          </p>
        </div>

        <div className="subscription-empty">
          <h3>
            Failed to load subscription
          </h3>

          <p>
            {subscriptionsError ||
              plansError ||
              "Something went wrong while loading your subscription."}
          </p>
        </div>
      </main>
    );
  }

  if (!subscription) {
    return (
      <main className="user-subscription-page">
        <div className="user-subscription-header">
          <h1>My Subscription</h1>

          <p>
            Manage your current subscription.
          </p>
        </div>

        <div className="subscription-empty">
          <h3>No active subscription</h3>

          <p>
            You don't currently have an active
            subscription.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="user-subscription-page">

      {/* HEADER */}

      <div className="user-subscription-header">
        <h1>My Subscription</h1>

        <p>
          View your current subscription details.
        </p>
      </div>

      {/* CURRENT SUBSCRIPTION */}

      <section className="user-subscription-card">

        <div className="subscription-card-header">
          <div>
            <span>Current Plan</span>

            <h2>
              {plan?.name || "Unknown Plan"}
            </h2>
          </div>

          <span className="subscription-status">
            {subscription.status}
          </span>
        </div>

        <div className="subscription-details">

          <div>
            <span>Billing Cycle</span>

            <strong>
              {plan?.billingCycle || "N/A"}
            </strong>
          </div>

          <div>
            <span>Next Billing Date</span>

            <strong>
              {subscription.currentPeriodEnd
                ? new Date(
                    subscription.currentPeriodEnd
                  ).toLocaleDateString()
                : "N/A"}
            </strong>
          </div>

          <div>
            <span>Subscription ID</span>

            <strong>
              #{subscription.id}
            </strong>
          </div>

        </div>

        <div className="subscription-actions">

          <button
            type="button"
            className="change-plan-button"
            onClick={() =>
              setShowChangePlan(
                !showChangePlan
              )
            }
            disabled={
              subscription.status ===
              "CANCELED"
            }
          >
            {showChangePlan
              ? "Close Plans"
              : "Change Plan"}
          </button>

          <button
            type="button"
            className="cancel-subscription-button"
            onClick={
              handleCancelSubscription
            }
            disabled={
              subscription.status ===
                "CANCELED" ||
              canceling
            }
          >
            {canceling
              ? "Canceling..."
              : subscription.status ===
                "CANCELED"
              ? "Subscription Canceled"
              : "Cancel Subscription"}
          </button>

        </div>

      </section>

      {/* CHANGE PLAN */}

      {showChangePlan && (
        <section className="change-plan-section">

          <div className="change-plan-header">
            <div>
              <h3>Choose a New Plan</h3>

              <p>
                Select the plan you'd like
                to switch to.
              </p>
            </div>
          </div>

          <div className="available-plans">

            {plans.map((availablePlan) => (
              <button
                type="button"
                key={availablePlan.id}
                className={`plan-option ${
                  selectedPlanId ===
                  availablePlan.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedPlanId(
                    availablePlan.id
                  )
                }
              >
                <span className="plan-option-name">
                  {availablePlan.name}
                </span>

                <span className="plan-option-cycle">
                  {availablePlan.billingCycle}
                </span>

                <strong className="plan-option-price">
                  ETB{" "}
                  {(
                    availablePlan.priceCents /
                    100
                  ).toFixed(2)}
                </strong>

                {selectedPlanId ===
                  availablePlan.id && (
                  <span className="plan-selected-label">
                    Selected
                  </span>
                )}
              </button>
            ))}

          </div>

          <div className="change-plan-actions">

            <button
              type="button"
              className="change-plan-confirm-button"
              onClick={handleChangePlan}
              disabled={
                changingPlan ||
                selectedPlanId ===
                  subscription.planId
              }
            >
              {changingPlan
                ? "Changing Plan..."
                : "Confirm Plan Change"}
            </button>

            <button
              type="button"
              className="change-plan-cancel-button"
              onClick={() =>
                setShowChangePlan(false)
              }
              disabled={changingPlan}
            >
              Keep Current Plan
            </button>

          </div>

        </section>
      )}

    </main>
  );
}

export default UserSubscription;