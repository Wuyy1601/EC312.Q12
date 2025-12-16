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
];

export default routers;
