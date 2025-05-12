import React, { useState } from "react";
import { getContract } from "../utils/contract";

const CreateContractForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload file to backend and get IPFS hash
  const uploadFileToBackendIPFS = async (file) => {
    const data = new FormData();
    data.append("file", file);

    const res = await fetch("http://localhost:5000/api/ipfs/upload", {
      method: "POST",
      body: data,
    });

    if (!res.ok) throw new Error("IPFS upload failed");

    const result = await res.json();
    return result.ipfsHash;
  };

  const submit = async () => {
    try {
      if (!title || !description || !value || !file) {
        alert("Please fill all fields and select a file.");
        return;
      }

      setLoading(true);

      const fileHash = await uploadFileToBackendIPFS(file);
      const contract = await getContract();

      const tx = await contract.createContract(
        title,
        description,
        BigInt(value), // Convert to uint256-compatible value
        fileHash
      );

      await tx.wait();

      alert("Contract created successfully!");
      setTitle("");
      setDescription("");
      setValue("");
      setFile(null);
    } catch (err) {
      console.error("Error:", err.message);
      alert("Error creating contract: " + err.message);
    } finally {
      setLoading(false);
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
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Value (e.g., 10000)"
        className="border p-2 w-full mb-2"
      />
      <input
        type="file"
        onChange={handleFileChange}
        className="border p-2 w-full mb-2"
      />
      <button
        onClick={submit}
        className={`bg-green-600 text-white px-4 py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? "Creating..." : "Submit Contract"}
      </button>
    </div>
  );
};

export default CreateContractForm;
