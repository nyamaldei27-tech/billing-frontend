import { Link } from "@tanstack/react-router";
import "./Navbar.css";

function Navbar() {
  return (
    <aside className="sidebar">

      {/* LOGO */}

      <div className="sidebar-logo">
        <span className="logo-mark">B</span>

        <span className="logo-text">
          Billing<span>App</span>
        </span>
      </div>

      {/* NAVIGATION */}

      <nav className="sidebar-nav">

        <p className="sidebar-section-title">
          MAIN
        </p>

        <Link
          to="/admin/dashboard"
          className="sidebar-link"
        >
          <span>▪</span>
          <span>Dashboard</span>
        </Link>

        <Link
          to="/admin/customers"
          className="sidebar-link"
        >
          <span>♣</span>
          <span>Customers</span>
        </Link>

        <Link
          to="/admin/billing"
          className="sidebar-link"
        >
          <span>¤</span>
          <span>Billing</span>
        </Link>

        <p className="sidebar-section-title">
          ACCOUNT
        </p>

        <Link
          to="/user/dashboard"
          className="sidebar-link"
        >
          <span>◎</span>
          <span>My Dashboard</span>
        </Link>

        <Link
          to="/user/subscription"
          className="sidebar-link"
        >
          <span>◉</span>
          <span>Subscription</span>
        </Link>

        <Link
          to="/user/invoices"
          className="sidebar-link"
        >
          <span>▤</span>
          <span>Invoices</span>
        </Link>

        <Link
          to="/user/payment-history"
          className="sidebar-link"
        >
          <span>◷</span>
          <span>Payment History</span>
        </Link>

        <Link
          to="/user/profile"
          className="sidebar-link"
        >
          <span>⚙</span>
          <span>Profile</span>
        </Link>

      </nav>

      {/* SIDEBAR BOTTOM */}

      <div className="sidebar-bottom">

        <div className="sidebar-user">

          <div className="user-avatar">
            U
          </div>

          <div>
            <strong>User</strong>
            <span>Account</span>
          </div>

        </div>

      </div>

    </aside>
  );
}

export default Navbar;