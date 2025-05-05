const hre = require("hardhat");

async function main() {
    const [deployer, approver1, approver2] = await hre.ethers.getSigners();

    const approvers = [approver1.address, approver2.address];

    const ProcurementApproval = await hre.ethers.getContractFactory("ProcurementApproval");
    const contract = await ProcurementApproval.deploy(approvers);

    await contract.waitForDeployment(); // ✅ updated for ethers v6

    console.log("Contract deployed to:", await contract.getAddress());
    console.log("Deployed by:", deployer.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
