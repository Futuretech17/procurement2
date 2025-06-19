import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProcurementContract } from '../../utils/contract';

const styles = {
  container: {
    padding: '2rem',
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  header: {
    fontSize: '1.8rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#2c3e50',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#2980b9',
    color: '#fff',
    textAlign: 'left',
    padding: '1rem',
  },
  tableRow: {
    borderBottom: '1px solid #e1e4e8',
  },
  tableCell: {
    padding: '1rem',
    color: '#2c3e50',
  },
  button: {
    backgroundColor: '#27ae60',
    color: '#fff',
    padding: '0.4rem 0.8rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  statusPending: {
    color: '#e67e22',
    fontWeight: '600',
  },
  statusApproved: {
    color: '#27ae60',
    fontWeight: '600',
  },
  statusModified: {
    color: '#c0392b',
    fontWeight: '600',
  },
};

const ProcurementContracts = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContracts = async () => {
      try {
        const contract = await getProcurementContract();
        const total = Number(await contract.getTotalContracts());

        const items = await Promise.all(
          Array.from({ length: total }, (_, index) => index + 1).map(async (i) => {
            const data = await contract.getContractByIndex(i);
            const contractId = Number(data[0]);
            const hasMod = await contract.hasModificationRequest(contractId);

            return {
              id: contractId,
              title: data[1],
              vendor: data[3] || "N/A",
              amount:
                data[5] && data[5] !== null
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
      } catch (err) {
        console.error("❌ Error loading contracts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContracts();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>All Procurement Contracts</h1>

      {loading ? (
        <p>Loading contracts...</p>
      ) : contracts.length === 0 ? (
        <p>No contracts found.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Title</th>
              <th style={styles.tableHeader}>Supplier</th>
              <th style={styles.tableHeader}>Amount</th>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{c.title}</td>
                <td style={styles.tableCell}>{c.vendor}</td>
                <td style={styles.tableCell}>{c.amount}</td>
                <td
                  style={{
                    ...styles.tableCell,
                    ...(c.status === 'Pending'
                      ? styles.statusPending
                      : c.status === 'Approved'
                      ? styles.statusApproved
                      : styles.statusModified),
                  }}
                >
                  {c.status}
                </td>
                <td style={styles.tableCell}>
                  <button
                    style={styles.button}
                    onClick={() =>
                      navigate(`/dashboard/procurement/contracts/view/${c.id}`)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProcurementContracts;
