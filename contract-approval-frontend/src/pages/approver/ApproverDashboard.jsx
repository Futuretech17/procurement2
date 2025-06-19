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
    marginBottom: '1rem',
    color: '#2c3e50',
  },
  metricsContainer: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  metricCard: {
    flex: '1',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    color: '#34495e',
  },
  metricNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#8e44ad',
  },
  metricLabel: {
    fontSize: '1rem',
    fontWeight: '500',
  },
  buttonGroup: {
    marginBottom: '2rem',
  },
  button: {
    backgroundColor: '#8e44ad',
    color: '#fff',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    marginRight: '1rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'background-color 0.3s',
  },
  contractsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  tableHeader: {
    backgroundColor: '#8e44ad',
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

const ApproverDashboard = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const contract = await getProcurementContract();
        const total = Number((await contract.getTotalContracts()).toString());
        const fetchedContracts = [];

        for (let i = 1; i <= total; i++) {
          try {
            const data = await contract.getContractByIndex(i);
            if (!data || !data[0]) continue;

            const [
              id,
              title,
              description,
              supplierName,
              creator,
              value,
              fileHash,
              approvalsRaw,
              isApproved,
              lastModified,
            ] = data;

            const approvals = Number(approvalsRaw.toString());
            const status = isApproved
              ? 'Approved'
              : approvals > 0
              ? 'Modified'
              : 'Pending';

            const statusCode = isApproved ? 1 : approvals > 0 ? 2 : 0;

            fetchedContracts.push({
              id: Number(id),
              title,
              description,
              createdBy: creator,
              status,
              statusCode,
            });
          } catch (err) {
            console.warn(`Skipping contract index ${i}: ${err.message}`);
          }
        }

        setContracts(fetchedContracts);
      } catch (error) {
        console.error('Failed to load contracts:', error);
      }
    };

    fetchContracts();
  }, []);

  const totalContracts = contracts.length;
  const pendingCount = contracts.filter((c) => c.statusCode === 0).length;
  const modifiedCount = contracts.filter((c) => c.statusCode === 2).length;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome, Contract Approver</h1>

      {/* Metrics */}
      <div style={styles.metricsContainer}>
        <div style={styles.metricCard}>
          <div style={styles.metricNumber}>{totalContracts}</div>
          <div style={styles.metricLabel}>Total Contracts</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricNumber}>{pendingCount}</div>
          <div style={styles.metricLabel}>Pending Approvals</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricNumber}>{modifiedCount}</div>
          <div style={styles.metricLabel}>Modification Requests</div>
        </div>
      </div>

      {/* Buttons */}
      <div style={styles.buttonGroup}>
        <button
          style={styles.button}
          onClick={() => navigate('/dashboard/approver/pending-approvals')}
        >
          Review Pending Contracts
        </button>
        <button
          style={styles.button}
          onClick={() => navigate('/dashboard/approver/modification-requests')}
        >
          View Modification Requests
        </button>
        <button
          style={styles.button}
          onClick={() => navigate('/dashboard/approver/approved-contracts')}
        >
          View Approved Contracts
        </button>
      </div>

      {/* Contracts Table */}
      <table style={styles.contractsTable}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Contract Title</th>
            <th style={styles.tableHeader}>Status</th>
            <th style={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contracts.length > 0 ? (
            contracts.map(({ id, title, status, statusCode }) => (
              <tr key={id} style={styles.tableRow}>
                <td style={styles.tableCell}>{title}</td>
                <td
                  style={{
                    ...styles.tableCell,
                    ...(statusCode === 0
                      ? styles.statusPending
                      : statusCode === 1
                      ? styles.statusApproved
                      : styles.statusModified),
                  }}
                >
                  {status}
                </td>
                <td style={styles.tableCell}>
                  <button
                    style={{
                      ...styles.button,
                      backgroundColor: '#27ae60',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.9rem',
                    }}
                    onClick={() =>
                      navigate(`/dashboard/approver/contracts/view/${id}`)
                    }
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={styles.tableCell} colSpan="3">
                No contracts available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ApproverDashboard;
