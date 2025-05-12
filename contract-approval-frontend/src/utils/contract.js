import { ethers } from "ethers";
import ProcurementContract from "../abi/ProcurementApproval.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask is not installed");

  // Explicitly request accounts only if not already connected
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

  if (!accounts || accounts.length === 0) {
    throw new Error("No Ethereum accounts found. Please connect MetaMask.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    ProcurementContract.abi,
    signer
  );

  return contract;
};

export const getProcurementContract = getContract;
