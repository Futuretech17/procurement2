import React, { useEffect, useState } from "react";
import { getProcurementContract } from "../../utils/contract";

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
  },
  header: {
    fontSize: "1.8rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
    color: "#34495e",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  tableHeader: {
    backgroundColor: "#8e44ad",
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
    backgroundColor: "#27ae60",
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
  },
  link: {
    color: "#8e44ad",
    textDecoration: "none",
    fontWeight: "500",
  },
};

const PendingApprovals = () => {
  const [pendingContracts, setPendingContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingContracts = async () => {
      try {
        const contract = await getProcurementContract();
        const total = await contract.getTotalContracts();

        const temp = [];
        for (let i = 1; i <= total; i++) {
          const c = await contract.getContractByIndex(i);
          const isApproved = c[8]; // Boolean: true/false

          if (!isApproved) {
            temp.push({ id: Number(c[0]), data: c });
          }
        }

        setPendingContracts(temp);
      } catch (err) {
        console.error("Error loading pending contracts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingContracts();
  }, []);

  const handleApprove = async (id) => {
    try {
      const contract = await getProcurementContract();
      const tx = await contract.approveContract(Number(id));
      await tx.wait();

      alert("Contract approved!");
      setPendingContracts(pendingContracts.filter((c) => Number(c.id) !== Number(id)));
    } catch (err) {
      console.error("Approval failed", err);
      alert("Failed to approve: " + (err?.reason || err?.message || "Unknown error"));
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Pending Contracts for Approval</h2>

      {loading ? (
        <p>Loading...</p>
      ) : pendingContracts.length === 0 ? (
        <p>No pending approvals.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Title</th>
              <th style={styles.tableHeader}>Supplier</th>
              <th style={styles.tableHeader}>Value</th>
              <th style={styles.tableHeader}>Dates</th>
              <th style={styles.tableHeader}>Document</th>
              <th style={styles.tableHeader}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingContracts.map(({ id, data }) => {
              const [
                contractId,
                title,
                description,
                supplier,
                buyer,
                value,
                docHash,
                approvals,
                isApproved,
                lastModified,
                startDate,
                endDate,
              ] = data;

              return (
                <tr key={id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{title}</td>
                  <td style={styles.tableCell}>{supplier}</td>
                  <td style={styles.tableCell}>KES {Number(value).toLocaleString()}</td>
                  <td style={styles.tableCell}>
                    {new Date(Number(startDate) * 1000).toLocaleDateString()} -{" "}
                    {new Date(Number(endDate) * 1000).toLocaleDateString()}
                  </td>
                  <td style={styles.tableCell}>
                    <a
                      href={`https://ipfs.io/ipfs/${docHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.link}
                    >
                      View
                    </a>
                  </td>
                  <td style={styles.tableCell}>
                    <button style={styles.button} onClick={() => handleApprove(id)}>
                      Approve
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingApprovals;
