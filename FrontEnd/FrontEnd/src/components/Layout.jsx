import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "./Layout.css";

const Layout = () => {
  return (
    <div className="layout">
      <div className="background-layer"></div>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <Footer />
    </div>
  );
};

export default Layout;
