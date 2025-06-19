import React, { useEffect, useState } from "react";

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  card: {
    maxWidth: "1000px",
    margin: "0 auto",
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
  },
  header: {
    fontSize: "1.5rem",
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
    borderBottom: "2px solid #ccc",
    color: "#2c3e50",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    color: "#34495e",
    fontSize: "0.95rem",
  },
  noData: {
    marginTop: "1rem",
    color: "#7f8c8d",
  },
};

const AuditorModificationRequests = () => {
  const [modRequests, setModRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching from contract
    const fetchData = async () => {
      try {
        // Replace this stub with smart contract logic
        const dummyData = [
          {
            id: 1,
            title: "Laptops Supply",
            requestedBy: "0x123...456",
            requestedOn: "2025-06-15",
            status: "Pending",
            originalValue: "1,500,000",
            requestedValue: "1,650,000",
          },
          {
            id: 2,
            title: "Office Furniture",
            requestedBy: "0x789...abc",
            requestedOn: "2025-06-10",
            status: "Approved",
            originalValue: "800,000",
            requestedValue: "850,000",
          },
        ];
        setModRequests(dummyData);
      } catch (err) {
        console.error("Error fetching modification requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Audit - Modification Requests</h2>

        {loading ? (
          <p>Loading...</p>
        ) : modRequests.length === 0 ? (
          <p style={styles.noData}>No modification requests available.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Requested By</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Original (KES)</th>
                <th style={styles.th}>Requested (KES)</th>
              </tr>
            </thead>
            <tbody>
              {modRequests.map((req) => (
                <tr key={req.id}>
                  <td style={styles.td}>{req.id}</td>
                  <td style={styles.td}>{req.title}</td>
                  <td style={styles.td}>{req.requestedBy}</td>
                  <td style={styles.td}>{req.requestedOn}</td>
                  <td style={{ ...styles.td, color: req.status === "Approved" ? "#27ae60" : "#e67e22" }}>
                    {req.status}
                  </td>
                  <td style={styles.td}>KES {req.originalValue}</td>
                  <td style={styles.td}>KES {req.requestedValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditorModificationRequests;
