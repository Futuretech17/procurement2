// src/layouts/ProcurementLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

export default function ProcurementLayout({ currentAccount }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backgroundColor: "#fff",
      color: "#222",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Header on top */}
      <Header currentAccount={currentAccount} />

      {/* Main content: sidebar + outlet */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Use the shared Sidebar component */}
        <Sidebar role="procurement" />

        <main style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          backgroundColor: "#fff"
        }}>
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
