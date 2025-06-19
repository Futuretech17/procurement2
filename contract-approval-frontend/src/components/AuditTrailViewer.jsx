import React, { useEffect, useState } from "react";
import { getProcurementContract } from "../utils/contract";
import { ethers } from "ethers";

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
    marginBottom: "1rem",
  },
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
};

const AuditTrailViewer = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const contract = await getProcurementContract();

        const logs = await contract.queryFilter(contract.filters.AuditLog());
        const parsed = logs.map((log) => ({
          user: log.args.user,
          role: log.args.role,
          action: log.args.action,
          contractId: log.args.contractId.toString(),
          timestamp: new Date(log.args.timestamp * 1000).toLocaleString(),
          details: log.args.details,
        }));

        setLogs(parsed.reverse()); // latest first
      } catch (err) {
        console.error("Error fetching audit logs:", err);
      }
    };

    fetchAuditLogs();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Audit Trail</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Timestamp</th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Action</th>
              <th style={styles.th}>Contract ID</th>
              <th style={styles.th}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan="6">No logs found.</td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr key={index}>
                  <td style={styles.td}>{log.timestamp}</td>
                  <td style={styles.td}>{log.user}</td>
                  <td style={styles.td}>{log.role}</td>
                  <td style={styles.td}>{log.action}</td>
                  <td style={styles.td}>{log.contractId}</td>
                  <td style={styles.td}>{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTrailViewer;
