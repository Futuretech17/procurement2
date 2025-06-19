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
    color: '#3498db',
  },
  metricLabel: {
    fontSize: '1rem',
    fontWeight: '500',
  },
  buttonGroup: {
    marginBottom: '2rem',
  },
  button: {
    backgroundColor: '#2980b9',
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

const ProcurementDashboard = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const contract = await getProcurementContract();
        const total = Number((await contract.getTotalContracts()).toString());
        const fetchedContracts = [];

        for (let i = 1; i <= total; i++) {
          const data = await contract.getContractByIndex(i);

          console.log("Loaded contract at index", i, data);

          const [
            id,
            title,
            description,
            supplierName,
            creator,
            value,
            fileHash,
            approvals,
            isApproved,
            lastModified
          ] = data;

          const contractObj = {
            id: Number(id),
            title,
            description,
            supplierName,
            creator,
            value: Number(value.toString()),
            fileHash,
            approvals: Number(approvals.toString()),
            isApproved,
            lastModified: Number(lastModified.toString()),
          };

          contractObj.status = isApproved
            ? 'Approved'
            : contractObj.approvals > 0
            ? 'Modified'
            : 'Pending';

          fetchedContracts.push(contractObj);
        }

        setContracts(fetchedContracts);
      } catch (error) {
        console.error('Failed to load contracts:', error);
      }
    };

    fetchContracts();
  }, []);

  const totalContracts = contracts.length;
  const pendingCount = contracts.filter((c) => c.status === 'Pending').length;
  const modifiedCount = contracts.filter((c) => c.status === 'Modified').length;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome, Procurement Officer</h1>

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

      {/* Action Buttons */}
      <div style={styles.buttonGroup}>
        <button
          style={styles.button}
          onClick={() => navigate('/dashboard/procurement/contracts/create')}
        >
          Create New Contract
        </button>
        <button
          style={styles.button}
          onClick={() => navigate('/dashboard/procurement/contracts')}
        >
          View All Contracts
        </button>
        <button
          style={styles.button}
          onClick={() => navigate('/dashboard/procurement/modification-requests')}
        >
          Submit Modification Request
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
            contracts.map(({ id, title, status }) => (
              <tr key={id} style={styles.tableRow}>
                <td style={styles.tableCell}>{title}</td>
                <td
                  style={{
                    ...styles.tableCell,
                    ...(status === 'Pending'
                      ? styles.statusPending
                      : status === 'Approved'
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
                      navigate(`/dashboard/procurement/contracts/view/${id}`)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={styles.tableCell} colSpan="3">
                No procurement contracts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProcurementDashboard;
