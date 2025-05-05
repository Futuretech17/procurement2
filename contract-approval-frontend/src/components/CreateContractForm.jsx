import React, { useState } from "react";
import { getContract } from "../utils/contract";

const CreateContractForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const submit = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.createContract(title, description);
      await tx.wait();
      alert("Contract created successfully!");
      setTitle("");
      setDescription("");
    } catch (err) {
      alert("Error creating contract: " + err.message);
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">Create New Contract</h3>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="border p-2 w-full mb-2"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="border p-2 w-full mb-2"
      />
      <button onClick={submit} className="bg-green-600 text-white px-4 py-2 rounded">
        Submit Contract
      </button>
    </div>
  );
};

export default CreateContractForm;
