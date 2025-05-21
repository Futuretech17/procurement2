import { useState } from 'react';

const ContractModificationForm = ({ onSubmit }) => {
  const [contractId, setContractId] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ contractId, newValue, newDescription });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded space-y-3">
      <h2 className="text-lg font-bold">Submit Contract Modification</h2>
      <input
        type="number"
        placeholder="Contract ID"
        value={contractId}
        onChange={(e) => setContractId(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="number"
        placeholder="New Value"
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        placeholder="New Description"
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Submit Request
      </button>
    </form>
  );
};

export default ContractModificationForm;
