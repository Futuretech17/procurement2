import { ethers } from "ethers";
import ProcurementContract from "../abi/ProcurementApproval.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export async function connectWalletAndGetRole() {
  if (!window.ethereum) throw new Error("MetaMask not installed.");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();

  const contract = new ethers.Contract(CONTRACT_ADDRESS, ProcurementContract.abi, signer);

  try {
    console.log("Calling getUserRole with:", userAddress);
    const role = await contract.getUserRole(userAddress); // returns string
    return { address: userAddress, role };
  } catch (error) {
    console.error("Error fetching role:", error);
    throw new Error("Unable to retrieve user role from contract.");
  }
}
