import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProcurementContract } from "../utils/contract";

const ModificationRequestForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    supplier: "",
    value: "",
    deliveryDate: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const contractInstance = await getProcurementContract();
        const c = await contractInstance.getContract(Number(id));

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

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch contract:", err);
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
      alert("Please upload a PDF file only.");
      e.target.value = null; // Reset file input
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please upload the modified contract PDF.");
      return;
    }

    // For now, just log form data + file name
    console.log("Modification request submitted:", formData, selectedFile);

    // TODO:
    // 1. Upload selectedFile to IPFS or backend and get file hash
    // 2. Call smart contract method passing form data and new file hash

    alert("Modification request submitted! (Upload & contract interaction to be implemented)");

    navigate("/dashboard/procurement/contracts");
  };

  if (loading) return <p>Loading contract data...</p>;
  if (!contract) return <p className="text-red-600">Contract not found.</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Request Modification for Contract #{id}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title (read-only) */}
        <div>
          <label htmlFor="title" className="block mb-1 font-semibold text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block mb-1 font-semibold text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Supplier */}
        <div>
          <label htmlFor="supplier" className="block mb-1 font-semibold text-gray-700">
            Supplier Name
          </label>
          <input
            type="text"
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Value */}
        <div>
          <label htmlFor="value" className="block mb-1 font-semibold text-gray-700">
            Contract Value (KES)
          </label>
          <input
            type="number"
            id="value"
            name="value"
            value={formData.value}
            onChange={handleChange}
            min="0"
            step="1000"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Delivery Date */}
        <div>
          <label htmlFor="deliveryDate" className="block mb-1 font-semibold text-gray-700">
            Delivery Date
          </label>
          <input
            type="date"
            id="deliveryDate"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* New Contract PDF Upload */}
        <div>
          <label htmlFor="modifiedContractFile" className="block mb-1 font-semibold text-gray-700">
            Upload Modified Contract Document (PDF)
          </label>
          <input
            type="file"
            id="modifiedContractFile"
            accept="application/pdf"
            onChange={handleFileChange}
            required
            className="w-full text-gray-700"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected file: <span className="font-medium">{selectedFile.name}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700 transition"
        >
          Submit Modification Request
        </button>
      </form>
    </div>
  );
};

export default ModificationRequestForm;
