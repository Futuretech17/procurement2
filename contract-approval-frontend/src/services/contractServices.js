import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contract/contractABI";

// ✅ Fetch contract details by ID (which maps to index - 1)
export const getContractById = async (id) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const total = await contract.getTotalContracts();
    if (id <= 0 || id > Number(total)) {
      throw new Error("Invalid contract ID.");
    }

    const data = await contract.getContractByIndex(id); // ✅ Now pass ID directly

    return {
      id: Number(data[0]),
      title: data[1],
      description: data[2],
      supplierName: data[3],
      creator: data[4],
      value: data[5].toString(),
      fileHash: data[6],
      approvals: Number(data[7]),
      isApproved: data[8],
      lastModified: Number(data[9]),
      startDate: Number(data[10]),
      deliveryDate: Number(data[11]),
    };
  } catch (err) {
    console.error("❌ Error fetching contract by ID:", err);
    throw err;
  }
};


// ✅ Modify the contract via smart contract
export const modifyContract = async (id, updatedData) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const tx = await contract.modifyContract(
      id,
      updatedData.title,
      updatedData.description,
      updatedData.supplierName || "",
      ethers.parseUnits(updatedData.value.toString(), "wei"),
      updatedData.fileHash || "",
      updatedData.deliveryDate
    );

    await tx.wait();
    console.log(`✅ Contract ${id} modified successfully.`);
    return true;
  } catch (error) {
    console.error("❌ Error modifying contract:", error);
    throw error;
  }
};

// 🟡 Submit modification request — can be updated further if logic is added in the contract
export const submitModificationRequest = async (id, newValue) => {
  console.log(`📨 Submitting modification request for contract ${id} with value: ${newValue}`);
  return true;
};
