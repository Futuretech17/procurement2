import React, { useState } from "react";
import { getProcurementContract } from "../utils/contract";

const styles = {
  container: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "2rem",
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    color: "#2c3e50",
  },
  header: {
    fontSize: "1.8rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
    color: "#2980b9",
    textAlign: "center",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "600",
  },
  required: {
    color: "#e74c3c",
  },
  input: {
    width: "100%",
    padding: "0.6rem 1rem",
    marginBottom: "1.25rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    color: "#34495e",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "80px",
    padding: "0.6rem 1rem",
    marginBottom: "1.25rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    color: "#34495e",
    resize: "vertical",
    boxSizing: "border-box",
  },
  dateGroup: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#2980b9",
    color: "#fff",
    fontWeight: "700",
    fontSize: "1.1rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonDisabled: {
    backgroundColor: "#95a5a6",
    cursor: "not-allowed",
  },
  fileInput: {
    marginBottom: "1.5rem",
  },
  errorText: {
    color: "#e74c3c",
    marginBottom: "1rem",
  },
};

const CreateContractForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [supplier, setSupplier] = useState("");
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [specialConditions, setSpecialConditions] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setError("");
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFileToBackendIPFS = async (file) => {
    const data = new FormData();
    data.append("file", file);

    const res = await fetch("http://localhost:5000/api/ipfs/upload", {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      throw new Error("IPFS upload failed");
    }

    const result = await res.json();
    return result.ipfsHash;
  };

  const submit = async () => {
    setError("");

    try {
      if (
        !title.trim() ||
        !description.trim() ||
        !supplier.trim() ||
        !value ||
        !startDate ||
        !endDate ||
        !file
      ) {
        setError("Please fill all required fields and select a file.");
        return;
      }

      const numericValue = Number(value);
      if (isNaN(numericValue) || numericValue <= 0) {
        setError("Please enter a valid positive number for Value.");
        return;
      }

      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
      const nowTimestamp = Math.floor(Date.now() / 1000);

      if (
        isNaN(startTimestamp) ||
        isNaN(endTimestamp) ||
        startTimestamp <= nowTimestamp ||
        endTimestamp <= startTimestamp
      ) {
        setError(
          "Please enter valid future start and end dates, with end date after start date."
        );
        return;
      }

      setLoading(true);

      // ✅ Ensure wallet is connected
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // ✅ Upload file to IPFS backend
      const fileHash = await uploadFileToBackendIPFS(file);

      console.log("📤 Submitting to contract...");
      console.log("File hash:", fileHash);
      console.log("Creating contract with:", {
        title,
        description,
        supplier,
        value: numericValue,
        fileHash,
        endTimestamp,
      });

      // ✅ Load contract
      const contract = await getProcurementContract();
      console.log("Contract loaded:", contract);

      // ✅ Send transaction
      const tx = await contract.createContract(
        title.trim(),
        description.trim(),
        supplier.trim(),
        BigInt(numericValue),
        fileHash,
        endTimestamp
      );
      
      console.log("Transaction object:", tx);

      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("✅ Contract created on-chain.");

      alert("Contract created successfully!");

      // ✅ Reset form
      setTitle("");
      setDescription("");
      setSupplier("");
      setValue("");
      setStartDate("");
      setEndDate("");
      setSpecialConditions("");
      setFile(null);
      document.getElementById("fileInput").value = null;
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message || "Error creating contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>Create New Contract</h3>

      {error && <p style={styles.errorText}>{error}</p>}

      <label htmlFor="title" style={styles.label}>
        Title <span style={styles.required}>*</span>:
      </label>
      <input
        id="title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Supply of Office Stationery"
        style={styles.input}
        disabled={loading}
      />

      <label htmlFor="description" style={styles.label}>
        Description <span style={styles.required}>*</span>:
      </label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Contract details and scope"
        style={styles.textarea}
        disabled={loading}
      />

      <label htmlFor="supplier" style={styles.label}>
        Supplier Name <span style={styles.required}>*</span>:
      </label>
      <input
        id="supplier"
        type="text"
        value={supplier}
        onChange={(e) => setSupplier(e.target.value)}
        placeholder="e.g., ABC Stationery Ltd."
        style={styles.input}
        disabled={loading}
      />

      <label htmlFor="value" style={styles.label}>
        Contract Value (KES) <span style={styles.required}>*</span>:
      </label>
      <input
        id="value"
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g., 5000000"
        min="0"
        style={styles.input}
        disabled={loading}
      />

      <div style={styles.dateGroup}>
        <div style={{ flex: 1 }}>
          <label htmlFor="startDate" style={styles.label}>
            Contract Start Date <span style={styles.required}>*</span>:
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            style={styles.input}
            disabled={loading}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label htmlFor="endDate" style={styles.label}>
            Contract End Date <span style={styles.required}>*</span>:
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split("T")[0]}
            style={styles.input}
            disabled={loading}
          />
        </div>
      </div>

      <label htmlFor="specialConditions" style={styles.label}>
        Special Conditions (Optional):
      </label>
      <textarea
        id="specialConditions"
        value={specialConditions}
        onChange={(e) => setSpecialConditions(e.target.value)}
        placeholder="e.g., Monthly delivery installments, penalties for delays"
        style={styles.textarea}
        disabled={loading}
      />

      <label htmlFor="fileInput" style={styles.label}>
        Upload Contract Document (PDF or Image) <span style={styles.required}>*</span>:
      </label>
      <input
        id="fileInput"
        type="file"
        onChange={handleFileChange}
        style={styles.fileInput}
        disabled={loading}
        accept="application/pdf,image/*"
      />

      <button
        onClick={submit}
        style={{
          ...styles.button,
          ...(loading ? styles.buttonDisabled : {}),
        }}
        disabled={loading}
      >
        {loading ? "Creating..." : "Submit Contract"}
      </button>
    </div>
  );
};

export default CreateContractForm;
