import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  card: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "2rem",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
  },
  header: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "1.2rem",
  },
  label: {
    fontWeight: "500",
    color: "#34495e",
    marginTop: "1rem",
  },
  value: {
    color: "#2c3e50",
    marginTop: "0.3rem",
    fontSize: "1rem",
  },
};

const UserProfile = () => {
  const [profile, setProfile] = useState({
    role: "",
    address: "",
    name: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const role = decoded.role || decoded.user?.role || "Unknown";
        const name = decoded.name || decoded.user?.name || "Not Provided";

        setProfile((prev) => ({
          ...prev,
          role: role.toUpperCase(),
          name,
        }));
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }

    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setProfile((prev) => ({
            ...prev,
            address: accounts[0],
          }));
        }
      });
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>User Profile</h2>
        <div>
          <div style={styles.label}>Name</div>
          <div style={styles.value}>{profile.name}</div>

          <div style={styles.label}>Role</div>
          <div style={styles.value}>{profile.role}</div>

          <div style={styles.label}>Ethereum Address</div>
          <div style={styles.value}>{profile.address}</div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
