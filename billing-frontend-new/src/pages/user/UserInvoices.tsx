import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import {
  getInvoicesByCustomerId,
  type Invoice,
} from "../../services/billingService";

import "./UserInvoices.css";

function UserInvoices() {
  const customerId = 2;

  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const data =
          await getInvoicesByCustomerId(customerId);

        setInvoices(data);
      } catch (error) {
        console.error(
          "Failed to load invoices:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const formatMoney = (cents: number) => {
    return `ETB ${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <main className="user-invoices-page">

        <h1>Invoices</h1>

        <p>Loading invoices...</p>

      </main>
    );
  }

  return (
    <main className="user-invoices-page">

      {/* HEADER */}

      <div className="user-invoices-header">

        <h1>Invoices</h1>

        <p>
          View your billing history and payment
          status.
        </p>

      </div>

      {/* EMPTY STATE */}

      {invoices.length === 0 ? (

        <div className="user-invoices-empty">

          <h3>No invoices</h3>

          <p>
            You don't have any invoices yet.
          </p>

        </div>

      ) : (

        /* INVOICE TABLE */

        <div className="user-invoices-card">

          <table className="user-invoices-table">

            <thead>

              <tr>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Paid At</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {invoices.map((invoice) => (

                <tr key={invoice.id}>

                  <td>

                    <Link
                      to="/user/invoices/$invoiceId"
                      params={{
                        invoiceId: String(invoice.id),
                      }}
                      className="invoice-link"
                    >
                      #{invoice.id}
                    </Link>

                  </td>

                  <td>
                    {formatMoney(
                      invoice.amountCents
                    )}
                  </td>

                  <td>

                    <span
                      className={`invoice-status invoice-status-${invoice.status.toLowerCase()}`}
                    >
                      {invoice.status}
                    </span>

                  </td>

                  <td>
                    {new Date(
                      invoice.dueDate
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {invoice.paidAt
                      ? new Date(
                          invoice.paidAt
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>

                    <Link
                      to="/user/invoices/$invoiceId"
                      params={{
                        invoiceId: String(invoice.id),
                      }}
                      className="invoice-view-button"
                    >
                      View
                    </Link>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </main>
  );
}

export default UserInvoices;