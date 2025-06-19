import React, { useState } from 'react';
import { ethers } from 'ethers';
import contractABI from '../abi/ProcurementApproval.json';
import contractAddress from '../contract';

const styles = {
  container: {
    padding: '2rem',
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
    boxSizing: 'border-box',
  },
  header: {
    fontSize: '1.8rem',
    fontWeight: '600',
    marginBottom: '2rem',
    color: '#2980b9',
    textAlign: 'center',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#34495e',
  },
  input: {
    width: '100%',
    padding: '0.8rem',
    marginBottom: '1.5rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '0.8rem',
    height: '100px',
    marginBottom: '1.5rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  button: {
    backgroundColor: '#2980b9',
    color: '#fff',
    border: 'none',
    padding: '0.9rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    width: '100%',
    transition: 'background-color 0.3s',
  },
  statusMessage: {
    marginTop: '1.2rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    textAlign: 'center',
  },
};

const ContractModificationForm = ({ contractData }) => {
  const [description, setDescription] = useState(contractData.description);
  const [newValue, setNewValue] = useState(contractData.value);
  const [newDeliveryDate, setNewDeliveryDate] = useState(contractData.deliveryDate);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!window.ethereum) throw new Error("MetaMask not found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const currentValue = contractData.value;
      const maxAllowed = currentValue + (currentValue * 25) / 100;

      if (newValue > maxAllowed) {
        setStatus("❌ Value exceeds 25% allowed increase.");
        return;
      }

      const currentDate = parseInt(contractData.deliveryDate);
      const maxDate = currentDate + 30 * 24 * 60 * 60;
      const newDateTimestamp = Math.floor(new Date(newDeliveryDate).getTime() / 1000);

      if (newDateTimestamp > maxDate) {
        setStatus("❌ Delivery date extension exceeds 30 days.");
        return;
      }

      const tx = await contract.submitModificationRequest(
        contractData.id,
        description,
        newValue,
        newDateTimestamp
      );

      await tx.wait();
      setStatus("✅ Modification request submitted successfully.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error submitting modification.");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.header}>Modify Contract</h2>

        <label style={styles.label}>Description</label>
        <textarea
          style={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label style={styles.label}>New Value (KES)</label>
        <input
          type="number"
          style={styles.input}
          value={newValue}
          onChange={(e) => setNewValue(parseInt(e.target.value))}
          min="0"
        />

        <label style={styles.label}>New Delivery Date</label>
        <input
          type="date"
          style={styles.input}
          value={new Date(newDeliveryDate * 1000).toISOString().split('T')[0]}
          onChange={(e) => setNewDeliveryDate(e.target.value)}
        />

        <button type="submit" style={styles.button}>
          Submit Modification
        </button>

        {status && (
          <p
            style={{
              ...styles.statusMessage,
              color: status.startsWith("✅") ? "green" : "crimson",
            }}
          >
            {status}
          </p>
        )}
      </form>
    </div>
  );
};

export default ContractModificationForm;
