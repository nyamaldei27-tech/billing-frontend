import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";

import useBillingStore from "../../stores/billingStore";

import "./InvoiceDetails.css";

function InvoiceDetails() {
  const { invoiceId } = useParams({
    from: "/user/invoices/$invoiceId",
  });

  const {
    invoices,
    loadingInvoices,
    invoicesError,
    fetchInvoiceById,
    payInvoice,
  } = useBillingStore();

  const [paying, setPaying] = useState(false);

  const invoice = invoices.find(
    (item) => item.id === Number(invoiceId)
  ) || null;

  useEffect(() => {
    fetchInvoiceById(Number(invoiceId));
  }, [invoiceId, fetchInvoiceById]);

  const handlePayInvoice = async () => {
    if (!invoice) return;

    const confirmed = window.confirm(
      `Are you sure you want to pay ${formatMoney(
        invoice.amountCents
      )} for Invoice #${invoice.id}?`
    );

    if (!confirmed) return;

    try {
      setPaying(true);

      await payInvoice(invoice.id);
    } catch (error) {
      console.error(
        "Failed to pay invoice:",
        error
      );
    } finally {
      setPaying(false);
    }
  };

  const formatMoney = (cents: number) => {
    return `ETB ${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  if (loadingInvoices && !invoice) {
    return (
      <div className="invoice-details-page">
        <h1>Loading invoice...</h1>
      </div>
    );
  }

  if (invoicesError && !invoice) {
    return (
      <div className="invoice-details-page">
        <h1>Failed to load invoice</h1>

        <p>
          {invoicesError}
        </p>

        <Link
          to="/user/invoices"
          className="invoice-back-button"
        >
          ← Back to Invoices
        </Link>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="invoice-details-page">

        <h1>Invoice not found</h1>

        <p>
          We could not find this invoice.
        </p>

        <Link
          to="/user/invoices"
          className="invoice-back-button"
        >
          ← Back to Invoices
        </Link>

      </div>
    );
  }

  return (
    <div className="invoice-details-page">

      {/* HEADER */}

      <div className="invoice-details-header">

        <div>

          <Link
            to="/user/invoices"
            className="invoice-back-button"
          >
            ← Back to Invoices
          </Link>

          <h1>
            Invoice #{invoice.id}
          </h1>

          <p>
            Invoice details and payment information.
          </p>

        </div>

      </div>

      {/* INVOICE CARD */}

      <div className="invoice-details-card">

        {/* TOP */}

        <div className="invoice-details-top">

          <div>

            <span className="invoice-details-label">
              Invoice
            </span>

            <strong className="invoice-details-number">
              #{invoice.id}
            </strong>

          </div>

          <span
            className={`invoice-details-status invoice-details-status-${invoice.status.toLowerCase()}`}
          >
            {invoice.status}
          </span>

        </div>

        {/* DIVIDER */}

        <div className="invoice-details-divider"></div>

        {/* DETAILS */}

        <div className="invoice-details-grid">

          <div>

            <span>
              Amount
            </span>

            <strong>
              {formatMoney(invoice.amountCents)}
            </strong>

          </div>

          <div>

            <span>
              Due Date
            </span>

            <strong>
              {formatDate(invoice.dueDate)}
            </strong>

          </div>

          <div>

            <span>
              Paid At
            </span>

            <strong>
              {formatDate(invoice.paidAt)}
            </strong>

          </div>

          <div>

            <span>
              Status
            </span>

            <strong>
              {invoice.status}
            </strong>

          </div>

        {/* PAYMENT ACTION */}

        {invoice.status === "PENDING" && (
          <div className="invoice-details-divider">
          <div className="invoice-payment-section">

            <button
              type="button"
              className="invoice-pay-button"
              onClick={handlePayInvoice}
              disabled={paying}
            >
              {paying
                ? "Processing Payment..."
                : `Pay ${formatMoney(
                    invoice.amountCents
                  )}`}
            </button>

          </div>
        </div>
        )}

     </div>
     
        {/* PAID MESSAGE */}

{invoice.status === "PAID" && (
  <div className="invoice-paid-section">

    <div className="invoice-paid-message">
      This invoice has already been paid.
    </div>

    {invoice.receiptUrl && (
      <div className="invoice-receipt-actions">

        <a
          href={invoice.receiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="invoice-receipt-button"
        >
          View Receipt
        </a>

        <button
  type="button"
  className="invoice-download-button"
  onClick={async () => {
    if (!invoice.receiptUrl) return;

    try {
      const response = await fetch(
        invoice.receiptUrl
      );

      if (!response.ok) {
        throw new Error(
          "Failed to download receipt."
        );
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        `invoice-${invoice.id}-receipt.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(
        "Failed to download receipt:",
        error
      );
    }
  }}
>
  Download PDF
</button>

      </div>
    )}

  </div>
)}

      </div>

    </div>
  );
}

export default InvoiceDetails;
