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
    path: "/products",
    component: lazy(() => import("@pages/ProductsPage")),
  },
  {
    path: "/checkout",
    component: lazy(() => import("@pages/CheckoutPage")),
  },
  {
    path: "/product/:id",
    component: lazy(() => import("@pages/ProductDetailPage")),
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

// Auth routes (separate routes, no Layout)
export const authRoutes = [
  {
    path: "/login",
    component: lazy(() => import("@pages/auth/LoginPage")),
  },
  {
    path: "/register",
    component: lazy(() => import("@pages/auth/RegisterPage")),
  },
];

// Profile routes (with ProfileLayout sidebar)
export const profileRoutes = {
  layout: lazy(() => import("@pages/profile/ProfilePage")),
  children: [
    {
      path: "",
      index: true,
      component: lazy(() => import("@pages/profile/ProfileInfo")),
    },
    {
      path: "password",
      component: lazy(() => import("@pages/profile/ProfilePassword")),
    },
    {
      path: "orders",
      component: lazy(() => import("@pages/profile/MyOrders")),
    },
    {
      path: "address",
      component: lazy(() => import("@pages/profile/ProfileAddress")),
    },
    {
      path: "delete",
      component: lazy(() => import("@pages/profile/ProfileDelete")),
    },
    {
      path: "notifications",
      component: lazy(() => import("@pages/profile/ProfileNotifications")),
    },
  ],
};

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
  {
    path: "templates",
    component: lazy(() => import("@pages/admin/AdminTemplates")),
  },
];

export default routers;

