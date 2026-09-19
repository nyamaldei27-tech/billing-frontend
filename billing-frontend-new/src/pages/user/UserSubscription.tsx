import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";

import useBillingStore from "../../stores/billingStore";
import useCustomerStore from "../../stores/customerStore";

import "./UserSubscription.css";

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
}

function UserSubscription() {
  const fetchCurrentCustomer =
    useCustomerStore(
      (state) =>
        state.fetchCurrentCustomer
    );

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
    createSubscription,
  } = useBillingStore();

  const [showChangePlan, setShowChangePlan] =
    useState(false);

  const [showCreateSubscription, setShowCreateSubscription] =
    useState(false);

  const [canceling, setCanceling] =
    useState(false);

  const [changingPlan, setChangingPlan] =
    useState(false);

  const [creatingSubscription, setCreatingSubscription] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  /*
   * CURRENT ACTIVE SUBSCRIPTION
   *
   * We intentionally only use ACTIVE here.
   *
   * A canceled subscription cannot be
   * reactivated or changed.
   */
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

  /*
   * CHANGE PLAN FORM
   */
  const changePlanForm = useForm({
    defaultValues: {
      planId: subscription?.planId ?? null,
    },

    onSubmit: async ({ value }) => {
      if (!subscription || !value.planId) {
        return;
      }

      setActionError(null);
      setActionMessage(null);

      if (
        value.planId ===
        subscription.planId
      ) {
        setActionError(
          "This is already your current plan."
        );

        return;
      }

      const selectedPlan = plans.find(
        (item) =>
          item.id === value.planId
      );

      if (!selectedPlan) {
        setActionError(
          "Selected plan could not be found."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Are you sure you want to switch to the ${selectedPlan.name} plan?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setChangingPlan(true);
        setActionError(null);
        setActionMessage(null);

        await changeSubscriptionPlan(
          subscription.id,
          value.planId
        );

        setActionMessage(
          "Subscription plan changed successfully."
        );

        setShowChangePlan(false);

        /*
         * Refresh subscriptions so the
         * displayed plan immediately updates.
         */
        const customer =
          useCustomerStore.getState()
            .currentCustomer;

        if (customer) {
          await fetchSubscriptionsByCustomerId(
            customer.id
          );
        }
      } catch (error) {
        console.error(
          "Failed to change subscription plan:",
          error
        );

        setActionError(
          getErrorMessage(
            error,
            "Failed to change subscription plan."
          )
        );
      } finally {
        setChangingPlan(false);
      }
    },
  });

  /*
   * CANCEL SUBSCRIPTION
   */
  const handleCancelSubscription =
    async () => {
      if (!subscription) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to cancel your subscription?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setCanceling(true);
        setActionError(null);
        setActionMessage(null);

        await cancelSubscription(
          subscription.id
        );

        setActionMessage(
          "Subscription canceled successfully."
        );

        setShowChangePlan(false);

        /*
         * Refresh the subscription list.
         *
         * After cancellation there will be
         * no ACTIVE subscription.
         */
        const customer =
          useCustomerStore.getState()
            .currentCustomer;

        if (customer) {
          await fetchSubscriptionsByCustomerId(
            customer.id
          );
        }
      } catch (error) {
        console.error(
          "Failed to cancel subscription:",
          error
        );

        setActionError(
          getErrorMessage(
            error,
            "Failed to cancel subscription."
          )
        );
      } finally {
        setCanceling(false);
      }
    };

  /*
   * CREATE NEW SUBSCRIPTION FORM
   */
  const createSubscriptionForm =
    useForm({
      defaultValues: {
        planId: null as number | null,
      },

      onSubmit: async ({ value }) => {
        if (!value.planId) {
          setActionError(
            "Please select a plan."
          );

          return;
        }

        const selectedPlan =
          plans.find(
            (item) =>
              item.id === value.planId
          );

        if (!selectedPlan) {
          setActionError(
            "Selected plan could not be found."
          );

          return;
        }

        const confirmed =
          window.confirm(
            `Are you sure you want to subscribe to the ${selectedPlan.name} plan?`
          );

        if (!confirmed) {
          return;
        }

        try {
          setCreatingSubscription(true);
          setActionError(null);
          setActionMessage(null);

          const customer =
            useCustomerStore
              .getState()
              .currentCustomer;

          if (!customer) {
            throw new Error(
              "Unable to identify the current customer."
            );
          }

          /*
           * IMPORTANT:
           *
           * This creates a NEW subscription.
           * It does NOT reactivate the canceled
           * subscription.
           */
          await createSubscription({
  customerId: customer.id,
  planId: value.planId,
});

          setActionMessage(
            `New ${selectedPlan.name} subscription created successfully.`
          );

          setShowCreateSubscription(
            false
          );

          createSubscriptionForm.setFieldValue(
            "planId",
            null
          );

          /*
           * Refresh subscription data.
           */
          await fetchSubscriptionsByCustomerId(
            customer.id
          );
        } catch (error) {
          console.error(
            "Failed to create subscription:",
            error
          );

          setActionError(
            getErrorMessage(
              error,
              "Failed to create subscription."
            )
          );
        } finally {
          setCreatingSubscription(false);
        }
      },
    });

  /*
   * LOAD DATA
   */
  useEffect(() => {
    const loadSubscription =
      async () => {
        try {
          let customer =
            useCustomerStore
              .getState()
              .currentCustomer;

          if (!customer) {
            customer =
              await fetchCurrentCustomer();
          }

          if (!customer) {
            console.error(
              "No current customer found."
            );

            return;
          }

          await Promise.all([
            fetchSubscriptionsByCustomerId(
              customer.id
            ),

            fetchPlans(),
          ]);
        } catch (error) {
          console.error(
            "Failed to load subscription:",
            error
          );
        }
      };

    loadSubscription();
  }, [
    fetchCurrentCustomer,
    fetchSubscriptionsByCustomerId,
    fetchPlans,
  ]);

  /*
   * KEEP CHANGE PLAN FORM IN SYNC
   */
  useEffect(() => {
    if (subscription) {
      changePlanForm.setFieldValue(
        "planId",
        subscription.planId
      );
    }
  }, [
    subscription,
    changePlanForm,
  ]);

  const loading =
    loadingSubscriptions ||
    loadingPlans;

  if (loading) {
    return (
      <main className="user-subscription-page">
        <h1>My Subscription</h1>

        <p>
          Loading subscription...
        </p>
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
            View and manage your current
            subscription.
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

  /*
   * NO ACTIVE SUBSCRIPTION
   *
   * This is where the new-subscription
   * flow is displayed.
   */
  if (!subscription) {
    return (
      <main className="user-subscription-page">

        <div className="user-subscription-header">
          <h1>My Subscription</h1>

          <p>
            Manage your current
            subscription.
          </p>
        </div>

        {actionMessage && (
          <div className="subscription-success-message">
            {actionMessage}
          </div>
        )}

        {actionError && (
          <div className="subscription-error-message">
            {actionError}
          </div>
        )}

        <div className="subscription-empty">

          <h3>
            No active subscription
          </h3>

          <p>
            You don't currently have an
            active subscription.
          </p>

          <p>
            Your previous subscription
            remains canceled. You can
            choose a new plan to start a
            new subscription.
          </p>

          <button
            type="button"
            className="create-subscription-button"
            onClick={() => {
              setActionError(null);
              setActionMessage(null);
              setShowCreateSubscription(
                !showCreateSubscription
              );
            }}
            disabled={creatingSubscription}
          >
            {showCreateSubscription
              ? "Close Plans"
              : "Choose a New Plan"}
          </button>

        </div>

        {showCreateSubscription && (
          <section className="change-plan-section">

            <div className="change-plan-header">
              <div>
                <h3>
                  Start a New Subscription
                </h3>

                <p>
                  Choose the plan you'd like
                  to subscribe to.
                </p>
              </div>
            </div>

            <createSubscriptionForm.Field
              name="planId"
              validators={{
                onChange: ({
                  value,
                }) => {
                  if (!value) {
                    return "Please select a plan.";
                  }

                  return undefined;
                },
              }}
            >
              {(field) => (
                <>
                  <div className="available-plans">

                    {plans.map(
                      (availablePlan) => (
                        <button
                          type="button"
                          key={
                            availablePlan.id
                          }
                          className={`plan-option ${
                            field.state
                              .value ===
                            availablePlan.id
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            field.handleChange(
                              availablePlan.id
                            )
                          }
                          disabled={
                            creatingSubscription
                          }
                        >
                          <span className="plan-option-name">
                            {
                              availablePlan.name
                            }
                          </span>

                          <span className="plan-option-cycle">
                            {
                              availablePlan.billingCycle
                            }
                          </span>

                          <strong className="plan-option-price">
                            ETB{" "}
                            {(
                              availablePlan.priceCents /
                              100
                            ).toFixed(2)}
                          </strong>

                          {field.state
                            .value ===
                            availablePlan.id && (
                            <span className="plan-selected-label">
                              Selected
                            </span>
                          )}
                        </button>
                      )
                    )}

                  </div>

                  {field.state.meta.errors
                    .length > 0 && (
                    <p className="form-error">
                      {
                        field.state.meta
                          .errors[0]
                      }
                    </p>
                  )}

                  <div className="change-plan-actions">

                    <button
                      type="button"
                      className="change-plan-confirm-button"
                      onClick={() =>
                        createSubscriptionForm.handleSubmit()
                      }
                      disabled={
                        creatingSubscription ||
                        !field.state.value
                      }
                    >
                      {creatingSubscription
                        ? "Creating Subscription..."
                        : "Start Subscription"}
                    </button>

                    <button
                      type="button"
                      className="change-plan-cancel-button"
                      onClick={() =>
                        setShowCreateSubscription(
                          false
                        )
                      }
                      disabled={
                        creatingSubscription
                      }
                    >
                      Cancel
                    </button>

                  </div>
                </>
              )}
            </createSubscriptionForm.Field>

          </section>
        )}

      </main>
    );
  }

  /*
   * ACTIVE SUBSCRIPTION
   */
  return (
    <main className="user-subscription-page">

      <div className="user-subscription-header">
        <h1>My Subscription</h1>

        <p>
          View your current subscription
          details.
        </p>
      </div>

      {actionMessage && (
        <div className="subscription-success-message">
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div className="subscription-error-message">
          {actionError}
        </div>
      )}

      <section className="user-subscription-card">

        <div className="subscription-card-header">

          <div>
            <span>
              Current Plan
            </span>

            <h2>
              {plan?.name ||
                "Unknown Plan"}
            </h2>
          </div>

          <span className="subscription-status">
            {subscription.status}
          </span>

        </div>

        <div className="subscription-details">

          <div>
            <span>
              Billing Cycle
            </span>

            <strong>
              {plan?.billingCycle ||
                "N/A"}
            </strong>
          </div>

          <div>
            <span>
              Next Billing Date
            </span>

            <strong>
              {subscription.currentPeriodEnd
                ? new Date(
                    subscription.currentPeriodEnd
                  ).toLocaleDateString()
                : "N/A"}
            </strong>
          </div>

          <div>
            <span>
              Subscription ID
            </span>

            <strong>
              #{subscription.id}
            </strong>
          </div>

        </div>

        <div className="subscription-actions">

          <button
            type="button"
            className="change-plan-button"
            onClick={() => {
              setActionError(null);
              setActionMessage(null);

              setShowChangePlan(
                !showChangePlan
              );
            }}
            disabled={
              changingPlan ||
              canceling
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
              canceling ||
              changingPlan
            }
          >
            {canceling
              ? "Canceling..."
              : "Cancel Subscription"}
          </button>

        </div>

      </section>

      {showChangePlan && (
        <section className="change-plan-section">

          <div className="change-plan-header">

            <div>
              <h3>
                Choose a New Plan
              </h3>

              <p>
                Select the plan you'd
                like to switch to.
              </p>
            </div>

          </div>

          <changePlanForm.Field
            name="planId"
            validators={{
              onChange: ({
                value,
              }) => {
                if (!value) {
                  return "Please select a plan.";
                }

                if (
                  subscription &&
                  value ===
                    subscription.planId
                ) {
                  return "Please select a different plan.";
                }

                return undefined;
              },
            }}
          >
            {(field) => (
              <>
                <div className="available-plans">

                  {plans.map(
                    (availablePlan) => (
                      <button
                        type="button"
                        key={
                          availablePlan.id
                        }
                        className={`plan-option ${
                          field.state.value ===
                          availablePlan.id
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          field.handleChange(
                            availablePlan.id
                          )
                        }
                        disabled={
                          changingPlan ||
                          canceling
                        }
                      >
                        <span className="plan-option-name">
                          {
                            availablePlan.name
                          }
                        </span>

                        <span className="plan-option-cycle">
                          {
                            availablePlan.billingCycle
                          }
                        </span>

                        <strong className="plan-option-price">
                          ETB{" "}
                          {(
                            availablePlan.priceCents /
                            100
                          ).toFixed(2)}
                        </strong>

                        {field.state
                          .value ===
                          availablePlan.id && (
                          <span className="plan-selected-label">
                            Selected
                          </span>
                        )}
                      </button>
                    )
                  )}

                </div>

                {field.state.meta.errors
                  .length > 0 && (
                  <p className="form-error">
                    {
                      field.state.meta
                        .errors[0]
                    }
                  </p>
                )}

                <div className="change-plan-actions">

                  <button
                    type="button"
                    className="change-plan-confirm-button"
                    onClick={() =>
                      changePlanForm.handleSubmit()
                    }
                    disabled={
                      changingPlan ||
                      canceling ||
                      field.state.value ===
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
                      setShowChangePlan(
                        false
                      )
                    }
                    disabled={
                      changingPlan
                    }
                  >
                    Keep Current Plan
                  </button>

                </div>

              </>
            )}
          </changePlanForm.Field>

        </section>
      )}

    </main>
  );
}

export default UserSubscription;