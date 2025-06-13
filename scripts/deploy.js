const hre = require("hardhat");

async function main() {
  const [deployer, approver1, approver2, auditor1] = await hre.ethers.getSigners();

  console.log("Deploying contract with deployer:", deployer.address);

  const approvers = [approver1.address, approver2.address];
  const auditors = [auditor1.address];

  const ProcurementApprovalFactory = await hre.ethers.getContractFactory("ProcurementApproval");

  // Deploy contract
  const contract = await ProcurementApprovalFactory.deploy(approvers, auditors);

  // Wait for the deployment to complete
  await contract.waitForDeployment();

  console.log("✅ Contract deployed at:", await contract.getAddress());
  console.log("👤 Approvers:", approvers);
  console.log("🔍 Auditors:", auditors);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
