import React, { useEffect, useState } from "react";
import { getProcurementContract } from "../utils/contract";

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const contract = await getProcurementContract();
        const total = await contract.contractCounter();
        setCounter(total.toNumber());

        const allContracts = [];
        for (let i = 1; i <= total; i++) {
          const c = await contract.contracts(i);
          allContracts.push(c);
        }
        setContracts(allContracts);
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
              <p className="text-sm">
                Status:{" "}
                <span className={c.isApproved ? "text-green-600" : "text-red-600"}>
                  {c.isApproved ? "✅ Approved" : "❌ Not Approved"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractList;
