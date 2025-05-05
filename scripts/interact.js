  const hre = require("hardhat");

  async function main() {
    const [owner, signer1, signer2] = await hre.ethers.getSigners();
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your actual address
  
    const ContractApproval = await hre.ethers.getContractFactory("ContractApproval");
    const contract = ContractApproval.attach(contractAddress);
  
    // signer1 approves
    const tx1 = await contract.connect(signer1).approveContract();
    await tx1.wait();
    console.log("Signer1 approved the contract");
  
    // signer2 approves
    const tx2 = await contract.connect(signer2).approveContract();
    await tx2.wait();
    console.log("Signer2 approved the contract");
  
    // Now check approval status
    const approved = await contract.isApproved();
    console.log("Is contract fully approved?", approved);
  }
  
  main().catch(console.error);
  