import React, { useEffect, useState } from "react";
import { getProcurementContract } from "../utils/contract"; // Contract connection utility
import { useNavigate } from "react-router-dom";

const truncateAddress = (address) =>
  address ? address.slice(0, 6) + "..." + address.slice(-4) : "";

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [counter, setCounter] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const contract = await getProcurementContract();
        const total = await contract.contractCounter();
        const totalCount = total.toNumber ? total.toNumber() : Number(total);
        setCounter(totalCount);

        const allContracts = [];

        for (let i = 1; i <= totalCount; i++) {
          try {
            const c = await contract.getContract(i);

            // Convert UNIX timestamp to readable string
            let lastModified = "N/A";
            const ts = Number(c[9]);
            if (!isNaN(ts) && ts !== 0) {
              lastModified = new Date(ts * 1000).toLocaleString();
            }

            const formatted = {
              id: c[0].toString(),
              title: c[1],
              description: c[2],
              supplier: c[3],
              creator: c[4],
              value: Number(c[5]).toLocaleString(),
              fileHash: c[6],
              approvals: c[7].toString(),
              isApproved: c[8],
              lastModified,
            };

            allContracts.push(formatted);
          } catch (err) {
            console.error(`Error loading contract ${i}:`, err);
          }
        }

        // Get user address and role
        const userAddress = window.ethereum.selectedAddress?.toLowerCase();
        const role = await contract.getUserRole(userAddress);
        setUserRole(role);

        if (role === "PROCUREMENT") {
          setContracts(allContracts.filter(c => c.creator.toLowerCase() === userAddress));
        } else {
          setContracts(allContracts);
        }
      } catch (error) {
        console.error("Error fetching contracts:", error);
      }
    };

    fetchContracts();
  }, []);

  if (userRole === null) {
    return <p className="text-gray-500">Loading user information...</p>;
  }

  return (
    <div>
      {contracts.length === 0 ? (
        <p className="text-gray-500 text-center mt-8">No contracts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="border rounded-lg shadow-sm bg-white p-6 hover:shadow-lg transition duration-300"
              role="region"
              aria-label={`Contract ${c.title}`}
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{c.title}</h3>

              <p className="text-sm text-gray-700 mb-2">
                <strong>Description:</strong> {c.description}
              </p>

              <p className="text-sm text-gray-700 mb-1">
                <strong>Supplier:</strong> {c.supplier}
              </p>

              <p className="text-sm text-gray-700 mb-1">
                <strong>Contract Value:</strong> KES {c.value}
              </p>

              <p className="text-sm text-gray-700 mb-1">
                <strong>Creator:</strong>{" "}
                <span title={c.creator} className="font-mono text-gray-600">
                  {truncateAddress(c.creator)}
                </span>
              </p>

              <p className="text-sm text-gray-700 mb-2">
                <strong>Approvals:</strong> {c.approvals}
              </p>

              <a
                href={`https://ipfs.io/ipfs/${c.fileHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm mb-3 block"
                aria-label={`View contract file for ${c.title}`}
              >
                📄 View Contract Document
              </a>

              <p className="text-sm mb-2">
                <strong>Status:</strong>{" "}
                <span
                  className={c.isApproved ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}
                >
                  {c.isApproved ? "✅ Approved" : "❌ Not Approved"}
                </span>
              </p>

              <p className="text-xs text-gray-400 mb-4">
                <strong>Last Modified:</strong> {c.lastModified}
              </p>

              {c.isApproved && userRole === "PROCUREMENT" && (
                <button
                  onClick={() => navigate(`/dashboard/procurement/contracts/request-modification/${c.id}`)}
                  className="mt-auto bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm w-full"
                  aria-label={`Request modification for contract ${c.title}`}
                >
                  📝 Request Modification
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractList;
