// src/pages/ProcurementContracts.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contract/contractABI";

const ProcurementContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

useEffect(() => {
  const loadContracts = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const rawContracts = await contract.getAllContracts();

    const items = await Promise.all(
      rawContracts.map(async (data, index) => {
        const hasMod = await contract.hasModificationRequest(index); // check if there's a mod

        return {
          id: index,
          title: data[1],
          vendor: data[3] || "N/A",
          amount: data[5] && data[5] !== null
            ? `KES ${Number(data[5].toString()).toLocaleString()}`
            : "N/A",
          status: hasMod
            ? "Modified"
            : data[8]
            ? "Approved"
            : "Pending",
        };
      })
    );

    setContracts(items);
  } catch (error) {
    console.error("❌ Error loading contracts:", error);
    setError("Failed to load contracts.");
  }
};


  loadContracts();
}, []);


  const handleView = (id) => navigate(`/dashboard/procurement/contracts/view/${id}`);
  const handleEdit = (id) => navigate(`/dashboard/procurement/contracts/edit/${id}`);
  const handleRequestModification = (id) =>
    navigate(`/dashboard/procurement/contracts/request-modification/${id}`);

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Procurement Contracts</h2>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <table style={styles.contractsTable}>
        <thead>
          <tr style={styles.tableRow}>
            <th style={styles.tableHeader}>Title</th>
            <th style={styles.tableHeader}>Vendor</th>
            <th style={styles.tableHeader}>Amount</th>
            <th style={styles.tableHeader}>Status</th>
            <th style={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.id} style={styles.tableRow}>
              <td style={styles.tableCell}>{contract.title}</td>
              <td style={styles.tableCell}>{contract.vendor}</td>
              <td style={styles.tableCell}>{contract.amount}</td>
              <td style={styles.tableCell}>
                <span style={getStatusStyle(contract.status)}>{contract.status}</span>
              </td>
              <td style={styles.tableCell}>
                <button style={styles.button} onClick={() => handleView(contract.id)}>
                  View
                </button>
                {contract.status === "Pending" && (
                  <button style={styles.button} onClick={() => handleEdit(contract.id)}>
                    Edit
                  </button>
                )}
                {contract.status === "Approved" && (
                  <button
                    style={styles.button}
                    onClick={() => handleRequestModification(contract.id)}
                  >
                    Request Modification
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  header: {
    fontSize: "1.8rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
    color: "#2c3e50",
  },
  contractsTable: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  tableHeader: {
    backgroundColor: "#2980b9",
    color: "#fff",
    textAlign: "left",
    padding: "1rem",
  },
  tableRow: {
    borderBottom: "1px solid #e1e4e8",
  },
  tableCell: {
    padding: "1rem",
    color: "#2c3e50",
  },
  button: {
    backgroundColor: "#2980b9",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    marginRight: "0.5rem",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    transition: "background-color 0.3s",
  },
  statusPending: {
    color: "#e67e22",
    fontWeight: "600",
  },
  statusApproved: {
    color: "#27ae60",
    fontWeight: "600",
  },
  statusModified: {
    color: "#c0392b",
    fontWeight: "600",
  },
};

function getStatusStyle(status) {
  switch (status) {
    case "Pending":
      return styles.statusPending;
    case "Approved":
      return styles.statusApproved;
    case "Modified":
      return styles.statusModified;
    default:
      return {};
  }
}

export default ProcurementContracts;
