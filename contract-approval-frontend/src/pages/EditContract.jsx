import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getContractById,
  modifyContractValue,
} from "../services/contractServices";

const EditContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contractData, setContractData] = useState(null);

  useEffect(() => {
    const fetchContract = async () => {
      const contract = await getContractById(id);
      if (contract.isApproved) {
        alert("This contract has already been approved and cannot be modified.");
        navigate("/dashboard/procurement/contracts");
        return;
      }
      setContractData(contract);
    };

    fetchContract();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await modifyContractValue(id, contractData);
    navigate("/dashboard/procurement/contracts");
  };

  if (!contractData) return <div className="p-8 text-gray-700">Loading...</div>;

  return (
    <div className="p-8 w-full bg-gray-50 min-h-screen font-inter">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-10">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">Edit Contract</h2>
        <p className="text-sm text-gray-500 mb-8">
          You can update the fields below. Approved contracts cannot be modified.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Contract Title</label>
            <input
              type="text"
              value={contractData.title}
              onChange={(e) => setContractData({ ...contractData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Supply of Office Furniture"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={contractData.description}
              onChange={(e) => setContractData({ ...contractData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="e.g. Procurement of desks, chairs, and filing cabinets..."
            />
          </div>

          {/* Value in KES */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Contract Value (KES)</label>
            <input
              type="number"
              value={contractData.value}
              onChange={(e) => setContractData({ ...contractData, value: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 1500000"
            />
          </div>

          {/* Delivery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Expected Delivery Date</label>
            <input
              type="date"
              value={new Date(contractData.deliveryDate * 1000).toISOString().split("T")[0]}
              onChange={(e) =>
                setContractData({
                  ...contractData,
                  deliveryDate: Math.floor(new Date(e.target.value).getTime() / 1000),
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContract;
