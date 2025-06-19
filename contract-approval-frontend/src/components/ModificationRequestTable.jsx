import React from "react";

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "1rem",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #ccc",
    backgroundColor: "#ecf0f1",
    color: "#2c3e50",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    color: "#34495e",
  },
  actionButton: {
    backgroundColor: "#2980b9",
    color: "#fff",
    padding: "6px 12px",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
};

const ModificationRequestTable = ({ data, role = "procurement", onApprove }) => {
  if (!data.length) return <p style={{ color: "#7f8c8d" }}>No modification requests found.</p>;

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>ID</th>
          <th style={styles.th}>Title</th>
          <th style={styles.th}>Supplier</th>
          <th style={styles.th}>Value (KES)</th>
          <th style={styles.th}>Start Date</th>
          <th style={styles.th}>End Date</th>
          {role === "approver" && <th style={styles.th}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((req) => (
          <tr key={req.id}>
            <td style={styles.td}>{req.id}</td>
            <td style={styles.td}>{req.title}</td>
            <td style={styles.td}>{req.supplier}</td>
            <td style={styles.td}>{req.value.toLocaleString()}</td>
            <td style={styles.td}>{req.startDate}</td>
            <td style={styles.td}>{req.deliveryDate}</td>
            {role === "approver" && (
              <td style={styles.td}>
                <button style={styles.actionButton} onClick={() => onApprove(req.id)}>
                  Approve
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ModificationRequestTable;
