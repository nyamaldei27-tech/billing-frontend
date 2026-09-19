import { Link } from "@tanstack/react-router";
import "./Navbar.css";
import useAuthStore from "../stores/authStore";

function Navbar() {
  const username = useAuthStore((state) => state.username);
  const roles = useAuthStore((state) => state.roles);
  const logout = useAuthStore((state) => state.logout);

  const isAdmin = roles.includes("ADMIN");

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

        {/* ADMIN NAVIGATION */}

        {isAdmin && (
          <>
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
          </>
        )}

        {/* ACCOUNT NAVIGATION */}

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
            {username
              ? username.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div>
            <strong>
              {username ?? "User"}
            </strong>

            <span>
              {isAdmin ? "Administrator" : "Customer"}
            </span>
          </div>

        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={logout}
        >
          Logout
        </button>

      </div>

    </aside>
  );
}

export default Navbar;