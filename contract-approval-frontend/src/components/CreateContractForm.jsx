import React, { useState } from "react";
import { getProcurementContract } from "../utils/contract";

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

  const handleFileChange = (e) => {
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
    try {
      // Validate required fields
      if (
        !title.trim() ||
        !description.trim() ||
        !supplier.trim() ||
        !value ||
        !startDate ||
        !endDate ||
        !file
      ) {
        alert("Please fill all required fields and select a file.");
        return;
      }

      // Validate numeric value
      const numericValue = Number(value);
      if (isNaN(numericValue) || numericValue <= 0) {
        alert("Please enter a valid positive number for Value.");
        return;
      }

      // Validate dates (startDate < endDate and both future)
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
      const nowTimestamp = Math.floor(Date.now() / 1000);

      if (
        isNaN(startTimestamp) ||
        isNaN(endTimestamp) ||
        startTimestamp <= nowTimestamp ||
        endTimestamp <= startTimestamp
      ) {
        alert("Please enter valid future start and end dates, with end date after start date.");
        return;
      }

      setLoading(true);

      // Upload file and get IPFS hash
      const fileHash = await uploadFileToBackendIPFS(file);

      // Get contract instance
      const contract = await getProcurementContract();

      // Call smart contract createContract method
      // You need to update the smart contract to accept startDate, endDate, specialConditions if storing on-chain
      // For now, we just pass current parameters (adjust as per your contract)
      const tx = await contract.createContract(
        title.trim(),
        description.trim(),
        supplier.trim(),
        BigInt(numericValue),
        fileHash,
        endTimestamp // Example: use end date timestamp (or startTimestamp if that's your design)
      );

      await tx.wait();

      alert("Contract created successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setSupplier("");
      setValue("");
      setStartDate("");
      setEndDate("");
      setSpecialConditions("");
      setFile(null);

      // Clear file input
      document.getElementById("fileInput").value = null;
    } catch (err) {
      console.error("Error:", err.message || err);
      alert("Error creating contract: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">Create New Contract</h3>

      <div className="mb-4">
        <label htmlFor="title" className="block mb-1 font-medium text-gray-700">
          Title<span className="text-red-500">*</span>:
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Supply of Office Stationery"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block mb-1 font-medium text-gray-700">
          Description<span className="text-red-500">*</span>:
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contract details and scope"
          className="w-full border border-gray-300 rounded px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={4}
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="supplier" className="block mb-1 font-medium text-gray-700">
          Supplier Name<span className="text-red-500">*</span>:
        </label>
        <input
          id="supplier"
          type="text"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          placeholder="e.g., ABC Stationery Ltd."
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="value" className="block mb-1 font-medium text-gray-700">
          Contract Value (KES)<span className="text-red-500">*</span>:
        </label>
        <input
          id="value"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g., 5000000"
          min="0"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block mb-1 font-medium text-gray-700">
            Contract Start Date<span className="text-red-500">*</span>:
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block mb-1 font-medium text-gray-700">
            Contract End Date<span className="text-red-500">*</span>:
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split("T")[0]}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={loading}
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="specialConditions" className="block mb-1 font-medium text-gray-700">
          Special Conditions (Optional):
        </label>
        <textarea
          id="specialConditions"
          value={specialConditions}
          onChange={(e) => setSpecialConditions(e.target.value)}
          placeholder="e.g., Monthly delivery installments, penalties for delays"
          className="w-full border border-gray-300 rounded px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="fileInput" className="block mb-1 font-medium text-gray-700">
          Upload Contract Document (PDF or Image)<span className="text-red-500">*</span>:
        </label>
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
          accept="application/pdf,image/*"
        />
      </div>

      <button
        onClick={submit}
        className={`w-full bg-green-600 text-white font-semibold py-3 rounded hover:bg-green-700 transition ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Creating..." : "Submit Contract"}
      </button>
    </div>
  );
};

export default CreateContractForm;
