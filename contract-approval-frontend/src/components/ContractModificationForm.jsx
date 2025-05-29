import React, { useState } from 'react';
import { ethers } from 'ethers';
import contractABI from '../abi/ProcurementApproval.json'; // adjust this path
import contractAddress from '../contract'; // adjust this path

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
      const maxDate = currentDate + 30 * 24 * 60 * 60; // 30 days in seconds
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
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Modify Contract</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            className="w-full p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">New Value (KES)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={newValue}
            onChange={(e) => setNewValue(parseInt(e.target.value))}
          />
        </div>

        <div>
          <label className="block font-medium">New Delivery Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={new Date(newDeliveryDate * 1000).toISOString().split('T')[0]}
            onChange={(e) => setNewDeliveryDate(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Submit Modification
        </button>

        {status && <p className="mt-2 text-sm">{status}</p>}
      </form>
    </div>
  );
};

export default ContractModificationForm;
