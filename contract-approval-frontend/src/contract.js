import { ethers } from "ethers";

const abi = [
  "function approveContract() public",
  "function isApproved() public view returns (bool)",
  "function hasApproved(address) public view returns (bool)"
];

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// 👇 Add this helper function
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

export const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");

  await switchToLocalhostNetwork(); // ✅ Enforce correct network before proceeding

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner(); // ethers v6 requires 'await' here
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
};
