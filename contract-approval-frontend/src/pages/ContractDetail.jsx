// src/pages/ContractDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProcurementContract } from '../utils/contract';
import { ethers } from "ethers";

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const contractInstance = await getProcurementContract();
        const allContracts = await contractInstance.getAllContracts();
        const raw = allContracts[parseInt(id)];

        console.log("📦 Raw contract data at ID", id, ":", raw);

        if (!raw) {
          setContract(null);
          setLoading(false);
          return;
        }

        setContract({
          id: raw[0].toString(),
          title: raw[1],
          description: raw[2],
          department: raw[3],
          createdBy: raw[4],
          value: ethers.formatEther(raw[5]), // assuming value is in wei
          ipfsHash: raw[6],
          status: ['Pending', 'Approved', 'Modified'][Number(raw[7])] || 'Unknown',
          modificationRequested: raw[8],
          createdAt: new Date(Number(raw[9]) * 1000).toLocaleString(),
          deadline: new Date(Number(raw[10]) * 1000).toLocaleString(),
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

  const statusColor = {
    Pending: 'orange',
    Approved: 'green',
    Modified: 'blue',
    Unknown: 'gray',
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Contract Details</h2>
      <p><strong>ID:</strong> {contract.id}</p>
      <p><strong>Title:</strong> {contract.title}</p>
      <p><strong>Description:</strong> {contract.description}</p>
      <p><strong>Department:</strong> {contract.department}</p>
      <p>
        <strong>Status:</strong>{' '}
        <span style={{ color: statusColor[contract.status] || 'black' }}>
          {contract.status}
        </span>
      </p>
      <p><strong>Created By:</strong> {contract.createdBy}</p>
      <p><strong>Created At:</strong> {contract.createdAt}</p>
      <p><strong>Deadline:</strong> {contract.deadline}</p>
      <p><strong>Value:</strong> {contract.value} ETH</p>
      <p>
        <strong>IPFS Hash:</strong>{' '}
        <a
          href={`https://ipfs.io/ipfs/${contract.ipfsHash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {contract.ipfsHash}
        </a>
      </p>
      <p><strong>Modification Requested:</strong> {contract.modificationRequested ? 'Yes' : 'No'}</p>

      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#eee',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        ⬅ Back to Contracts
      </button>
    </div>
  );
};

export default ContractDetail;
