import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@components/Layout";
import routers from "@/routers/routers";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
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
      </Routes>
    </Router>
  );
}

export default App;
