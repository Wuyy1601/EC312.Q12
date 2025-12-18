import { lazy } from "react";

// Main pages
const routers = [
  {
    path: "/",
    component: lazy(() => import("@pages/HomePage")),
  },
  {
    path: "/cart",
    component: lazy(() => import("@pages/CartPage")),
  },
  {
    path: "/checkout",
    component: lazy(() => import("@pages/CheckoutPage")),
  },
  {
    path: "/payment-result",
    component: lazy(() => import("@pages/PaymentResultPage")),
  },
];

// Admin pages (separate routes, no Layout)
export const adminRoutes = [
  {
    path: "/admin/login",
    component: lazy(() => import("@pages/admin/AdminLogin")),
  },
];

// Admin dashboard routes (with AdminLayout)
export const adminDashboardRoutes = [
  {
    path: "dashboard",
    component: lazy(() => import("@pages/admin/AdminDashboard")),
  },
  {
    path: "users",
    component: lazy(() => import("@pages/admin/AdminUsers")),
  },
  {
    path: "products",
    component: lazy(() => import("@pages/admin/AdminProducts")),
  },
  {
    path: "orders",
    component: lazy(() => import("@pages/admin/AdminOrders")),
  },
];

export default routers;
