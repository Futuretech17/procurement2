import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contract/contractABI";

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
    marginBottom: '2rem',
    color: '#2c3e50',
  },
  form: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto',
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
    transition: 'background-color 0.3s',
  },
  fileInfo: {
    fontSize: '0.9rem',
    color: '#555',
    marginTop: '-1rem',
    marginBottom: '1.5rem',
  },
};

const ModificationRequestForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    supplier: '',
    value: '',
    deliveryDate: '',
  });
  const [newTitle, setNewTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const total = await contractInstance.getTotalContracts();
        if (Number(id) >= Number(total)) throw new Error("Invalid contract ID.");

        const c = await contractInstance.getContractByIndex(Number(id));
        const deliveryTimestamp = Number(c[7]) * 1000;
        const deliveryDateISO = new Date(deliveryTimestamp).toISOString().slice(0, 10);

        setContract(c);
        setFormData({
          title: c[1],
          description: c[2],
          supplier: c[3],
          value: Number(c[5]).toString(),
          deliveryDate: deliveryDateISO,
        });
        setNewTitle(c[1]); // initialize newTitle with current title
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch contract:", err.message || err);
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("Only PDF files allowed.");
      e.target.value = null;
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please upload the modified contract PDF.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Simulated IPFS hash (replace this with actual upload logic later)
      const fakeIpfsHash = "ipfs://example-fake-hash";
      const valueInWei = ethers.parseUnits(formData.value, "wei");
      const deliveryTimestamp = Math.floor(new Date(formData.deliveryDate).getTime() / 1000);

      const tx = await contractInstance.submitModificationRequest(
        Number(id),
        newTitle,
        formData.description,
        valueInWei,
        deliveryTimestamp,
        fakeIpfsHash
      );

      await tx.wait();
      alert("Modification request submitted!");
      navigate("/dashboard/procurement/contracts");
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error occurred while submitting. Check console for details.");
    }
  };

  if (loading) return <div style={styles.container}><p>Loading contract data...</p></div>;
  if (!contract) return <div style={styles.container}><p>Contract not found or ID invalid.</p></div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Submit Modification Request</h1>

      <form style={styles.form} onSubmit={handleSubmit}>
        <label style={styles.label}>Current Contract Title</label>
        <input
          type="text"
          value={formData.title}
          readOnly
          style={{ ...styles.input, backgroundColor: "#f0f0f0", color: "#888", cursor: "not-allowed" }}
        />

        <label style={styles.label}>New Contract Title</label>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
          style={styles.input}
        />

        <label style={styles.label}>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          style={styles.textarea}
        />

        <label style={styles.label}>Supplier Name</label>
        <input
          type="text"
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <label style={styles.label}>Contract Value (KES)</label>
        <input
          type="number"
          name="value"
          value={formData.value}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <label style={styles.label}>Delivery Date</label>
        <input
          type="date"
          name="deliveryDate"
          value={formData.deliveryDate}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <label style={styles.label}>Upload Modified Contract (PDF)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          required
          style={{ marginBottom: '0.5rem' }}
        />
        {selectedFile && (
          <div style={styles.fileInfo}>Selected: {selectedFile.name}</div>
        )}

        <button type="submit" style={styles.button}>
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default ModificationRequestForm;
