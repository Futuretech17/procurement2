import React, { useEffect, useState } from "react";
import { getProcurementContract } from "../../utils/contract";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  cardRow: {
    display: "flex",
    gap: "1.5rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  card: {
    flex: "1",
    backgroundColor: "#ffffff",
    padding: "1.5rem",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
  },
  cardTitle: {
    fontSize: "0.95rem",
    color: "#7f8c8d",
    marginBottom: "0.5rem",
  },
  cardValue: {
    fontSize: "1.4rem",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  th: {
    backgroundColor: "#ecf0f1",
    padding: "12px",
    textAlign: "left",
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
    fontWeight: "600",
  },
  statusPending: {
    color: "#e67e22",
    fontWeight: "600",
  },
  link: {
    color: "#8e44ad",
    textDecoration: "none",
    fontWeight: "500",
    cursor: "pointer",
  },
};

const AuditorDashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    modifications: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const contract = await getProcurementContract();
        const total = await contract.getTotalContracts();

        const list = [];
        let approved = 0;
        let pending = 0;
        let modifications = 0;

        for (let i = 1; i <= total; i++) {
          let raw;
          try {
            raw = await contract.getContractByIndex(i);
          } catch (e) {
            console.warn(`Skipping invalid contract index ${i}:`, e?.reason || e);
            continue;
          }

          if (!raw || raw.length < 12) continue;

          const contractId = Number(raw[0]);
          if (contractId === 0) continue;

          let mod = false;
          try {
            mod = await contract.isModificationPending(contractId);
          } catch (err) {
            console.warn(`Skipping modification check for contract ${contractId}:`, err?.reason || err);
            continue;
          }

          const isApproved = raw[8];

          list.push({
            id: contractId,
            title: raw[1],
            supplier: raw[3],
            value: Number(raw[5]),
            isApproved,
            startDate: new Date(Number(raw[10]) * 1000).toLocaleDateString(),
            endDate: new Date(Number(raw[11]) * 1000).toLocaleDateString(),
            lastModified: new Date(Number(raw[9]) * 1000).toLocaleString(),
          });

          if (isApproved) approved++;
          else pending++;

          if (mod) modifications++;
        }

        setContracts(list);
        setSummary({
          total,
          approved,
          pending,
          modifications,
        });
      } catch (err) {
        console.error("Error fetching auditor data:", err);
      }
    };

    fetchContracts();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={{ fontSize: "1.6rem", marginBottom: "1.5rem", color: "#2c3e50" }}>
        Auditor Dashboard
      </h2>

      {/* Summary Cards */}
      <div style={styles.cardRow}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Contracts</div>
          <div style={styles.cardValue}>{summary.total}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Approved Contracts</div>
          <div style={styles.cardValue}>{summary.approved}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Pending Approvals</div>
          <div style={styles.cardValue}>{summary.pending}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Modification Requests</div>
          <div style={styles.cardValue}>{summary.modifications}</div>
        </div>
      </div>

      {/* Contracts Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Supplier</th>
            <th style={styles.th}>Value (KES)</th>
            <th style={styles.th}>Start Date</th>
            <th style={styles.th}>End Date</th>
            <th style={styles.th}>Last Modified</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => (
            <tr key={c.id}>
              <td style={styles.td}>{c.id}</td>
              <td
                style={{ ...styles.td, ...styles.link }}
                onClick={() => navigate(`/dashboard/auditor/contracts/${c.id}`)}
              >
                {c.title}
              </td>
              <td style={styles.td}>{c.supplier}</td>
              <td style={styles.td}>{c.value.toLocaleString()}</td>
              <td style={styles.td}>{c.startDate}</td>
              <td style={styles.td}>{c.endDate}</td>
              <td style={styles.td}>{c.lastModified}</td>
              <td
                style={{
                  ...styles.td,
                  ...(c.isApproved ? styles.statusApproved : styles.statusPending),
                }}
              >
                {c.isApproved ? "Approved ✅" : "Pending ⏳"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditorDashboard;
