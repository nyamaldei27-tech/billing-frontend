import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

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
  const navigate = useNavigate();

  const {
    invoices,
    subscriptions,
    loadingInvoices,
    loadingSubscriptions,

    churnRisks,
    loadingChurnRisk,

    fetchInvoices,
    fetchSubscriptions,
    fetchChurnRisks,
  } = useBillingStore();

  const loading =
    loadingSubscriptions ||
    loadingInvoices;

  useEffect(() => {
    fetchInvoices();
    fetchSubscriptions();
  }, [
    fetchInvoices,
    fetchSubscriptions,
  ]);

  /*
   * Get every unique customer ID represented
   * in the billing data.
   *
   * This removes the old hardcoded customerId = 2.
   */
  const customerIds = [
    ...new Set([
      ...subscriptions.map(
        (subscription) =>
          subscription.customerId
      ),
      ...invoices.map(
        (invoice) =>
          invoice.customerId
      ),
    ]),
  ];

  useEffect(() => {
    if (customerIds.length === 0) {
      return;
    }

    fetchChurnRisks(customerIds);
  }, [
    subscriptions,
    invoices,
    fetchChurnRisks,
  ]);

  /* =========================
     DASHBOARD METRICS
     ========================= */

  const totalRevenue =
    invoices
      .filter(
        (invoice) =>
          invoice.status === "PAID"
      )
      .reduce(
        (total, invoice) =>
          total + invoice.amountCents,
        0
      );

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

  const churnRate =
    subscriptions.length > 0
      ? (canceledSubscriptions /
          subscriptions.length) *
        100
      : 0;

  const formatMoney = (
    cents: number
  ) => {
    return `ETB ${(cents / 100).toFixed(2)}`;
  };

  /* =========================
     REVENUE DATA
     ========================= */

  const paidInvoices =
    invoices.filter(
      (invoice) =>
        invoice.status === "PAID"
    );

  const monthlyRevenue: Record<
    string,
    number
  > = {};

  paidInvoices.forEach(
    (invoice) => {
      if (!invoice.paidAt) {
        return;
      }

      const date = new Date(
        invoice.paidAt
      );

      const month =
        date.toLocaleDateString(
          "en-US",
          {
            month: "short",
            year: "numeric",
          }
        );

      monthlyRevenue[month] =
        (monthlyRevenue[month] || 0) +
        invoice.amountCents / 100;
    }
  );

  const revenueData =
    Object.entries(
      monthlyRevenue
    ).map(
      ([month, revenue]) => ({
        month,
        revenue,
      })
    );

  /* =========================
     RECENT INVOICES
     ========================= */

  const recentInvoices =
    [...invoices]
      .sort(
        (a, b) =>
          b.id - a.id
      )
      .slice(0, 5);

  /* =========================
     CHURN DATA
     ========================= */

  const churnData =
    customerIds
      .map((customerId) => ({
        customerId,
        churnRisk:
          churnRisks[customerId] ||
          null,
      }))
      .sort((a, b) => {
        const scoreA =
          a.churnRisk?.riskScore ?? -1;

        const scoreB =
          b.churnRisk?.riskScore ?? -1;

        return scoreB - scoreA;
      });

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>Dashboard</h1>
        <p>
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <h1>
            Admin Dashboard
          </h1>

          <p>
            Overview of billing,
            subscriptions, revenue,
            and customer churn.
          </p>
        </div>
      </div>

      {/* METRIC CARDS */}

      <div className="dashboard-stats">

        <div className="dashboard-card">
          <div className="card-label">
            Total Revenue
          </div>

          <div className="card-value">
            {formatMoney(
              totalRevenue
            )}
          </div>

          <div className="card-description">
            Revenue from paid invoices
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-label">
            Active Subscriptions
          </div>

          <div className="card-value">
            {activeSubscriptions}
          </div>

          <div className="card-description">
            Currently active
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-label">
            Pending Invoices
          </div>

          <div className="card-value">
            {pendingInvoices}
          </div>

          <div className="card-description">
            Awaiting payment
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-label">
            Churn Rate
          </div>

          <div className="card-value">
            {churnRate.toFixed(1)}%
          </div>

          <div className="card-description">
            Canceled subscriptions
          </div>
        </div>

      </div>

      {/* CHURN RISK */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>
            <h2>
              Customer Churn Risk
            </h2>

            <p>
              Current churn risk for
              customers in billing data.
            </p>
          </div>

        </div>

        {loadingChurnRisk ? (
          <div className="dashboard-empty">
            Calculating customer
            churn risks...
          </div>
        ) : churnData.length === 0 ? (
          <div className="dashboard-empty">
            No customer churn data
            available.
          </div>
        ) : (
          <div className="dashboard-table">

            <div className="dashboard-table-header">
              <span>
                Customer
              </span>

              <span>
                Risk Score
              </span>

              <span>
                Risk Level
              </span>

              <span>
                Action
              </span>
            </div>

            {churnData.map(
              ({
                customerId,
                churnRisk,
              }) => (
                <div
                  className="dashboard-table-row"
                  key={customerId}
                >

                  <span>
                    Customer #
                    {customerId}
                  </span>

                  <span>
                    {churnRisk
                      ? churnRisk.riskScore
                      : "N/A"}
                  </span>

                  <span>
                    {churnRisk ? (
                      <span
                        className={`dashboard-status dashboard-status-${churnRisk.riskLevel.toLowerCase()}`}
                      >
                        {churnRisk.riskLevel}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </span>

                  <span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "/customers",
                        })
                      }
                    >
                      View Customer
                    </button>
                  </span>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* RECENT INVOICES */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>
            <h2>
              Recent Invoices
            </h2>

            <p>
              Latest billing activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/billing",
              })
            }
          >
            View All Invoices
          </button>

        </div>

        {loadingInvoices ? (
          <div className="dashboard-empty">
            Loading invoices...
          </div>
        ) : recentInvoices.length === 0 ? (
          <div className="dashboard-empty">
            No invoices yet.
          </div>
        ) : (
          <div className="dashboard-table">

            <div className="dashboard-table-header">

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
                Action
              </span>

            </div>

            {recentInvoices.map(
              (invoice) => (
                <div
                  className="dashboard-table-row"
                  key={invoice.id}
                >

                  <span>
                    #{invoice.id}
                  </span>

                  <span>
                    Customer #
                    {invoice.customerId}
                  </span>

                  <span>
                    {formatMoney(
                      invoice.amountCents
                    )}
                  </span>

                  <span>
                    <span
                      className={`dashboard-status dashboard-status-${invoice.status.toLowerCase()}`}
                    >
                      {invoice.status}
                    </span>
                  </span>

                  <span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "/billing",
                        })
                      }
                    >
                      View
                    </button>
                  </span>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* REVENUE OVERVIEW */}

      <section className="dashboard-section revenue-section">

        <div className="dashboard-section-header">

          <div>
            <h2>
              Revenue Overview
            </h2>

            <p>
              Revenue generated from
              paid invoices.
            </p>
          </div>

        </div>

        <div className="revenue-chart">

          {revenueData.length === 0 ? (
            <div className="dashboard-empty">
              No paid invoices yet.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <LineChart
                data={revenueData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                />

                <YAxis />

                <Tooltip
                  formatter={(
                    value
                  ) => [
                    `ETB ${value}`,
                    "Revenue",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                  }}
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
            <h2>
              Subscription Summary
            </h2>

            <p>
              Current subscription
              status.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/Billing",
              })
            }
          >
            Manage Billing
          </button>

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