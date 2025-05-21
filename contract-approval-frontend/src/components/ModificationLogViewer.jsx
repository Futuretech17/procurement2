// src/components/ModificationLogViewer.jsx
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getContractInstance } from '../utils/contract';




const ModificationLogViewer = () => {
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const contract = await getContractInstance(); // ✅ Get contract instance properly
        const logs = await contract.queryFilter("ContractModified"); // ✅ Match your event name exactly
        const formattedLogs = logs.map(log => ({
          contractId: log.args.contractId?.toString(),
          modifiedBy: log.args.modifiedBy,
          timestamp: new Date(Number(log.args.timestamp) * 1000).toLocaleString(),
          description: log.args.description || "N/A",
        }));
        setModifications(formattedLogs);
      } catch (err) {
        console.error("Error fetching modification logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <p>Loading modification logs...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Contract Modification Log</h2>
      {modifications.length === 0 ? (
        <p>No modifications found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Contract ID</th>
              <th className="border p-2">Modified By</th>
              <th className="border p-2">Timestamp</th>
              <th className="border p-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {modifications.map((log, index) => (
              <tr key={index}>
                <td className="border p-2">{log.contractId}</td>
                <td className="border p-2">{log.modifiedBy}</td>
                <td className="border p-2">{log.timestamp}</td>
                <td className="border p-2">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ModificationLogViewer;
