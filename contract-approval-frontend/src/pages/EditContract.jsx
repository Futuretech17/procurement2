import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const EditContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contractData, setContractData] = useState(null);

  useEffect(() => {
    // Fetch contract by ID (mocked here — replace with actual blockchain call)
    const fetchContract = async () => {
      const contract = await getContractById(id); // your custom method
      if (contract.isApproved) {
        alert("This contract has already been approved and cannot be modified.");
        navigate("/dashboard/procurement/contracts");
        return;
      }
      setContractData(contract);
    };

    fetchContract();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await modifyContract(id, contractData); // Call smart contract
    navigate("/dashboard/procurement/contracts");
  };

  if (!contractData) return <div>Loading...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Modify Contract</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
          <input
            type="text"
            value={contractData.title}
            onChange={(e) => setContractData({ ...contractData, title: e.target.value })}
            className="w-full border p-2 mb-4"
          />
          {/* Add more fields here */}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditContract;
