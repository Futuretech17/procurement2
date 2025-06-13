import { ethers } from "ethers";
import ProcurementApproval from "../abi/ProcurementApproval.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const switchToLocalhostNetwork = async () => {
  const hardhatChainId = "0x7A69"; // 31337 in hex
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hardhatChainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hardhatChainId,
              chainName: "Hardhat Localhost",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } catch (addError) {
        console.error("Error adding local network:", addError);
        throw addError;
      }
    } else {
      console.error("Error switching network:", switchError);
      throw switchError;
    }
  }
};

// 🧩 Minimal ABI (for basic approval testing)
const minimalAbi = [
  "function approveContract() public",
  "function isApproved() public view returns (bool)",
  "function hasApproved(address) public view returns (bool)",
];

// ✅ Function 1: Used for minimal testing (if needed)
export const getContractInstance = async () => {
  if (!window.ethereum) {
    throw new Error("Ethereum provider not found");
  }
  await switchToLocalhostNetwork();

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, minimalAbi, signer);
};

// ✅ Function 2: Full Procurement Contract instance with full ABI
export const getProcurementContract = async () => {
  if (!window.ethereum) {
    throw new Error("Ethereum provider not found");
  }
  await switchToLocalhostNetwork();

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ProcurementApproval.abi, signer);
};

// ✅ Function 3: Get contract details by ID
export const getContractById = async (id) => {
  const contract = await getProcurementContract();
  const data = await contract.getContract(id); // Make sure this exists in your Solidity contract
  return data;
};
