import React, { useEffect, useState } from "react";
import { getProcurementContract } from "../../utils/contract";

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  card: {
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "2rem",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
  },
  header: {
    fontSize: "1.8rem",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "1.5rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "1rem",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    backgroundColor: "#ecf0f1",
    color: "#2c3e50",
    borderBottom: "2px solid #ccc",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    color: "#34495e",
  },
  statusApproved: {
    color: "#27ae60",
    fontWeight: "bold",
  },
  statusPending: {
    color: "#e67e22",
    fontWeight: "bold",
  },
  link: {
    color: "#8e44ad",
    textDecoration: "none",
    fontWeight: "500",
  },
};

const AuditorAllContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const contract = await getProcurementContract();
        const total = await contract.getTotalContracts();
        const allContracts = [];

        for (let i = 1; i <= total; i++) {
          let data;
          try {
            data = await contract.getContractByIndex(i);
          } catch (e) {
            console.warn(`Skipping invalid contract at index ${i}:`, e?.reason || e);
            continue;
          }

          allContracts.push({
            id: Number(data[0]),
            title: data[1],
            description: data[2],
            supplier: data[3],
            creator: data[4],
            value: Number(data[5]),
            fileHash: data[6],
            approvals: Number(data[7]),
            isApproved: data[8],
            startDate: Number(data[10]),
            endDate: Number(data[11]),
          });
        }

        setContracts(allContracts);
      } catch (err) {
        console.error("Error loading auditor contracts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>All Contracts (Auditor View)</h2>

        {loading ? (
          <p>Loading contracts...</p>
        ) : contracts.length === 0 ? (
          <p>No contracts available.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Supplier</th>
                <th style={styles.th}>Value</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Start Date</th>
                <th style={styles.th}>End Date</th>
                <th style={styles.th}>Document</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td style={styles.td}>{c.id}</td>
                  <td style={styles.td}>{c.title}</td>
                  <td style={styles.td}>{c.supplier}</td>
                  <td style={styles.td}>KES {c.value.toLocaleString()}</td>
                  <td
                    style={{
                      ...styles.td,
                      ...(c.isApproved ? styles.statusApproved : styles.statusPending),
                    }}
                  >
                    {c.isApproved ? "Approved" : "Pending"}
                  </td>
                  <td style={styles.td}>
                    {new Date(c.startDate * 1000).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    {new Date(c.endDate * 1000).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <a
                      href={`https://ipfs.io/ipfs/${c.fileHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.link}
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditorAllContracts;
