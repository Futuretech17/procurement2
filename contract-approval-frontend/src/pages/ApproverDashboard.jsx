// src/components/ApproverDashboard.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../abi/ProcurementApproval.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function ApproverDashboard({ provider, currentAccount }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readContract, setReadContract] = useState(null);
  const [writeContract, setWriteContract] = useState(null);

  // Setup read/write contract instances
  useEffect(() => {
    const setupContracts = async () => {
      if (!provider || !currentAccount) return;

      try {
        const signer = await provider.getSigner(currentAccount);
        const readInstance = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);
        const writeInstance = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

        setReadContract(readInstance);
        setWriteContract(writeInstance);
      } catch (error) {
        console.error("Contract setup failed:", error);
      }
    };

    setupContracts();
  }, [provider, currentAccount]);

  // Load contract data
  const loadContracts = async () => {
    if (!readContract || !currentAccount) return;

    setLoading(true);
    try {
      const data = await readContract.getAllContracts();

      const enrichedContracts = await Promise.all(
        data.map(async (c) => {
          const id = c.id?.toNumber ? c.id.toNumber() : c.id;
          const approvals = c.approvals?.toNumber ? c.approvals.toNumber() : c.approvals;
          const lastModified = c.lastModified?.toNumber ? c.lastModified.toNumber() : c.lastModified;
          const value = c.value?.toString ? c.value.toString() : c.value;
          const hasApproved = await readContract.hasApproved(id, currentAccount);

          return {
            id,
            title: c.title,
            description: c.description,
            creator: c.creator,
            value,
            fileHash: c.fileHash,
            approvals,
            isApproved: c.isApproved,
            lastModified,
            hasApproved,
          };
        })
      );

      setContracts(enrichedContracts);
    } catch (err) {
      console.error("Failed to load contracts:", err);
      alert("Error loading contracts.");
    }
    setLoading(false);
  };

  // Trigger contract approval
  const approveContract = async (id) => {
    if (!writeContract) return;
    try {
      const tx = await writeContract.approveContract(id);
      await tx.wait();
      await loadContracts();
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Approval failed: " + (err.reason || err.message || "Unknown error"));
    }
  };

  // Load contracts once contracts are ready
  useEffect(() => {
    if (readContract && currentAccount) {
      loadContracts();
    }
  }, [readContract, currentAccount]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📜 Contracts Pending Approval</h2>

      {loading ? (
        <p className="text-gray-600">Loading contracts...</p>
      ) : contracts.length === 0 ? (
        <p className="text-gray-500">No contracts available for approval at the moment.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {contracts.map((c) => (
            <div key={c.id} className="bg-white shadow rounded-xl p-4 border">
              <h3 className="text-xl font-semibold text-blue-700 mb-1">{c.title}</h3>
              <p className="text-sm text-gray-700 mb-2">{c.description}</p>

              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Value:</strong> {c.value}</p>
                <p><strong>Approvals:</strong> {c.approvals}</p>
                <p><strong>Status:</strong> {c.isApproved ? "✅ Fully Approved" : "⏳ Awaiting More Approvals"}</p>
                <p><strong>Created by:</strong> {c.creator.slice(0, 8)}...</p>
              </div>

              {c.fileHash && (
                <a
                  href={`https://ipfs.io/ipfs/${c.fileHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm mt-2 text-blue-500 hover:underline"
                >
                  📎 View Contract File
                </a>
              )}

              {c.hasApproved ? (
                <p className="mt-3 text-green-600 font-medium">✅ You have approved this contract</p>
              ) : (
                <button
                  onClick={() => approveContract(c.id)}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Approve Contract
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ApproverDashboard;
