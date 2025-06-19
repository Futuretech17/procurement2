import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProcurementContract } from '../utils/contract';

const styles = {
  container: {
    padding: '2rem',
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
    color: '#2c3e50',
  },
  header: {
    fontSize: '1.8rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#2c3e50',
  },
  detailBox: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    maxWidth: '700px',
    marginBottom: '2rem',
  },
  detailRow: {
    marginBottom: '1rem',
  },
  label: {
    fontWeight: '600',
    display: 'inline-block',
    width: '160px',
    color: '#34495e',
  },
  value: {
    display: 'inline-block',
    color: '#2c3e50',
  },
  ipfsLink: {
    color: '#2980b9',
    textDecoration: 'none',
  },
  backButton: {
    marginTop: '1rem',
    padding: '0.6rem 1.2rem',
    backgroundColor: '#2980b9',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
  }
};

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const contractInstance = await getProcurementContract();
        const index = parseInt(id);

        const contractCount = await contractInstance.getTotalContracts();
        if (index <= 0 || index > contractCount) {
          setContract(null);
          setLoading(false);
          return;
        }

        const raw = await contractInstance.getContractByIndex(index);
        const isPendingModification = await contractInstance.isModificationPending(index);

        setContract({
          id: raw[0].toString(),
          title: raw[1],
          description: raw[2],
          supplier: raw[3],
          createdBy: raw[4],
          value: Number(raw[5]),
          ipfsHash: raw[6],
          approvals: raw[7].toString(),
          isApproved: raw[8],
          lastModified: new Date(Number(raw[9]) * 1000).toLocaleString(),
          startDate: new Date(Number(raw[10]) * 1000).toLocaleDateString(),
          endDate: new Date(Number(raw[11]) * 1000).toLocaleDateString(),
          modificationRequested: isPendingModification
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching contract:", err);
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  if (loading) return <div style={styles.container}>Loading contract...</div>;
  if (!contract) return <div style={styles.container}>Contract not found.</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Contract Details</h2>

      <div style={styles.detailBox}>
        <div style={styles.detailRow}>
          <span style={styles.label}>ID:</span>
          <span style={styles.value}>{contract.id}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Title:</span>
          <span style={styles.value}>{contract.title}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Description:</span>
          <span style={styles.value}>{contract.description}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Supplier:</span>
          <span style={styles.value}>{contract.supplier}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Created By:</span>
          <span style={styles.value}>{contract.createdBy}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Start Date:</span>
          <span style={styles.value}>{contract.startDate}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>End Date:</span>
          <span style={styles.value}>{contract.endDate}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Last Modified:</span>
          <span style={styles.value}>{contract.lastModified}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Value:</span>
          <span style={styles.value}>KES {contract.value.toLocaleString()}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>IPFS Hash:</span>
          <a
            href={`https://ipfs.io/ipfs/${contract.ipfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.ipfsLink}
          >
            {contract.ipfsHash}
          </a>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Approvals:</span>
          <span style={styles.value}>{contract.approvals}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Approved:</span>
          <span style={styles.value}>{contract.isApproved ? 'Yes' : 'No'}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Modification Requested:</span>
          <span style={styles.value}>{contract.modificationRequested ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <button
        style={styles.backButton}
        onClick={() => navigate(-1)}
      >
        ⬅ Back to Contracts
      </button>
    </div>
  );
};

export default ContractDetail;
