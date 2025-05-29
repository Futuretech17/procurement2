const hre = require("hardhat");

async function main() {
  // Get multiple accounts from the local Hardhat node
  const [deployer, approver1, approver2, auditor] = await hre.ethers.getSigners();

  // Define approvers array (two approvers here)
  const approvers = [approver1.address, approver2.address];

  // Deploy the contract with the approvers
  const ProcurementApproval = await hre.ethers.getContractFactory("ProcurementApproval");
  const contract = await ProcurementApproval.deploy(approvers);
  await contract.waitForDeployment();

  console.log("Contract deployed to:", await contract.getAddress());
  console.log("Roles assigned:");
  console.log("PROCUREMENT OFFICER:", deployer.address);
  console.log("APPROVER 1:", approver1.address);
  console.log("APPROVER 2:", approver2.address);
  console.log("AUDITOR:", auditor.address);

  // Removed all calls to contract.setUserRole
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
