import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProcurementContract } from '../utils/contract';

const ContractDetail = () => {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const contractInstance = await getProcurementContract();
        const fetched = await contractInstance.getAllContracts();
        const data = fetched[parseInt(id)];

        setContract({
          id,
          title: data.title,
          description: data.description,
          status: ['Pending', 'Approved', 'Modified'][Number(data.status)],
          createdBy: data.createdBy,
          createdAt: new Date(Number(data.timestamp) * 1000).toLocaleString(),
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching contract:", err);
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  if (loading) return <div>Loading contract...</div>;
  if (!contract) return <div>Contract not found.</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Contract Details</h2>
      <p><strong>ID:</strong> {contract.id}</p>
      <p><strong>Title:</strong> {contract.title}</p>
      <p><strong>Description:</strong> {contract.description}</p>
      <p><strong>Status:</strong> {contract.status}</p>
      <p><strong>Created By:</strong> {contract.createdBy}</p>
      <p><strong>Created At:</strong> {contract.createdAt}</p>
    </div>
  );
};

export default ContractDetail;
