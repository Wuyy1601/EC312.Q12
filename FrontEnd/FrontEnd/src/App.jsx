import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@components/Layout";
import routers, { adminRoutes, adminDashboardRoutes } from "@/routers/routers";
import "./App.css";

// Lazy load AdminLayout
const AdminLayout = lazy(() => import("@pages/admin/AdminLayout"));

function App() {
  return (
    <Router>
      <Routes>
        {/* Main routes with Layout */}
        <Route element={<Layout />}>
          {routers.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <route.component />
                </Suspense>
              }
            />
          ))}
        </Route>

        {/* Admin login - no layout */}
        {adminRoutes.map((route, index) => (
          <Route
            key={`admin-${index}`}
            path={route.path}
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <route.component />
              </Suspense>
            }
          />
        ))}

        {/* Admin dashboard routes with AdminLayout */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout />
            </Suspense>
          }
        >
          {adminDashboardRoutes.map((route, index) => (
            <Route
              key={`admin-dash-${index}`}
              path={route.path}
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <route.component />
                </Suspense>
              }
            />
          ))}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
