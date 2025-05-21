import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContractInstance } from '../utils/contract';

const ModificationApprovalDashboard = () => {
  const [modRequests, setModRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending modification requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const contract = await getContractInstance(); // await here
        const requests = await contract.getPendingModifications(); // example function
        setModRequests(requests);
      } catch (err) {
        console.error("Error fetching modification requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (contractId) => {
    try {
      const contract = await getContractInstance(); // await here
      const tx = await contract.approveModification(contractId);
      await tx.wait();
      alert("Modification approved!");
      window.location.reload();
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Error approving modification");
    }
  };

  const handleReject = async (contractId) => {
    try {
      const contract = await getContractInstance(); // await here
      const tx = await contract.rejectModification(contractId);
      await tx.wait();
      alert("Modification rejected!");
      window.location.reload();
    } catch (err) {
      console.error("Rejection failed:", err);
      alert("Error rejecting modification");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Modification Approval Dashboard</h1>
      {modRequests.length === 0 ? (
        <p>No pending modification requests.</p>
      ) : (
        modRequests.map((req, index) => (
          <div key={index} className="border p-4 rounded-xl mb-4 shadow">
            <p><strong>Contract ID:</strong> {req.contractId}</p>
            <p><strong>Original Value:</strong> {req.originalValue}</p>
            <p><strong>Proposed Modification:</strong> {req.newValue}</p>
            {/* Add more fields based on your smart contract data */}
            <div className="mt-2">
              <button
                onClick={() => handleApprove(req.contractId)}
                className="bg-green-600 text-white px-3 py-1 rounded mr-2"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(req.contractId)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ModificationApprovalDashboard;
