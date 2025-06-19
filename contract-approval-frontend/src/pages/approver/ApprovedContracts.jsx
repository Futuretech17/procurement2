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
    backgroundColor: "#27ae60",
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
  link: {
    color: "#2980b9",
    textDecoration: "none",
    fontWeight: "500",
  },
  status: {
    color: "#27ae60",
    fontWeight: "bold",
  },
};

const ApprovedContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedContracts = async () => {
      try {
        const contract = await getProcurementContract();
        const total = Number(await contract.getTotalContracts());
        const approved = [];

        for (let i = 1; i <= total; i++) {
          const c = await contract.getContractByIndex(i);
          const isApproved = c[8];
          if (isApproved) {
            approved.push({ id: Number(c[0]), data: c });
          }
        }

        setContracts(approved);
      } catch (err) {
        console.error("Error fetching approved contracts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedContracts();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Approved Contracts</h2>
      {loading ? (
        <p>Loading...</p>
      ) : contracts.length === 0 ? (
        <p>No contracts have been approved yet.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Title</th>
              <th style={styles.tableHeader}>Supplier</th>
              <th style={styles.tableHeader}>Value</th>
              <th style={styles.tableHeader}>Dates</th>
              <th style={styles.tableHeader}>Document</th>
              <th style={styles.tableHeader}>Status</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map(({ id, data }) => {
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
                endDate
              ] = data;

              return (
                <tr key={Number(contractId)} style={styles.tableRow}>
                  <td style={styles.tableCell}>{title}</td>
                  <td style={styles.tableCell}>{supplier}</td>
                  <td style={styles.tableCell}>
                    KES {Number(value).toLocaleString()}
                  </td>
                  <td style={styles.tableCell}>
                    {new Date(Number(startDate) * 1000).toLocaleDateString()} -{" "}
                    {new Date(Number(endDate) * 1000).toLocaleDateString()}
                  </td>
                  <td style={styles.tableCell}>
                    {docHash ? (
                      <a
                        href={`https://ipfs.io/ipfs/${docHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.link}
                      >
                        View
                      </a>
                    ) : (
                      "No file"
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.status}>✅ Approved</span>
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

export default ApprovedContracts;
