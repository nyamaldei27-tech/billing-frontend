import "./Billing.css";
import { useEffect, useState } from "react";

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
  const [subscriptionsLoaded, setSubscriptionsLoaded] = useState(false);
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

  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("");

  const [planManagementSearch, setPlanManagementSearch] = useState("");

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [editPlanName, setEditPlanName] = useState("");
  const [editPlanPrice, setEditPlanPrice] = useState("");
  const [editPlanBillingCycle, setEditPlanBillingCycle] =
    useState("");

  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(
    null
  );

  /* =========================
     SUBSCRIPTION STATE
     ========================= */

  const [showCreateSubscription, setShowCreateSubscription] =
    useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

  const [changingSubscriptionId, setChangingSubscriptionId] =
    useState<number | null>(null);

  const [selectedChangePlan, setSelectedChangePlan] = useState("");

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

  const [showPlanResults, setShowPlanResults] = useState(false);

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
      console.error("LOAD CUSTOMERS ERROR:", error);
    }
  };

  /* =========================
     BILLING STATISTICS
     ========================= */

  const activeSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.status === "ACTIVE"
  ).length;

  const pendingInvoices = invoices.filter(
    (invoice) =>
      invoice.status === "PENDING"
  ).length;

  const canceledSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.status === "CANCELED"
  ).length;

  const failedPaymentAttempts = paymentAttempts.filter(
    (attempt) =>
      attempt.status === "FAILED"
  ).length;

  const paidInvoices = invoices.filter(
    (invoice) =>
      invoice.status === "PAID"
  );

  const totalRevenueCents = paidInvoices.reduce(
    (total, invoice) =>
      total + invoice.amountCents,
    0
  );

  const totalRevenue = totalRevenueCents / 100;

  /* =========================
     CREATE PLAN
     ========================= */

  const handleCreatePlan = async () => {
    if (
      !planName.trim() ||
      !planPrice ||
      !billingCycle
    ) {
      alert("Please complete all plan fields.");
      return;
    }

    const price = Number(planPrice);

    if (Number.isNaN(price) || price < 0) {
      alert("Please enter a valid plan price.");
      return;
    }

    try {
      await createPlan({
        name: planName.trim(),
        priceCents: Math.round(price * 100),
        billingCycle,
      });

      setPlanName("");
      setPlanPrice("");
      setBillingCycle("");
      setShowCreatePlan(false);
      setPlansLoaded(true);
    } catch (error) {
      console.error(
        "CREATE PLAN ERROR:",
        error
      );

      alert("Failed to create plan.");
    }
  };

  /* =========================
     EDIT PLAN
     ========================= */

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);

    setEditPlanName(plan.name);
    setEditPlanPrice(
      (plan.priceCents / 100).toFixed(2)
    );
    setEditPlanBillingCycle(plan.billingCycle);
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) {
      return;
    }

    if (
      !editPlanName.trim() ||
      !editPlanPrice ||
      !editPlanBillingCycle
    ) {
      alert("Please complete all plan fields.");
      return;
    }

    const price = Number(editPlanPrice);

    if (Number.isNaN(price) || price < 0) {
      alert("Please enter a valid plan price.");
      return;
    }

    try {
      await updatePlan(
        editingPlan.id,
        {
          name: editPlanName.trim(),
          priceCents: Math.round(price * 100),
          billingCycle: editPlanBillingCycle,
        }
      );

      setEditingPlan(null);
      setEditPlanName("");
      setEditPlanPrice("");
      setEditPlanBillingCycle("");
    } catch (error) {
      console.error(
        "UPDATE PLAN ERROR:",
        error
      );

      alert("Failed to update plan.");
    }
  };

  /* =========================
     DELETE PLAN
     ========================= */

  const handleDeletePlan = async (id: number) => {
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
     CREATE SUBSCRIPTION
     ========================= */

  const handleOpenCreateSubscription = async () => {
    setShowCreateSubscription(true);

    if (customers.length === 0) {
      await handleLoadCustomers();
    }

    if (plans.length === 0) {
      await handleLoadPlans();
    }
  };

  const handleCreateSubscription = async () => {
    if (
      !selectedCustomer ||
      !selectedPlan
    ) {
      alert(
        "Please select a customer and a plan."
      );

      return;
    }

    try {
      await createSubscription({
        customerId: Number(selectedCustomer),
        planId: Number(selectedPlan),
      });

      setSelectedCustomer("");
      setSelectedPlan("");

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
  };

  /* =========================
     CANCEL SUBSCRIPTION
     ========================= */

  const handleCancelSubscription = async (
    id: number
  ) => {
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
     CHANGE SUBSCRIPTION PLAN
     ========================= */

  const handleChangeSubscriptionPlan = async () => {
    if (
      changingSubscriptionId === null ||
      !selectedChangePlan
    ) {
      return;
    }

    try {
      await changeSubscriptionPlan(
        changingSubscriptionId,
        Number(selectedChangePlan)
      );

      setChangingSubscriptionId(null);
      setSelectedChangePlan("");
    } catch (error) {
      console.error(
        "CHANGE PLAN ERROR:",
        error
      );

      alert(
        "Failed to change subscription plan."
      );
    }
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
    const customer = customers.find(
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
    const plan = plans.find(
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

    return new Date(date).toLocaleDateString();
  };

  /* =========================
     SEARCH FILTERS
     ========================= */

  const filteredCustomers = customers.filter(
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

  const filteredPlans = plans.filter(
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
    plans.filter((plan) => {
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
    });

  const filteredInvoices = invoices.filter(
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
        String(invoice.id).includes(search) ||
        String(invoice.customerId).includes(search) ||
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
          String(attempt.id).includes(search) ||
          String(attempt.invoiceId).includes(search) ||
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
          <h1>Billing</h1>

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
          <span>Total Plans</span>

          <strong>
            {plansLoaded
              ? plans.length
              : "—"}
          </strong>

          <small>
            Available billing plans
          </small>
        </div>

        <div className="billing-stat-card">
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

        <div className="billing-stat-card">
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

        <div className="billing-stat-card">
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

      {/* =========================
          PLANS
          ========================= */}

      <div className="billing-section">

        <div className="section-header">

          <div>
            <h2>Plans</h2>

            <p>
              Manage your available
              billing plans.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              setShowCreatePlan(true)
            }
          >
            + Create Plan
          </button>

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
                onChange={(e) =>
                  setPlanManagementSearch(
                    e.target.value
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
                <span>ID</span>
                <span>Plan</span>
                <span>Price</span>
                <span>Billing Cycle</span>
                <span>Actions</span>
              </div>

              {filteredManagementPlans.length === 0 ? (

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
                        {(plan.priceCents / 100).toFixed(2)}
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
          onClick={() =>
            setShowCreatePlan(false)
          }
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>Create Plan</h2>

                <p>
                  Add a new billing plan.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowCreatePlan(false)
                }
              >
                ×
              </button>

            </div>

            <div className="modal-body">

              <div className="form-group">

                <label htmlFor="plan-name">
                  Plan Name
                </label>

                <input
                  id="plan-name"
                  type="text"
                  placeholder="Enter Plan Name"
                  value={planName}
                  onChange={(e) =>
                    setPlanName(
                      e.target.value
                    )
                  }
                />

              </div>

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
                  value={planPrice}
                  onChange={(e) =>
                    setPlanPrice(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="form-group">

                <label htmlFor="billing-cycle">
                  Billing Cycle
                </label>

                <select
                  id="billing-cycle"
                  value={billingCycle}
                  onChange={(e) =>
                    setBillingCycle(
                      e.target.value
                    )
                  }
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

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setShowCreatePlan(false)
                }
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={handleCreatePlan}
              >
                Create Plan
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =========================
          EDIT PLAN MODAL
          ========================= */}

      {editingPlan && (

        <div
          className="modal-overlay"
          onClick={() =>
            setEditingPlan(null)
          }
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
                  Update the billing
                  plan details.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setEditingPlan(null)
                }
              >
                ×
              </button>

            </div>

            <div className="modal-body">

              <div className="form-group">

                <label htmlFor="edit-plan-name">
                  Plan Name
                </label>

                <input
                  id="edit-plan-name"
                  type="text"
                  value={editPlanName}
                  onChange={(e) =>
                    setEditPlanName(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="form-group">

                <label htmlFor="edit-plan-price">
                  Price (ETB)
                </label>

                <input
                  id="edit-plan-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPlanPrice}
                  onChange={(e) =>
                    setEditPlanPrice(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="form-group">

                <label htmlFor="edit-plan-cycle">
                  Billing Cycle
                </label>

                <select
                  id="edit-plan-cycle"
                  value={editPlanBillingCycle}
                  onChange={(e) =>
                    setEditPlanBillingCycle(
                      e.target.value
                    )
                  }
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

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setEditingPlan(null)
                }
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={
                  handleUpdatePlan
                }
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =========================
          SUBSCRIPTIONS
          ========================= */}

      <div className="billing-section">

        <div className="section-header">

          <div>

            <h2>
              Subscriptions
            </h2>

            <p>
              Manage customer
              subscriptions.
            </p>

          </div>

          <button
            className="primary-button"
            onClick={
              handleOpenCreateSubscription
            }
          >
            + Create Subscription
          </button>

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
              className="primary-button"
              onClick={() =>
                setShowSubscriptionsTable(true)
              }
            >
              Show Subscriptions
            </button>

          </div>

        ) : (

          <>

            <div className="billing-table">

              <div className="table-header subscription-columns">

                <span>Customer</span>
                <span>Plan</span>
                <span>Status</span>
                <span>Period End</span>
                <span>Action</span>

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

                          <>
                            {changingSubscriptionId ===
                            subscription.id ? (

                              <div>

                                <select
                                  value={
                                    selectedChangePlan
                                  }
                                  onChange={(e) =>
                                    setSelectedChangePlan(
                                      e.target.value
                                    )
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

                                <button
                                  type="button"
                                  className="primary-button"
                                  onClick={
                                    handleChangeSubscriptionPlan
                                  }
                                >
                                  Save
                                </button>

                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => {
                                    setChangingSubscriptionId(
                                      null
                                    );
                                    setSelectedChangePlan(
                                      ""
                                    );
                                  }}
                                >
                                  Cancel
                                </button>

                              </div>

                            ) : (

                              <>

                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => {
                                    if (
                                      !plansLoaded
                                    ) {
                                      handleLoadPlans();
                                    }

                                    setChangingSubscriptionId(
                                      subscription.id
                                    );
                                  }}
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

                              </>

                            )}

                          </>

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
                  setShowSubscriptionsTable(false)
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
          onClick={() =>
            setShowCreateSubscription(false)
          }
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
                className="modal-close"
                onClick={() =>
                  setShowCreateSubscription(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="modal-body">

              {/* CUSTOMER */}

              <div className="form-group">

                <label htmlFor="customer-search">
                  Customer
                </label>

                {customersError && (
                  <p>
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
                    value={
                      customerSearch
                    }
                    disabled={
                      loadingCustomers
                    }
                    onChange={(e) => {

                      setCustomerSearch(
                        e.target.value
                      );

                      setSelectedCustomer("");

                      setShowCustomerResults(
                        true
                      );

                    }}
                    onFocus={() =>
                      setShowCustomerResults(
                        true
                      )
                    }
                  />

                  {showCustomerResults &&
                    customerSearch.trim() !== "" && (

                    <div className="search-results">

                      {filteredCustomers.length === 0 ? (

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

                                setSelectedCustomer(
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
                                {customer.firstName}{" "}
                                {customer.lastName}
                              </strong>

                              <span>
                                {customer.email}
                              </span>

                            </button>

                          )
                        )

                      )}

                    </div>

                  )}

                </div>

              </div>

              {/* PLAN */}

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
                    onChange={(e) => {

                      setPlanSearch(
                        e.target.value
                      );

                      setSelectedPlan("");

                      setShowPlanResults(
                        true
                      );

                    }}
                    onFocus={() =>
                      setShowPlanResults(
                        true
                      )
                    }
                  />

                  {showPlanResults &&
                    planSearch.trim() !== "" && (

                    <div className="search-results">

                      {filteredPlans.length === 0 ? (

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

                                setSelectedPlan(
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
                                  plan.priceCents / 100
                                ).toFixed(2)}
                                {" / "}
                                {plan.billingCycle}
                              </span>

                            </button>

                          )
                        )

                      )}

                    </div>

                  )}

                </div>

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() => {

                  setShowCreateSubscription(false);

                  setSelectedCustomer("");
                  setSelectedPlan("");

                  setCustomerSearch("");
                  setPlanSearch("");

                  setShowCustomerResults(false);
                  setShowPlanResults(false);

                }}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={
                  handleCreateSubscription
                }
              >
                Create Subscription
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =========================
          INVOICES
          ========================= */}

      <div className="billing-section">

        <div className="section-header">

          <div>

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
              className="primary-button"
              onClick={() =>
                setShowInvoicesTable(true)
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
                onChange={(e) =>
                  setInvoiceSearch(
                    e.target.value
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

                <span>Invoice</span>
                <span>Customer</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Due Date</span>
                <span>Paid At</span>
                <span>Action</span>

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
                        {(invoice.amountCents / 100).toFixed(2)}
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

                      <span>

                        {invoice.status ===
                          "PENDING" && (

                          <button
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
                  setShowInvoicesTable(false)
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

          <div>

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
              className="primary-button"
              onClick={() =>
                setShowPaymentAttemptsTable(true)
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
                value={paymentAttemptSearch}
                onChange={(e) =>
                  setPaymentAttemptSearch(
                    e.target.value
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

                <span>Attempt</span>
                <span>Invoice</span>
                <span>Status</span>
                <span>Attempted At</span>

              </div>

              {filteredPaymentAttempts.length === 0 ? (

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
                  setShowPaymentAttemptsTable(false)
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

            <div>

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
            )}

            {paymentAttemptsLoaded && (
              <div className="billing-stat-card">

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
            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Billing;