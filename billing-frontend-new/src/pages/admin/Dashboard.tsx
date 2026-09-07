import { useEffect } from "react";
import useBillingStore from "../../stores/billingStore";


import "./Dashboard.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function Dashboard() {
  const {
  invoices,
  subscriptions,
  loadingInvoices,
  loadingSubscriptions,
  fetchInvoices,
  fetchSubscriptions,
} = useBillingStore();

const loading = loadingSubscriptions;

useEffect(() => {
  fetchInvoices();
  fetchSubscriptions();
}, [fetchInvoices, fetchSubscriptions]);

  /* =========================
     DASHBOARD METRICS
     ========================= */

  const totalRevenue = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((total, invoice) => total + invoice.amountCents, 0);

  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "ACTIVE"
  ).length;

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === "PENDING"
  ).length;

  const canceledSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "CANCELED"
  ).length;

  const churnRate =
    subscriptions.length > 0
      ? (canceledSubscriptions / subscriptions.length) * 100
      : 0;

  const formatMoney = (cents: number) => {
    return `ETB ${(cents / 100).toFixed(2)}`;
  };

  const paidInvoices = invoices.filter(
  (invoice) => invoice.status === "PAID"
);

const monthlyRevenue: Record<string, number> = {};

paidInvoices.forEach((invoice) => {
 if (!invoice.paidAt) {
    return;
  }

  const date = new Date(invoice.paidAt);

  const month = date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  monthlyRevenue[month] =
    (monthlyRevenue[month] || 0) + invoice.amountCents / 100;
});

const revenueData = Object.entries(monthlyRevenue).map(
  ([month, revenue]) => ({
    month,
    revenue,
  })
);

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Overview of your billing and subscription activity.
          </p>
        </div>
      </div>

      {/* METRIC CARDS */}

      <div className="dashboard-stats">

        <div className="dashboard-card">
          <div className="card-label">Total Revenue</div>

          <div className="card-value">
            {formatMoney(totalRevenue)}
          </div>

          <div className="card-description">
            Revenue from paid invoices
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-label">Active Subscriptions</div>

          <div className="card-value">
            {activeSubscriptions}
          </div>

          <div className="card-description">
            Currently active
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-label">Pending Invoices</div>

          <div className="card-value">
            {pendingInvoices}
          </div>

          <div className="card-description">
            Awaiting payment
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-label">Churn Rate</div>

          <div className="card-value">
            {churnRate.toFixed(1)}%
          </div>

          <div className="card-description">
            Canceled subscriptions
          </div>
        </div>

      </div>
      {/* RECENT INVOICES */}

<section className="dashboard-section">

  <div className="dashboard-section-header">
    <div>
      <h2>Recent Invoices</h2>
      <p>Latest billing activity.</p>
    </div>
  </div>

  {loadingInvoices ? (
    <div className="dashboard-empty">
      Loading invoices...
    </div>
  ) : invoices.length === 0 ? (
    <div className="dashboard-empty">
      No invoices yet.
    </div>
  ) : (
    <div className="dashboard-table">

      <div className="dashboard-table-header">
        <span>Invoice</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Due Date</span>
      </div>

      {invoices.slice(0, 5).map((invoice) => (
        <div
          className="dashboard-table-row"
          key={invoice.id}
        >
          <span>
            #{invoice.id}
          </span>

          <span>
            {formatMoney(invoice.amountCents)}
          </span>

          <span>
            <span
              className={`dashboard-status dashboard-status-${invoice.status.toLowerCase()}`}
            >
              {invoice.status}
            </span>
          </span>

          <span>
            {new Date(invoice.dueDate).toLocaleDateString()}
          </span>
        </div>
      ))}

    </div>
  )}

</section>

      <section className="dashboard-section revenue-section">
  <div className="dashboard-section-header">
    <div>
      <h2>Revenue Overview</h2>
      <p>Revenue generated from paid invoices.</p>
    </div>
  </div>

  <div className="revenue-chart">
    {revenueData.length === 0 ? (
      <div className="dashboard-empty">
        No paid invoices yet.
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip
            formatter={(value) => [`ETB ${value}`, "Revenue"]}
          />

          <Line
            type="monotone"
            dataKey="revenue"
            strokeWidth={3}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )}
  </div>
</section>

      {/* SUBSCRIPTION SUMMARY */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">
          <div>
            <h2>Subscription Summary</h2>
            <p>Current subscription status.</p>
          </div>
        </div>

        <div className="subscription-summary">

          <div className="summary-item">
            <span className="summary-number">
              {subscriptions.length}
            </span>

            <span className="summary-label">
              Total
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-number">
              {activeSubscriptions}
            </span>

            <span className="summary-label">
              Active
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-number">
              {canceledSubscriptions}
            </span>

            <span className="summary-label">
              Canceled
            </span>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;