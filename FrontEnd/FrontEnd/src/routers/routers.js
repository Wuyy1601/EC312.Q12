import { lazy } from "react";
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

export default routers;

