// src/utils/contract.js
import { ethers } from "ethers";

const abi = [
  "function approveContract() public",
  "function isApproved() public view returns (bool)",
  "function hasApproved(address) public view returns (bool)"
];

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
          params: [{
            chainId: hardhatChainId,
            chainName: "Hardhat Localhost",
            rpcUrls: ["http://127.0.0.1:8545"],
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
          }],
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

const getContractInstance = async () => {
  if (!window.ethereum) {
    throw new Error("Ethereum provider not found");
  }
  await switchToLocalhostNetwork();

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
};

export default getContractInstance;
