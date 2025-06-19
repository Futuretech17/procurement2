import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getContractById,
  modifyContract,
} from "../../services/contractServices"; // ✅ use the correct function

const EditContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const contract = await getContractById(Number(id));

        if (contract.isApproved) {
          alert("This contract has already been approved and cannot be modified.");
          navigate("/dashboard/procurement/contracts");
          return;
        }

        setContractData({
          title: contract.title || "",
          description: contract.description || "",
          value: contract.value || "",
          deliveryDate: contract.deliveryDate
            ? new Date(contract.deliveryDate * 1000).toISOString().split("T")[0]
            : "",
          supplierName: contract.supplierName || "",
          fileHash: contract.fileHash || "", // optional fallback
        });
      } catch (error) {
        console.error("Error fetching contract:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContractData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await modifyContract(Number(id), {
        ...contractData,
        value: parseInt(contractData.value),
        deliveryDate: Math.floor(new Date(contractData.deliveryDate).getTime() / 1000),
      });

      alert("Contract updated successfully!");
      navigate("/dashboard/procurement/contracts");
    } catch (error) {
      console.error("Error saving contract:", error);
      alert("Failed to save changes.");
    }
  };

  if (loading) return <div style={styles.container}><p>Loading contract data...</p></div>;
  if (!contractData) return <div style={styles.container}><p>Contract not found.</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Edit Contract</h2>
        <p style={styles.subtext}>Update the fields below. Approved contracts cannot be modified.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Contract Title</label>
          <input
            type="text"
            name="title"
            value={contractData.title}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            value={contractData.description}
            onChange={handleChange}
            rows={4}
            required
            style={styles.textarea}
          />

          <label style={styles.label}>Supplier Name</label>
          <input
            type="text"
            name="supplierName"
            value={contractData.supplierName}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Contract Value (KES)</label>
          <input
            type="number"
            name="value"
            value={contractData.value}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Delivery Date</label>
          <input
            type="date"
            name="deliveryDate"
            value={contractData.deliveryDate}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
    fontFamily: "'Roboto', sans-serif",
  },
  card: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '2rem',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
  },
  header: {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '0.5rem',
  },
  subtext: {
    fontSize: '0.9rem',
    color: '#7f8c8d',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: '500',
    marginBottom: '0.5rem',
    color: '#34495e',
  },
  input: {
    padding: '0.8rem',
    marginBottom: '1.5rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '0.8rem',
    height: '100px',
    marginBottom: '1.5rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  button: {
    backgroundColor: '#2980b9',
    color: '#fff',
    padding: '0.9rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default EditContract;
