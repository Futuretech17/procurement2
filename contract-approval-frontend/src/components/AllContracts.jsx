import React, { useEffect, useState } from "react";
import { getProcurementContract } from "../utils/contract";

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
  statusApproved: {
    color: "#27ae60",
    fontWeight: "600",
  },
  statusPending: {
    color: "#e67e22",
    fontWeight: "600",
  },
  link: {
    color: "#8e44ad",
    fontWeight: "500",
    textDecoration: "none",
  },
};

const AllContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const contract = await getProcurementContract();
        const total = await contract.getTotalContracts();
        const all = [];

        for (let i = 1; i <= total; i++) {
          const c = await contract.getContractByIndex(i);
          const id = Number(c[0]); // Use actual contract ID
          all.push({ id, data: c });
        }

        setContracts(all);
      } catch (error) {
        console.error("Error loading contracts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>All Contracts</h2>

      {loading ? (
        <p>Loading...</p>
      ) : contracts.length === 0 ? (
        <p>No contracts found.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Title</th>
              <th style={styles.tableHeader}>Supplier</th>
              <th style={styles.tableHeader}>Value</th>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Dates</th>
              <th style={styles.tableHeader}>Document</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map(({ id, data }) => {
              const title = data[1];
              const supplier = data[3];
              const value = Number(data[5]);
              const docHash = data[6];
              const approved = data[8];
              const startDate = new Date(Number(data[10]) * 1000);
              const endDate = new Date(Number(data[11]) * 1000);

              return (
                <tr key={id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{title}</td>
                  <td style={styles.tableCell}>{supplier}</td>
                  <td style={styles.tableCell}>KES {value.toLocaleString()}</td>
                  <td
                    style={{
                      ...styles.tableCell,
                      ...(approved ? styles.statusApproved : styles.statusPending),
                    }}
                  >
                    {approved ? "Approved ✅" : "Pending ⏳"}
                  </td>
                  <td style={styles.tableCell}>
                    {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllContracts;
