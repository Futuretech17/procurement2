import React, { useEffect, useState } from "react";
import { getProcurementContract } from "../utils/contract"; // Assuming this handles contract connection

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const contract = await getProcurementContract();
        const total = await contract.contractCounter(); 
        const totalCount = total.toString();
        setCounter(totalCount);
    
        const allContracts = [];
        for (let i = 1; i <= totalCount; i++) {
          try {
            const c = await contract.getContract(i);
            console.log("Contract Data:", c);
    
            // Initialize lastModified with a default value
            let lastModified = null;
    
            // Check if c[8] is a BigInt and handle it accordingly
            if (c[8] && typeof c[8] === 'bigint') {
              // Convert BigInt to number and then to date (convert to milliseconds)
              const timestamp = Number(c[8]); // Convert BigInt to number
              if (!isNaN(timestamp) && timestamp !== 0) {
                lastModified = new Date(timestamp * 1000).toLocaleString(); // Convert to date
              } else {
                console.warn(`Invalid timestamp at contract ${i}:`, c[8]);
                lastModified = "Invalid Date"; // Fallback if timestamp is invalid
              }
            } else if (typeof c[8] === 'number') {
              // If it's already a number, directly convert to date
              if (c[8] !== 0) {
                lastModified = new Date(c[8] * 1000).toLocaleString(); // Convert to date
              } else {
                lastModified = "Invalid Date"; // Fallback if timestamp is zero
              }
            } else {
              // Handle cases where the type of c[8] is unexpected
              console.warn(`Invalid lastModified data type at contract ${i}:`, c[8]);
              lastModified = "Invalid Date"; // Fallback if invalid type
            }
    
            // Create a formatted contract object with all required properties
            const formatted = {
              id: c[0].toString(),  // Contract ID (BigNumber -> string)
              title: c[1],          // Title
              description: c[2],    // Description
              creator: c[3],        // Creator address
              value: c[4].toString(), // Value (BigNumber -> string)
              fileHash: c[5],       // File hash
              approvals: c[6].toString(), // Approvals (BigNumber -> string)
              isApproved: c[7],     // Approval status (boolean)
              lastModified: lastModified, // Convert timestamp to readable date
            };
    
            allContracts.push(formatted);
          } catch (innerErr) {
            console.error(`Failed to load contract at index ${i}:`, innerErr);
          }
        }
    
        // Check the user's role to filter contracts based on permissions
        const currentUser = await contract.getUserRole(window.ethereum.selectedAddress);
        if (currentUser === "PROCUREMENT") {
          // Filter contracts created by the current user
          const userContracts = allContracts.filter(
            (c) => c.creator.toLowerCase() === window.ethereum.selectedAddress.toLowerCase()
          );
          setContracts(userContracts);  // Set filtered contracts
        } else {
          setContracts(allContracts);  // Set all contracts for other roles
        }
      } catch (error) {
        console.error("Failed to fetch contracts:", error);
      }
    };
    
    
    fetchContracts();
  }, []);

  return (
    <div>
      {contracts.length === 0 ? (
        <p className="text-gray-500">No contracts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contracts.map((c, idx) => (
            <div
              key={idx}
              className="border rounded-lg shadow-sm bg-white p-4 hover:shadow-md transition"
            >
              <h4 className="text-lg font-semibold mb-1">{c.title}</h4>
              <p className="text-sm text-gray-700 mb-2">{c.description}</p>

              {/* 🌐 IPFS File Link */}
              <a
                href={`https://ipfs.io/ipfs/${c.fileHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm mb-2 block"
              >
                📄 View Contract File
              </a>

              <p className="text-sm">
                Status:{" "}
                <span className={c.isApproved ? "text-green-600" : "text-red-600"}>
                  {c.isApproved ? "✅ Approved" : "❌ Not Approved"}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-2">Last Modified: {c.lastModified}</p>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default ContractList;
