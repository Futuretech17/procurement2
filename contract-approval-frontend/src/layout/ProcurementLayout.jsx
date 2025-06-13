// src/layouts/ProcurementLayout.jsx
import { Link, Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
        <nav style={{
          width: "220px",
          backgroundColor: "#f0f0f0",
          padding: "20px",
          borderRight: "1px solid #ddd",
          overflowY: "auto"
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/dashboard/procurement" style={{ color: "#222", textDecoration: "none", fontWeight: "600" }}>
                Dashboard
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/dashboard/procurement/contracts" style={{ color: "#222", textDecoration: "none", fontWeight: "600" }}>
                Contracts
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/dashboard/procurement/contracts/create" style={{ color: "#222", textDecoration: "none", fontWeight: "600" }}>
                Create Contract
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/dashboard/procurement/modification-requests" style={{ color: "#222", textDecoration: "none", fontWeight: "600" }}>
                Modification Requests
              </Link>
            </li>
          </ul>
        </nav>

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
