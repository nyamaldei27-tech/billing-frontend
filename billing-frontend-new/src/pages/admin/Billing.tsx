import "./Billing.css";
import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";

import useBillingStore from "../../stores/billingStore";
import useCustomerStore from "../../stores/customerStore";

import type { Plan } from "../../services/billingService";

function Billing() {
  const {
    plans,
    subscriptions,
    invoices,
    paymentAttempts,

    loadingPlans,
    loadingSubscriptions,
    loadingInvoices,
    loadingPaymentAttempts,

    plansError,
    subscriptionsError,
    invoicesError,
    paymentAttemptsError,

    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,

    fetchSubscriptions,
    createSubscription,
    cancelSubscription,
    changeSubscriptionPlan,

    fetchInvoices,
    payInvoice,

    fetchPaymentAttempts,
  } = useBillingStore();

  const {
    customers,
    loading: loadingCustomers,
    error: customersError,
    fetchCustomers,
  } = useCustomerStore();

  /* =========================
     DATA LOADED STATE
     ========================= */

  const [plansLoaded, setPlansLoaded] = useState(false);
  const [subscriptionsLoaded, setSubscriptionsLoaded] =
    useState(false);
  const [invoicesLoaded, setInvoicesLoaded] = useState(false);
  const [paymentAttemptsLoaded, setPaymentAttemptsLoaded] =
    useState(false);

  /* =========================
     TABLE VISIBILITY
     ========================= */

  const [showPlansTable, setShowPlansTable] = useState(false);
  const [showSubscriptionsTable, setShowSubscriptionsTable] =
    useState(false);
  const [showInvoicesTable, setShowInvoicesTable] = useState(false);
  const [showPaymentAttemptsTable, setShowPaymentAttemptsTable] =
    useState(false);

  /* =========================
     PLAN STATE
     ========================= */

  const [showCreatePlan, setShowCreatePlan] = useState(false);

  const [planManagementSearch, setPlanManagementSearch] =
    useState("");

  const [editingPlan, setEditingPlan] =
    useState<Plan | null>(null);

  const [deletingPlanId, setDeletingPlanId] =
    useState<number | null>(null);

  /* =========================
     SUBSCRIPTION STATE
     ========================= */

  const [showCreateSubscription, setShowCreateSubscription] =
    useState(false);

  const [changingSubscriptionId, setChangingSubscriptionId] =
    useState<number | null>(null);

  /* =========================
     SEARCH STATE
     ========================= */

  const [customerSearch, setCustomerSearch] = useState("");
  const [planSearch, setPlanSearch] = useState("");

  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [paymentAttemptSearch, setPaymentAttemptSearch] =
    useState("");

  const [showCustomerResults, setShowCustomerResults] =
    useState(false);

  const [showPlanResults, setShowPlanResults] =
    useState(false);

  /* =========================
     LOAD OVERVIEW DATA
     ========================= */

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        await Promise.all([
          fetchPlans(),
          fetchSubscriptions(),
          fetchInvoices(),
        ]);

        setPlansLoaded(true);
        setSubscriptionsLoaded(true);
        setInvoicesLoaded(true);
      } catch (error) {
        console.error(
          "LOAD BILLING OVERVIEW ERROR:",
          error
        );
      }
    };

    loadOverviewData();
  }, [
    fetchPlans,
    fetchSubscriptions,
    fetchInvoices,
  ]);

  /* =========================
     LOAD PLANS
     ========================= */

  const handleLoadPlans = async () => {
    try {
      await fetchPlans();
      setPlansLoaded(true);
    } catch (error) {
      console.error("LOAD PLANS ERROR:", error);
      setPlansLoaded(false);
    }
  };

  /* =========================
     LOAD SUBSCRIPTIONS
     ========================= */

  const handleLoadSubscriptions = async () => {
    try {
      await fetchSubscriptions();
      setSubscriptionsLoaded(true);
    } catch (error) {
      console.error(
        "LOAD SUBSCRIPTIONS ERROR:",
        error
      );
      setSubscriptionsLoaded(false);
    }
  };

  /* =========================
     LOAD INVOICES
     ========================= */

  const handleLoadInvoices = async () => {
    try {
      await fetchInvoices();
      setInvoicesLoaded(true);
    } catch (error) {
      console.error("LOAD INVOICES ERROR:", error);
      setInvoicesLoaded(false);
    }
  };

  /* =========================
     LOAD PAYMENT ATTEMPTS
     ========================= */

  const handleLoadPaymentAttempts = async () => {
    try {
      await fetchPaymentAttempts();
      setPaymentAttemptsLoaded(true);
    } catch (error) {
      console.error(
        "LOAD PAYMENT ATTEMPTS ERROR:",
        error
      );
      setPaymentAttemptsLoaded(false);
    }
  };

  /* =========================
     LOAD CUSTOMERS
     ========================= */

  const handleLoadCustomers = async () => {
    try {
      await fetchCustomers();
    } catch (error) {
      console.error(
        "LOAD CUSTOMERS ERROR:",
        error
      );
    }
  };

  /* =========================
     BILLING STATISTICS
     ========================= */

  const activeSubscriptions =
    subscriptions.filter(
      (subscription) =>
        subscription.status === "ACTIVE"
    ).length;

  const pendingInvoices =
    invoices.filter(
      (invoice) =>
        invoice.status === "PENDING"
    ).length;

  const canceledSubscriptions =
    subscriptions.filter(
      (subscription) =>
        subscription.status === "CANCELED"
    ).length;

  const failedPaymentAttempts =
    paymentAttempts.filter(
      (attempt) =>
        attempt.status === "FAILED"
    ).length;

  const paidInvoices =
    invoices.filter(
      (invoice) =>
        invoice.status === "PAID"
    );

  const totalRevenueCents =
    paidInvoices.reduce(
      (total, invoice) =>
        total + invoice.amountCents,
      0
    );

  const totalRevenue =
    totalRevenueCents / 100;

  /* =========================
     CREATE PLAN FORM
     ========================= */

  const createPlanForm = useForm({
    defaultValues: {
      name: "",
      price: "",
      billingCycle: "",
    },

    onSubmit: async ({ value }) => {
      try {
        const price = Number(value.price);

        await createPlan({
          name: value.name.trim(),
          priceCents: Math.round(price * 100),
          billingCycle: value.billingCycle,
        });

        setPlansLoaded(true);
        setShowCreatePlan(false);

        createPlanForm.reset();
      } catch (error) {
        console.error(
          "CREATE PLAN ERROR:",
          error
        );

        alert("Failed to create plan.");
      }
    },
  });

  /* =========================
     EDIT PLAN FORM
     ========================= */

  const editPlanForm = useForm({
    defaultValues: {
      name: "",
      price: "",
      billingCycle: "",
    },

    onSubmit: async ({ value }) => {
      if (!editingPlan) {
        return;
      }

      try {
        const price = Number(value.price);

        await updatePlan(
          editingPlan.id,
          {
            name: value.name.trim(),
            priceCents: Math.round(price * 100),
            billingCycle: value.billingCycle,
          }
        );

        setEditingPlan(null);
        editPlanForm.reset();
      } catch (error) {
        console.error(
          "UPDATE PLAN ERROR:",
          error
        );

        alert("Failed to update plan.");
      }
    },
  });

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);

    editPlanForm.setFieldValue(
      "name",
      plan.name
    );

    editPlanForm.setFieldValue(
      "price",
      (plan.priceCents / 100).toFixed(2)
    );

    editPlanForm.setFieldValue(
      "billingCycle",
      plan.billingCycle
    );
  };

  /* =========================
     DELETE PLAN
     ========================= */

  const handleDeletePlan = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this plan?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingPlanId(id);

      await deletePlan(id);
    } catch (error) {
      console.error(
        "DELETE PLAN ERROR:",
        error
      );

      alert(
        "Failed to delete plan. It may be connected to an existing subscription."
      );
    } finally {
      setDeletingPlanId(null);
    }
  };

  /* =========================
     CREATE SUBSCRIPTION FORM
     ========================= */

  const createSubscriptionForm = useForm({
    defaultValues: {
      customerId: "",
      planId: "",
    },

    onSubmit: async ({ value }) => {
      try {
        await createSubscription({
          customerId: Number(value.customerId),
          planId: Number(value.planId),
        });

        createSubscriptionForm.reset();

        setCustomerSearch("");
        setPlanSearch("");

        setShowCustomerResults(false);
        setShowPlanResults(false);

        setShowCreateSubscription(false);
        setSubscriptionsLoaded(true);
      } catch (error) {
        console.error(
          "CREATE SUBSCRIPTION ERROR:",
          error
        );

        alert(
          "Failed to create subscription."
        );
      }
    },
  });

  /* =========================
     OPEN CREATE SUBSCRIPTION
     ========================= */

  const handleOpenCreateSubscription =
    async () => {
      setShowCreateSubscription(true);

      if (customers.length === 0) {
        await handleLoadCustomers();
      }

      if (plans.length === 0) {
        await handleLoadPlans();
      }
    };

  /* =========================
     CANCEL SUBSCRIPTION
     ========================= */

  const handleCancelSubscription =
    async (id: number) => {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this subscription?"
      );

      if (!confirmed) {
        return;
      }

      try {
        await cancelSubscription(id);
      } catch (error) {
        console.error(
          "CANCEL SUBSCRIPTION ERROR:",
          error
        );

        alert(
          "Failed to cancel subscription."
        );
      }
    };

  /* =========================
     CHANGE PLAN FORM
     ========================= */

  const changePlanForm = useForm({
    defaultValues: {
      planId: "",
    },

    onSubmit: async ({ value }) => {
      if (
        changingSubscriptionId === null
      ) {
        return;
      }

      try {
        await changeSubscriptionPlan(
          changingSubscriptionId,
          Number(value.planId)
        );

        setChangingSubscriptionId(null);
        changePlanForm.reset();
      } catch (error) {
        console.error(
          "CHANGE PLAN ERROR:",
          error
        );

        alert(
          "Failed to change subscription plan."
        );
      }
    },
  });

  /* =========================
     OPEN CHANGE PLAN
     ========================= */

  const handleOpenChangePlan = (
    subscriptionId: number
  ) => {
    if (!plansLoaded) {
      handleLoadPlans();
    }

    changePlanForm.reset();

    setChangingSubscriptionId(
      subscriptionId
    );
  };

  /* =========================
     PAY INVOICE
     ========================= */

  const handlePayInvoice = async (
    invoiceId: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this invoice as paid?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await payInvoice(invoiceId);

      if (paymentAttemptsLoaded) {
        await fetchPaymentAttempts();
      }
    } catch (error) {
      console.error(
        "PAY INVOICE ERROR:",
        error
      );

      alert(
        "Failed to process payment."
      );
    }
  };

  /* =========================
     HELPERS
     ========================= */

  const getCustomerName = (
    customerId: number
  ) => {
    const customer =
      customers.find(
        (customer) =>
          customer.id === customerId
      );

    if (!customer) {
      return `Customer #${customerId}`;
    }

    return `${customer.firstName} ${customer.lastName}`;
  };

  const getPlanName = (
    planId: number
  ) => {
    const plan =
      plans.find(
        (plan) =>
          plan.id === planId
      );

    if (!plan) {
      return `Plan #${planId}`;
    }

    return plan.name;
  };

  const formatDate = (
    date: string
  ) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString();
  };

  /* =========================
     SEARCH FILTERS
     ========================= */

  const filteredCustomers =
    customers.filter(
      (customer) => {
        const search =
          customerSearch
            .toLowerCase()
            .trim();

        const fullName =
          `${customer.firstName} ${customer.lastName}`
            .toLowerCase();

        return (
          fullName.includes(search) ||
          customer.email
            .toLowerCase()
            .includes(search)
        );
      }
    );

  const filteredPlans =
    plans.filter(
      (plan) =>
        plan.name
          .toLowerCase()
          .includes(
            planSearch
              .toLowerCase()
              .trim()
          )
    );

  const filteredManagementPlans =
    plans.filter(
      (plan) => {
        const search =
          planManagementSearch
            .toLowerCase()
            .trim();

        return (
          plan.name
            .toLowerCase()
            .includes(search) ||
          plan.billingCycle
            .toLowerCase()
            .includes(search) ||
          String(plan.id)
            .includes(search)
        );
      }
    );

  const filteredInvoices =
    invoices.filter(
      (invoice) => {
        const search =
          invoiceSearch
            .toLowerCase()
            .trim();

        if (!search) {
          return true;
        }

        const customerName =
          getCustomerName(
            invoice.customerId
          ).toLowerCase();

        return (
          String(invoice.id)
            .includes(search) ||
          String(invoice.customerId)
            .includes(search) ||
          customerName.includes(search) ||
          invoice.status
            .toLowerCase()
            .includes(search)
        );
      }
    );

  const filteredPaymentAttempts =
    paymentAttempts.filter(
      (attempt) => {
        const search =
          paymentAttemptSearch
            .toLowerCase()
            .trim();

        if (!search) {
          return true;
        }

        return (
          String(attempt.id)
            .includes(search) ||
          String(attempt.invoiceId)
            .includes(search) ||
          attempt.status
            .toLowerCase()
            .includes(search)
        );
      }
    );

  /* =========================
     RENDER
     ========================= */

  return (
    <div className="billing-page">

      {/* =========================
          HEADER
          ========================= */}

      <div className="billing-header">

        <div>

          <h1>
            Billing
          </h1>

          <p>
            Manage plans, subscriptions,
            invoices, and payments.
          </p>

        </div>

      </div>


      {/* =========================
          OVERVIEW CARDS
          ========================= */}

      <div className="billing-stats">

        <div className="billing-stat-card">

          <div className="billing-stat-card-top">

            <div className="billing-stat-card-content">

              <span>
                Total Plans
              </span>

              <strong>
                {plansLoaded
                  ? plans.length
                  : "—"}
              </strong>

              <small>
                Available billing plans
              </small>

            </div>

          </div>

        </div>


        <div className="billing-stat-card">

          <div className="billing-stat-card-top">

            <div className="billing-stat-card-content">

              <span>
                Active Subscriptions
              </span>

              <strong>
                {subscriptionsLoaded
                  ? activeSubscriptions
                  : "—"}
              </strong>

              <small>
                Currently active customers
              </small>

            </div>

          </div>

        </div>


        <div className="billing-stat-card">

          <div className="billing-stat-card-top">

            <div className="billing-stat-card-content">

              <span>
                Pending Invoices
              </span>

              <strong>
                {invoicesLoaded
                  ? pendingInvoices
                  : "—"}
              </strong>

              <small>
                Awaiting payment
              </small>

            </div>

          </div>

        </div>


        <div className="billing-stat-card">

          <div className="billing-stat-card-top">

            <div className="billing-stat-card-content">

              <span>
                Total Revenue
              </span>

              <strong>
                {invoicesLoaded
                  ? `ETB ${totalRevenue.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}`
                  : "—"}
              </strong>

              <small>
                From paid invoices
              </small>

            </div>

          </div>

        </div>

      </div>


      {/* =========================
          PLANS
          ========================= */}

      <div className="billing-section">

        <div className="section-header">

          <div className="section-header-content">

            <h2>
              Plans
            </h2>

            <p>
              Manage your available
              billing plans.
            </p>

          </div>

          <div className="section-header-actions">

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                setShowCreatePlan(true)
              }
            >
              + Create Plan
            </button>

          </div>

        </div>


        {!plansLoaded ? (

          <div className="table-empty">

            <strong>
              No plans loaded
            </strong>

            <p>
              Click "Get Plans" to load
              your billing plans.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={handleLoadPlans}
              disabled={loadingPlans}
            >
              {loadingPlans
                ? "Loading..."
                : "Get Plans"}
            </button>

          </div>

        ) : plansError ? (

          <div className="table-empty">

            <strong>
              Unable to load plans
            </strong>

            <p>
              {plansError}
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={handleLoadPlans}
              disabled={loadingPlans}
            >
              {loadingPlans
                ? "Loading..."
                : "Try Again"}
            </button>

          </div>

        ) : !showPlansTable ? (

          <div className="table-empty">

            <strong>
              Plans loaded
            </strong>

            <p>
              The plans list is currently hidden.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                setShowPlansTable(true)
              }
            >
              Show Plans
            </button>

          </div>

        ) : (

          <>

            <div className="plans-toolbar">

              <input
                type="text"
                className="plans-search-input"
                placeholder="Search plans by name, cycle, or ID..."
                value={planManagementSearch}
                onChange={(event) =>
                  setPlanManagementSearch(
                    event.target.value
                  )
                }
              />

              <button
                type="button"
                className="secondary-button"
                onClick={handleLoadPlans}
                disabled={loadingPlans}
              >
                {loadingPlans
                  ? "Refreshing..."
                  : "Refresh Plans"}
              </button>

            </div>


            <div className="plans-management-table">

              <div className="plans-management-header">

                <span>
                  ID
                </span>

                <span>
                  Plan
                </span>

                <span>
                  Price
                </span>

                <span>
                  Billing Cycle
                </span>

                <span>
                  Actions
                </span>

              </div>


              {filteredManagementPlans.length ===
              0 ? (

                <div className="table-empty">

                  <strong>
                    No plans found
                  </strong>

                  <p>
                    Try a different search
                    or create a new plan.
                  </p>

                </div>

              ) : (

                filteredManagementPlans.map(
                  (plan) => (

                    <div
                      className="plans-management-row"
                      key={plan.id}
                    >

                      <span>
                        #{plan.id}
                      </span>

                      <span>
                        <strong>
                          {plan.name}
                        </strong>
                      </span>

                      <span>
                        ETB{" "}
                        {(
                          plan.priceCents /
                          100
                        ).toFixed(2)}
                      </span>

                      <span>
                        {plan.billingCycle}
                      </span>

                      <span className="plan-actions">

                        <button
                          type="button"
                          className="edit-plan-button"
                          onClick={() =>
                            openEditPlan(plan)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-plan-button"
                          disabled={
                            deletingPlanId ===
                            plan.id
                          }
                          onClick={() =>
                            handleDeletePlan(
                              plan.id
                            )
                          }
                        >
                          {deletingPlanId ===
                          plan.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </span>

                    </div>

                  )
                )

              )}

            </div>


            <div className="table-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowPlansTable(false)
                }
              >
                Hide Plans
              </button>

            </div>

          </>

        )}

      </div>


      {/* =========================
          CREATE PLAN MODAL
          ========================= */}

      {showCreatePlan && (

        <div
          className="modal-overlay"
          onClick={() => {
            setShowCreatePlan(false);
            createPlanForm.reset();
          }}
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  Create Plan
                </h2>

                <p>
                  Add a new billing plan.
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowCreatePlan(false);
                  createPlanForm.reset();
                }}
              >
                ×
              </button>

            </div>


            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                createPlanForm.handleSubmit();
              }}
            >

              <div className="modal-body">

                <createPlanForm.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) => {

                      if (!value.trim()) {
                        return "Plan name is required.";
                      }

                      if (
                        value.trim().length < 2
                      ) {
                        return "Plan name must be at least 2 characters.";
                      }

                      return undefined;
                    },
                  }}
                >
                  {(field) => (

                    <div className="form-group">

                      <label htmlFor="plan-name">
                        Plan Name
                      </label>

                      <input
                        id="plan-name"
                        type="text"
                        placeholder="Enter Plan Name"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value
                          )
                        }
                        onBlur={field.handleBlur}
                      />

                      {field.state.meta.errors.length >
                        0 && (

                        <p className="form-error">
                          {String(
                            field.state.meta.errors[0]
                          )}
                        </p>

                      )}

                    </div>

                  )}
                </createPlanForm.Field>


                <createPlanForm.Field
                  name="price"
                  validators={{
                    onChange: ({ value }) => {

                      if (!value) {
                        return "Price is required.";
                      }

                      const price =
                        Number(value);

                      if (
                        Number.isNaN(price)
                      ) {
                        return "Please enter a valid price.";
                      }

                      if (price < 0) {
                        return "Price cannot be negative.";
                      }

                      return undefined;
                    },
                  }}
                >
                  {(field) => (

                    <div className="form-group">

                      <label htmlFor="plan-price">
                        Price (ETB)
                      </label>

                      <input
                        id="plan-price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value
                          )
                        }
                        onBlur={field.handleBlur}
                      />

                      {field.state.meta.errors.length >
                        0 && (

                        <p className="form-error">
                          {String(
                            field.state.meta.errors[0]
                          )}
                        </p>

                      )}

                    </div>

                  )}
                </createPlanForm.Field>


                <createPlanForm.Field
                  name="billingCycle"
                  validators={{
                    onChange: ({ value }) => {

                      if (!value) {
                        return "Billing cycle is required.";
                      }

                      return undefined;
                    },
                  }}
                >
                  {(field) => (

                    <div className="form-group">

                      <label htmlFor="billing-cycle">
                        Billing Cycle
                      </label>

                      <select
                        id="billing-cycle"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value
                          )
                        }
                        onBlur={field.handleBlur}
                      >

                        <option
                          value=""
                          disabled
                        >
                          Select billing cycle
                        </option>

                        <option value="WEEKLY">
                          Weekly
                        </option>

                        <option value="MONTHLY">
                          Monthly
                        </option>

                        <option value="YEARLY">
                          Yearly
                        </option>

                      </select>

                      {field.state.meta.errors.length >
                        0 && (

                        <p className="form-error">
                          {String(
                            field.state.meta.errors[0]
                          )}
                        </p>

                      )}

                    </div>

                  )}
                </createPlanForm.Field>

              </div>


              <div className="modal-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setShowCreatePlan(false);
                    createPlanForm.reset();
                  }}
                >
                  Cancel
                </button>

                <createPlanForm.Subscribe
                  selector={(state) => [
                    state.canSubmit,
                    state.isSubmitting,
                  ]}
                >
                  {([
                    canSubmit,
                    isSubmitting,
                  ]) => (

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={
                        !canSubmit ||
                        isSubmitting
                      }
                    >
                      {isSubmitting
                        ? "Creating..."
                        : "Create Plan"}
                    </button>

                  )}
                </createPlanForm.Subscribe>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =========================
          EDIT PLAN MODAL
          ========================= */}

      {editingPlan && (

        <div
          className="modal-overlay"
          onClick={() => {
            setEditingPlan(null);
            editPlanForm.reset();
          }}
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  Edit Plan
                </h2>

                <p>
                  Update the billing plan.
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setEditingPlan(null);
                  editPlanForm.reset();
                }}
              >
                ×
              </button>

            </div>


            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                editPlanForm.handleSubmit();
              }}
            >

              <div className="modal-body">

                <editPlanForm.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) => {

                      if (!value.trim()) {
                        return "Plan name is required.";
                      }

                      if (
                        value.trim().length < 2
                      ) {
                        return "Plan name must be at least 2 characters.";
                      }

                      return undefined;
                    },
                  }}
                >
                  {(field) => (

                    <div className="form-group">

                      <label htmlFor="edit-plan-name">
                        Plan Name
                      </label>

                      <input
                        id="edit-plan-name"
                        type="text"
                        placeholder="Enter Plan Name"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value
                          )
                        }
                        onBlur={field.handleBlur}
                      />

                      {field.state.meta.errors.length >
                        0 && (

                        <p className="form-error">
                          {String(
                            field.state.meta.errors[0]
                          )}
                        </p>

                      )}

                    </div>

                  )}
                </editPlanForm.Field>


                <editPlanForm.Field
                  name="price"
                  validators={{
                    onChange: ({ value }) => {

                      if (!value) {
                        return "Price is required.";
                      }

                      const price =
                        Number(value);

                      if (
                        Number.isNaN(price)
                      ) {
                        return "Please enter a valid price.";
                      }

                      if (price < 0) {
                        return "Price cannot be negative.";
                      }

                      return undefined;
                    },
                  }}
                >
                  {(field) => (

                    <div className="form-group">

                      <label htmlFor="edit-plan-price">
                        Price (ETB)
                      </label>

                      <input
                        id="edit-plan-price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value
                          )
                        }
                        onBlur={field.handleBlur}
                      />

                      {field.state.meta.errors.length >
                        0 && (

                        <p className="form-error">
                          {String(
                            field.state.meta.errors[0]
                          )}
                        </p>

                      )}

                    </div>

                  )}
                </editPlanForm.Field>


                <editPlanForm.Field
                  name="billingCycle"
                  validators={{
                    onChange: ({ value }) => {

                      if (!value) {
                        return "Billing cycle is required.";
                      }

                      return undefined;
                    },
                  }}
                >
                  {(field) => (

                    <div className="form-group">

                      <label htmlFor="edit-billing-cycle">
                        Billing Cycle
                      </label>

                      <select
                        id="edit-billing-cycle"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value
                          )
                        }
                        onBlur={field.handleBlur}
                      >

                        <option
                          value=""
                          disabled
                        >
                          Select billing cycle
                        </option>

                        <option value="WEEKLY">
                          Weekly
                        </option>

                        <option value="MONTHLY">
                          Monthly
                        </option>

                        <option value="YEARLY">
                          Yearly
                        </option>

                      </select>

                      {field.state.meta.errors.length >
                        0 && (

                        <p className="form-error">
                          {String(
                            field.state.meta.errors[0]
                          )}
                        </p>

                      )}

                    </div>

                  )}
                </editPlanForm.Field>

              </div>


              <div className="modal-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setEditingPlan(null);
                    editPlanForm.reset();
                  }}
                >
                  Cancel
                </button>

                <editPlanForm.Subscribe
                  selector={(state) => [
                    state.canSubmit,
                    state.isSubmitting,
                  ]}
                >
                  {([
                    canSubmit,
                    isSubmitting,
                  ]) => (

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={
                        !canSubmit ||
                        isSubmitting
                      }
                    >
                      {isSubmitting
                        ? "Updating..."
                        : "Update Plan"}
                    </button>

                  )}
                </editPlanForm.Subscribe>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =========================
          SUBSCRIPTIONS
          ========================= */}

      <div className="billing-section">

        <div className="section-header">

          <div className="section-header-content">

            <h2>
              Subscriptions
            </h2>

            <p>
              Manage customer
              subscriptions.
            </p>

          </div>

          <div className="section-header-actions">

            <button
              type="button"
              className="primary-button"
              onClick={
                handleOpenCreateSubscription
              }
            >
              + Create Subscription
            </button>

          </div>

        </div>


        {!subscriptionsLoaded ? (

          <div className="table-empty">

            <strong>
              No subscriptions loaded
            </strong>

            <p>
              Click "Get Subscriptions"
              to load subscriptions.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={
                handleLoadSubscriptions
              }
              disabled={
                loadingSubscriptions
              }
            >
              {loadingSubscriptions
                ? "Loading..."
                : "Get Subscriptions"}
            </button>

          </div>

        ) : subscriptionsError ? (

          <div className="table-empty">

            <strong>
              Unable to load subscriptions
            </strong>

            <p>
              {subscriptionsError}
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={
                handleLoadSubscriptions
              }
              disabled={
                loadingSubscriptions
              }
            >
              {loadingSubscriptions
                ? "Loading..."
                : "Try Again"}
            </button>

          </div>

        ) : !showSubscriptionsTable ? (

          <div className="table-empty">

            <strong>
              Subscriptions loaded
            </strong>

            <p>
              The subscription list is currently hidden.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                setShowSubscriptionsTable(
                  true
                )
              }
            >
              Show Subscriptions
            </button>

          </div>

        ) : (

          <>

            <div className="billing-table">

              <div className="table-header subscription-columns">

                <span>
                  Customer
                </span>

                <span>
                  Plan
                </span>

                <span>
                  Status
                </span>

                <span>
                  Period End
                </span>

                <span>
                  Action
                </span>

              </div>


              {subscriptions.length === 0 ? (

                <div className="table-empty">

                  <strong>
                    No subscriptions available
                  </strong>

                  <p>
                    Create a subscription
                    to get started.
                  </p>

                </div>

              ) : (

                subscriptions.map(
                  (subscription) => (

                    <div
                      className="table-row subscription-columns"
                      key={subscription.id}
                    >

                      <span>
                        {getCustomerName(
                          subscription.customerId
                        )}
                      </span>


                      <span>
                        {getPlanName(
                          subscription.planId
                        )}
                      </span>


                      <span>

                        <span
                          className={`status-badge status-${subscription.status.toLowerCase()}`}
                        >
                          {subscription.status}
                        </span>

                      </span>


                      <span>
                        {formatDate(
                          subscription.currentPeriodEnd
                        )}
                      </span>


                      <span>

                        {subscription.status ===
                          "ACTIVE" && (

                          changingSubscriptionId ===
                          subscription.id ? (

                            <div className="table-row-actions">

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
                                      Number(value) ===
                                      subscription.planId
                                    ) {
                                      return "Please select a different plan.";
                                    }

                                    return undefined;
                                  },
                                }}
                              >
                                {(field) => (

                                  <div>

                                    <select
                                      value={
                                        field.state.value
                                      }
                                      onChange={(event) =>
                                        field.handleChange(
                                          event.target.value
                                        )
                                      }
                                      onBlur={
                                        field.handleBlur
                                      }
                                    >

                                      <option value="">
                                        Select plan
                                      </option>

                                      {plans
                                        .filter(
                                          (plan) =>
                                            plan.id !==
                                            subscription.planId
                                        )
                                        .map(
                                          (plan) => (

                                            <option
                                              key={plan.id}
                                              value={plan.id}
                                            >
                                              {plan.name}
                                            </option>

                                          )
                                        )}

                                    </select>


                                    {field.state.meta.errors.length >
                                      0 && (

                                      <p className="form-error">
                                        {String(
                                          field.state.meta.errors[0]
                                        )}
                                      </p>

                                    )}

                                  </div>

                                )}
                              </changePlanForm.Field>


                              <changePlanForm.Subscribe
                                selector={(state) => [
                                  state.canSubmit,
                                  state.isSubmitting,
                                ]}
                              >
                                {([
                                  canSubmit,
                                  isSubmitting,
                                ]) => (

                                  <button
                                    type="button"
                                    className="primary-button"
                                    disabled={
                                      !canSubmit ||
                                      isSubmitting
                                    }
                                    onClick={() =>
                                      changePlanForm.handleSubmit()
                                    }
                                  >
                                    {isSubmitting
                                      ? "Saving..."
                                      : "Save"}
                                  </button>

                                )}
                              </changePlanForm.Subscribe>


                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() => {
                                  setChangingSubscriptionId(
                                    null
                                  );

                                  changePlanForm.reset();
                                }}
                              >
                                Cancel
                              </button>

                            </div>

                          ) : (

                            <div className="table-row-actions">

                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                  handleOpenChangePlan(
                                    subscription.id
                                  )
                                }
                              >
                                Change Plan
                              </button>


                              <button
                                type="button"
                                className="danger-button"
                                onClick={() =>
                                  handleCancelSubscription(
                                    subscription.id
                                  )
                                }
                              >
                                Cancel
                              </button>

                            </div>

                          )

                        )}

                      </span>

                    </div>

                  )
                )

              )}

            </div>


            <div className="table-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowSubscriptionsTable(
                    false
                  )
                }
              >
                Hide Subscriptions
              </button>

            </div>

          </>

        )}

      </div>


      {/* =========================
          CREATE SUBSCRIPTION MODAL
          ========================= */}

      {showCreateSubscription && (

        <div
          className="modal-overlay"
          onClick={() => {
            setShowCreateSubscription(false);
            createSubscriptionForm.reset();
          }}
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  Create Subscription
                </h2>

                <p>
                  Assign a billing plan
                  to a customer.
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowCreateSubscription(false);
                  createSubscriptionForm.reset();
                }}
              >
                ×
              </button>

            </div>


            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                createSubscriptionForm.handleSubmit();
              }}
            >

              <div className="modal-body">

                <createSubscriptionForm.Field
                  name="customerId"
                  validators={{
                    onChange: ({ value }) => {

                      if (!value) {
                        return "Please select a customer.";
                      }

                      return undefined;
                    },
                  }}
                >
                  {(field) => (

                    <div className="form-group">

                      <label htmlFor="customer-search">
                        Customer
                      </label>

                      {customersError && (

                        <p className="form-error">
                          {customersError}
                        </p>

                      )}

                      <div className="search-select">

                        <input
                          id="customer-search"
                          type="text"
                          placeholder={
                            loadingCustomers
                              ? "Loading customers..."
                              : "Search customer by name or email"
                          }
                          value={customerSearch}
                          disabled={
                            loadingCustomers
                          }
                          onChange={(event) => {

                            setCustomerSearch(
                              event.target.value
                            );

                            setShowCustomerResults(
                              true
                            );

                            createSubscriptionForm.setFieldValue(
                              "customerId",
                              ""
                            );

                          }}
                          onFocus={() =>
                            setShowCustomerResults(
                              true
                            )
                          }
                          onBlur={() =>
                            field.handleBlur()
                          }
                        />


                        {showCustomerResults &&
                          customerSearch.trim() !== "" && (

                            <div className="search-results">

                              {filteredCustomers.length ===
                              0 ? (

                                <div className="search-empty">
                                  No customers found
                                </div>

                              ) : (

                                filteredCustomers.map(
                                  (customer) => (

                                    <button
                                      type="button"
                                      className="search-result"
                                      key={customer.id}
                                      onClick={() => {

                                        createSubscriptionForm.setFieldValue(
                                          "customerId",
                                          String(
                                            customer.id
                                          )
                                        );

                                        setCustomerSearch(
                                          `${customer.firstName} ${customer.lastName}`
                                        );

                                        setShowCustomerResults(
                                          false
                                        );

                                      }}
                                    >

                                      <strong>
                                        {
                                          customer.firstName
                                        }{" "}
                                        {
                                          customer.lastName
                                        }
                                      </strong>

                                      <span>
                                        {
                                          customer.email
                                        }
                                      </span>

                                    </button>

                                  )
                                )

                              )}

                            </div>

                          )}

                      </div>


                      {field.state.meta.errors.length >
                        0 && (

                        <p className="form-error">
                          {String(
                            field.state.meta.errors[0]
                          )}
                        </p>

                      )}

                    </div>

                  )}
                </createSubscriptionForm.Field>


                <createSubscriptionForm.Field
                  name="planId"
                  validators={{
                    onChange: ({ value }) => {

                      if (!value) {
                        return "Please select a plan.";
                      }

                      return undefined;
                    },
                  }}
                >
                  {(field) => (

                    <div className="form-group">

                      <label htmlFor="plan-search">
                        Plan
                      </label>

                      <div className="search-select">

                        <input
                          id="plan-search"
                          type="text"
                          placeholder="Search plan"
                          value={planSearch}
                          onChange={(event) => {

                            setPlanSearch(
                              event.target.value
                            );

                            setShowPlanResults(
                              true
                            );

                            createSubscriptionForm.setFieldValue(
                              "planId",
                              ""
                            );

                          }}
                          onFocus={() =>
                            setShowPlanResults(
                              true
                            )
                          }
                          onBlur={() =>
                            field.handleBlur()
                          }
                        />


                        {showPlanResults &&
                          planSearch.trim() !== "" && (

                            <div className="search-results">

                              {filteredPlans.length ===
                              0 ? (

                                <div className="search-empty">
                                  No plans found
                                </div>

                              ) : (

                                filteredPlans.map(
                                  (plan) => (

                                    <button
                                      type="button"
                                      className="search-result"
                                      key={plan.id}
                                      onClick={() => {

                                        createSubscriptionForm.setFieldValue(
                                          "planId",
                                          String(
                                            plan.id
                                          )
                                        );

                                        setPlanSearch(
                                          plan.name
                                        );

                                        setShowPlanResults(
                                          false
                                        );

                                      }}
                                    >

                                      <strong>
                                        {plan.name}
                                      </strong>

                                      <span>
                                        ETB{" "}
                                        {(
                                          plan.priceCents /
                                          100
                                        ).toFixed(2)}
                                        {" / "}
                                        {
                                          plan.billingCycle
                                        }
                                      </span>

                                    </button>

                                  )
                                )

                              )}

                            </div>

                          )}

                      </div>


                      {field.state.meta.errors.length >
                        0 && (

                        <p className="form-error">
                          {String(
                            field.state.meta.errors[0]
                          )}
                        </p>

                      )}

                    </div>

                  )}
                </createSubscriptionForm.Field>

              </div>


              <div className="modal-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setShowCreateSubscription(
                      false
                    );

                    setCustomerSearch("");
                    setPlanSearch("");

                    setShowCustomerResults(
                      false
                    );

                    setShowPlanResults(
                      false
                    );

                    createSubscriptionForm.reset();
                  }}
                >
                  Cancel
                </button>


                <createSubscriptionForm.Subscribe
                  selector={(state) => [
                    state.canSubmit,
                    state.isSubmitting,
                  ]}
                >
                  {([
                    canSubmit,
                    isSubmitting,
                  ]) => (

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={
                        !canSubmit ||
                        isSubmitting
                      }
                    >
                      {isSubmitting
                        ? "Creating..."
                        : "Create Subscription"}
                    </button>

                  )}
                </createSubscriptionForm.Subscribe>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =========================
          INVOICES
          ========================= */}

      <div className="billing-section">

        <div className="section-header">

          <div className="section-header-content">

            <h2>
              Invoices
            </h2>

            <p>
              View customer invoices
              and payment status.
            </p>

          </div>

        </div>


        {!invoicesLoaded ? (

          <div className="table-empty">

            <strong>
              No invoices loaded
            </strong>

            <p>
              Click "Get Invoices" to
              load customer invoices.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={handleLoadInvoices}
              disabled={loadingInvoices}
            >
              {loadingInvoices
                ? "Loading..."
                : "Get Invoices"}
            </button>

          </div>

        ) : invoicesError ? (

          <div className="table-empty">

            <strong>
              Unable to load invoices
            </strong>

            <p>
              {invoicesError}
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={handleLoadInvoices}
              disabled={loadingInvoices}
            >
              {loadingInvoices
                ? "Loading..."
                : "Try Again"}
            </button>

          </div>

        ) : !showInvoicesTable ? (

          <div className="table-empty">

            <strong>
              Invoices loaded
            </strong>

            <p>
              The invoice list is currently hidden.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                setShowInvoicesTable(
                  true
                )
              }
            >
              Show Invoices
            </button>

          </div>

        ) : (

          <>

            <div className="plans-toolbar">

              <input
                type="text"
                className="plans-search-input"
                placeholder="Search invoices by ID, customer, or status..."
                value={invoiceSearch}
                onChange={(event) =>
                  setInvoiceSearch(
                    event.target.value
                  )
                }
              />

              <button
                type="button"
                className="secondary-button"
                onClick={handleLoadInvoices}
                disabled={loadingInvoices}
              >
                {loadingInvoices
                  ? "Refreshing..."
                  : "Refresh Invoices"}
              </button>

            </div>


            <div className="billing-table">

              <div className="table-header invoice-columns">

                <span>
                  Invoice
                </span>

                <span>
                  Customer
                </span>

                <span>
                  Amount
                </span>

                <span>
                  Status
                </span>

                <span>
                  Due Date
                </span>

                <span>
                  Paid At
                </span>

                <span>
                  Action
                </span>

              </div>


              {filteredInvoices.length === 0 ? (

                <div className="table-empty">

                  <strong>
                    No invoices found
                  </strong>

                  <p>
                    Try a different search.
                  </p>

                </div>

              ) : (

                filteredInvoices.map(
                  (invoice) => (

                    <div
                      className="table-row invoice-columns"
                      key={invoice.id}
                    >

                      <span>
                        #{invoice.id}
                      </span>

                      <span>
                        {getCustomerName(
                          invoice.customerId
                        )}
                      </span>

                      <span>
                        ETB{" "}
                        {(
                          invoice.amountCents /
                          100
                        ).toFixed(2)}
                      </span>

                      <span>

                        <span
                          className={`status-badge status-${invoice.status.toLowerCase()}`}
                        >
                          {invoice.status}
                        </span>

                      </span>

                      <span>
                        {formatDate(
                          invoice.dueDate
                        )}
                      </span>

                      <span>
                        {invoice.paidAt
                          ? formatDate(
                              invoice.paidAt
                            )
                          : "-"}
                      </span>

                      <span className="table-row-actions">

                        {invoice.status ===
                          "PENDING" && (

                          <button
                            type="button"
                            className="primary-button"
                            onClick={() =>
                              handlePayInvoice(
                                invoice.id
                              )
                            }
                          >
                            Pay
                          </button>

                        )}

                        {invoice.status ===
                          "PAID" && (

                          <span className="paid-label">
                            Paid
                          </span>

                        )}

                      </span>

                    </div>

                  )
                )

              )}

            </div>


            <div className="table-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowInvoicesTable(
                    false
                  )
                }
              >
                Hide Invoices
              </button>

            </div>

          </>

        )}

      </div>


      {/* =========================
          PAYMENT ATTEMPTS
          ========================= */}

      <div className="billing-section">

        <div className="section-header">

          <div className="section-header-content">

            <h2>
              Payment Attempts
            </h2>

            <p>
              Track payment activity
              across invoices.
            </p>

          </div>

        </div>


        {!paymentAttemptsLoaded ? (

          <div className="table-empty">

            <strong>
              No payment attempts loaded
            </strong>

            <p>
              Click "Get Payment Attempts"
              to load payment activity.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={
                handleLoadPaymentAttempts
              }
              disabled={
                loadingPaymentAttempts
              }
            >
              {loadingPaymentAttempts
                ? "Loading..."
                : "Get Payment Attempts"}
            </button>

          </div>

        ) : paymentAttemptsError ? (

          <div className="table-empty">

            <strong>
              Unable to load payment attempts
            </strong>

            <p>
              {paymentAttemptsError}
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={
                handleLoadPaymentAttempts
              }
              disabled={
                loadingPaymentAttempts
              }
            >
              {loadingPaymentAttempts
                ? "Loading..."
                : "Try Again"}
            </button>

          </div>

        ) : !showPaymentAttemptsTable ? (

          <div className="table-empty">

            <strong>
              Payment attempts loaded
            </strong>

            <p>
              The payment activity list is currently hidden.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                setShowPaymentAttemptsTable(
                  true
                )
              }
            >
              Show Payment Attempts
            </button>

          </div>

        ) : (

          <>

            <div className="plans-toolbar">

              <input
                type="text"
                className="plans-search-input"
                placeholder="Search by attempt ID, invoice ID, or status..."
                value={
                  paymentAttemptSearch
                }
                onChange={(event) =>
                  setPaymentAttemptSearch(
                    event.target.value
                  )
                }
              />

              <button
                type="button"
                className="secondary-button"
                onClick={
                  handleLoadPaymentAttempts
                }
                disabled={
                  loadingPaymentAttempts
                }
              >
                {loadingPaymentAttempts
                  ? "Refreshing..."
                  : "Refresh Attempts"}
              </button>

            </div>


            <div className="billing-table">

              <div className="table-header payment-attempt-columns">

                <span>
                  Attempt
                </span>

                <span>
                  Invoice
                </span>

                <span>
                  Status
                </span>

                <span>
                  Attempted At
                </span>

              </div>


              {filteredPaymentAttempts.length ===
              0 ? (

                <div className="table-empty">

                  <strong>
                    No payment attempts found
                  </strong>

                  <p>
                    Try a different search.
                  </p>

                </div>

              ) : (

                filteredPaymentAttempts.map(
                  (attempt) => (

                    <div
                      className="table-row payment-attempt-columns"
                      key={attempt.id}
                    >

                      <span>
                        #{attempt.id}
                      </span>

                      <span>
                        Invoice #{attempt.invoiceId}
                      </span>

                      <span>

                        <span
                          className={`status-badge status-${attempt.status.toLowerCase()}`}
                        >
                          {attempt.status}
                        </span>

                      </span>

                      <span>
                        {formatDate(
                          attempt.attemptedAt
                        )}
                      </span>

                    </div>

                  )
                )

              )}

            </div>


            <div className="table-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowPaymentAttemptsTable(
                    false
                  )
                }
              >
                Hide Payment Attempts
              </button>

            </div>

          </>

        )}

      </div>


      {/* =========================
          BILLING HEALTH
          ========================= */}

      {(subscriptionsLoaded ||
        paymentAttemptsLoaded) && (

        <div className="billing-section">

          <div className="section-header">

            <div className="section-header-content">

              <h2>
                Billing Health
              </h2>

              <p>
                Current billing activity.
              </p>

            </div>

          </div>


          <div className="billing-stats">

            {subscriptionsLoaded && (

              <div className="billing-stat-card">

                <div className="billing-stat-card-top">

                  <div className="billing-stat-card-content">

                    <span>
                      Canceled Subscriptions
                    </span>

                    <strong>
                      {canceledSubscriptions}
                    </strong>

                    <small>
                      Canceled customer subscriptions
                    </small>

                  </div>

                </div>

              </div>

            )}


            {paymentAttemptsLoaded && (

              <div className="billing-stat-card">

                <div className="billing-stat-card-top">

                  <div className="billing-stat-card-content">

                    <span>
                      Failed Payments
                    </span>

                    <strong>
                      {failedPaymentAttempts}
                    </strong>

                    <small>
                      Failed payment attempts
                    </small>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Billing;