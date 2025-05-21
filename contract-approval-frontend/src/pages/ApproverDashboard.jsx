// src/App.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../abi/ProcurementApproval.json";

const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethProvider);

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
      } else {
        alert("Please install MetaMask!");
      }
    };

    init();
  }, []);

  return (
    <div>
      {provider && account ? (
        <ApproverDashboard provider={provider} currentAccount={account} />
      ) : (
        <p className="p-4">Connecting to wallet...</p>
      )}
    </div>
  );
}

function ApproverDashboard({ provider, currentAccount }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readContract, setReadContract] = useState(null);
  const [writeContract, setWriteContract] = useState(null);

  useEffect(() => {
    const setupContracts = async () => {
      if (!provider || !currentAccount) return;

      try {
        const signer = await provider.getSigner(currentAccount);
        const readInstance = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);
        const writeInstance = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

        setReadContract(readInstance);
        setWriteContract(writeInstance);
      } catch (err) {
        console.error("Failed to initialize contracts:", err);
      }
    };

    setupContracts();
  }, [provider, currentAccount]);

  const loadContracts = async () => {
    if (!readContract || !currentAccount) return;

    setLoading(true);
    try {
      const all = await readContract.getAllContracts();

      const enriched = await Promise.all(
        all.map(async (c) => {
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

      setContracts(enriched);
    } catch (err) {
      console.error("Failed to load contracts:", err);
      alert("Failed to load contracts. Please try again.");
    }
    setLoading(false);
  };

  const approveContract = async (id) => {
    if (!writeContract) return;
    try {
      const tx = await writeContract.approveContract(id);
      await tx.wait();
      await loadContracts(); // Refresh list after approval
    } catch (err) {
      console.error("Approval failed:", err);
      const reason =
        err?.reason ||
        err?.data?.message ||
        err?.error?.message ||
        err?.message ||
        "Unknown error";
      alert("Approval failed: " + reason);
    }
  };

  useEffect(() => {
    if (readContract && currentAccount) {
      loadContracts();
    }
  }, [readContract, currentAccount]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Approver Dashboard</h2>

      {loading ? (
        <p>Loading contracts...</p>
      ) : contracts.length === 0 ? (
        <p>No contracts available for approval.</p>
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => (
            <div key={c.id} className="p-4 rounded-xl shadow border bg-white">
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p>
                <strong>Description:</strong> {c.description}
              </p>
              <p>
                <strong>Value:</strong> {c.value}
              </p>
              <p>
                <strong>Status:</strong> {c.isApproved ? "✅ Fully Approved" : "⏳ Pending Approval"}
              </p>
              <p>
                <strong>Approvals:</strong> {c.approvals}
              </p>
              {c.fileHash && (
                <p>
                  <strong>Contract File: </strong>
                  <a
                    href={
                      c.fileHash.startsWith("http")
                        ? c.fileHash
                        : `https://ipfs.io/ipfs/${c.fileHash}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Contract
                  </a>
                </p>
              )}
              {c.hasApproved ? (
                <p className="text-green-600 mt-2">✅ You already approved this contract</p>
              ) : (
                <button
                  onClick={() => approveContract(c.id)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Approve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
