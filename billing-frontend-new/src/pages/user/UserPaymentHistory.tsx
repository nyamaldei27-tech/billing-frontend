import { useEffect } from "react";
import { Link } from "@tanstack/react-router";

import useBillingStore from "../../stores/billingStore";
import useCustomerStore from "../../stores/customerStore";

import "./UserPaymentHistory.css";

function UserPaymentHistory() {

const fetchCurrentCustomer = useCustomerStore(
  (state) => state.fetchCurrentCustomer
);

  const {
    paymentAttempts,
    loadingPaymentAttempts,
    paymentAttemptsError,
    fetchPaymentAttemptsByCustomerId,
  } = useBillingStore();
useEffect(() => {
  const loadPaymentHistory = async () => {
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

      await fetchPaymentAttemptsByCustomerId(
        customer.id
      );
    } catch (error) {
      console.error(
        "Failed to load payment history:",
        error
      );
    }
  };

  loadPaymentHistory();
}, [
  fetchCurrentCustomer,
  fetchPaymentAttemptsByCustomerId,
]);

  if (loadingPaymentAttempts) {
    return (
      <main className="user-payment-page">
        <div className="user-payment-header">
          <h1>Payment History</h1>
          <p>Loading your payment history...</p>
        </div>
      </main>
    );
  }

  if (paymentAttemptsError) {
    return (
      <main className="user-payment-page">
        <div className="user-payment-header">
          <h1>Payment History</h1>
          <p>{paymentAttemptsError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="user-payment-page">
      <div className="user-payment-header">
        <div>
          <h1>Payment History</h1>

          <p>
            View your previous payment attempts.
          </p>
        </div>
      </div>

      <section className="user-payment-section">
        {paymentAttempts.length === 0 ? (
          <div className="user-payment-empty">
            <h3>No payment history</h3>

            <p>
              You don't have any payment attempts yet.
            </p>

            <Link
              to="/user/invoices"
              className="payment-empty-button"
            >
              View Invoices
            </Link>
          </div>
        ) : (
          <div className="user-payment-card">
            <div className="user-payment-table-header">
              <span>Payment</span>
              <span>Invoice</span>
              <span>Status</span>
              <span>Date</span>
              <span>Action</span>
            </div>

            {paymentAttempts.map((payment) => (
              <div
                className="user-payment-row"
                key={payment.id}
              >
                <span className="payment-number">
                  #{payment.id}
                </span>

                <span>
                  <Link
                    to="/user/invoices/$invoiceId"
                    params={{
                      invoiceId: String(
                        payment.invoiceId
                      ),
                    }}
                    className="payment-invoice-link"
                  >
                    Invoice #{payment.invoiceId}
                  </Link>
                </span>

                <span>
                  <span
                    className={`payment-status payment-status-${payment.status.toLowerCase()}`}
                  >
                    {payment.status}
                  </span>
                </span>

                <span className="payment-date">
                  {new Date(
                    payment.attemptedAt
                  ).toLocaleDateString()}
                </span>

                <span>
                  <Link
                    to="/user/invoices/$invoiceId"
                    params={{
                      invoiceId: String(
                        payment.invoiceId
                      ),
                    }}
                    className="payment-view-button"
                  >
                    View Invoice
                  </Link>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default UserPaymentHistory;