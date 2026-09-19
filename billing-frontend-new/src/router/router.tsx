import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  redirect 
} from "@tanstack/react-router";

import useAuthStore from "../stores/authStore";

import App from "../App";

import Dashboard from "../pages/admin/Dashboard";
import Customers from "../pages/admin/Customers";
import Billing from "../pages/admin/Billing";

import UserDashboard from "../pages/user/UserDashboard";
import UserSubscription from "../pages/user/UserSubscription";
import UserInvoices from "../pages/user/UserInvoices";
import UserPaymentHistory from "../pages/user/UserPaymentHistory";
import EditProfile from "../pages/user/EditProfile";
import InvoiceDetails from "../pages/user/InvoiceDetails";


const rootRoute = createRootRoute({
  component: App,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/user/dashboard" />,
});


/* =========================
   ADMIN ROUTES
   ========================= */

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",

  beforeLoad: () => {
    const { isAuthenticated, roles } =
      useAuthStore.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: "/user/dashboard",
      });
    }

    if (!roles.includes("ADMIN")) {
      throw redirect({
        to: "/user/dashboard",
      });
    }
  },
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/dashboard",
  component: Dashboard,
});

const adminCustomersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/customers",
  component: Customers,
});

const adminBillingRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/billing",
  component: Billing,
});


/* =========================
   USER ROUTES
   ========================= */

const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/user",
});

const userDashboardRoute = createRoute({
  getParentRoute: () => userRoute,
  path: "/dashboard",
  component: UserDashboard,
});

const userSubscriptionRoute = createRoute({
  getParentRoute: () => userRoute,
  path: "/subscription",
  component: UserSubscription,
});

const userInvoicesRoute = createRoute({
  getParentRoute: () => userRoute,
  path: "/invoices",
  component: UserInvoices,
});

const userInvoiceDetailsRoute = createRoute({
  getParentRoute: () => userRoute,
  path: "/invoices/$invoiceId",
  component: InvoiceDetails,
});

const userPaymentHistoryRoute = createRoute({
  getParentRoute: () => userRoute,
  path: "/payment-history",
  component: UserPaymentHistory,
});

const userProfileRoute = createRoute({
  getParentRoute: () => userRoute,
  path: "/profile",
  component: EditProfile,
});


/* =========================
   ROUTE TREE
   ========================= */

const routeTree = rootRoute.addChildren([
  indexRoute,

  adminRoute.addChildren([
    adminDashboardRoute,
    adminCustomersRoute,
    adminBillingRoute,
  ]),

  userRoute.addChildren([
    userDashboardRoute,
    userSubscriptionRoute,
    userInvoicesRoute,
    userInvoiceDetailsRoute,
    userPaymentHistoryRoute,
    userProfileRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
});