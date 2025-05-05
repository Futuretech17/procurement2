const hre = require("hardhat");

async function main() {
    const [creator, approver1, approver2] = await hre.ethers.getSigners();

    const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // 👈 use your deployed address
    const ProcurementApproval = await hre.ethers.getContractFactory("ProcurementApproval");
    const contract = await ProcurementApproval.attach(contractAddress);

    // Create a new contract as creator
    const tx = await contract.connect(creator).createContract("Road Repair", "Fix potholes on Mombasa Road");
    await tx.wait();

    console.log("Contract created ✅");

    // Approver1 approves
    const approveTx1 = await contract.connect(approver1).approveContract(1);
    await approveTx1.wait();
    console.log("Approver 1 approved ✅");

    // Approver2 approves
    const approveTx2 = await contract.connect(approver2).approveContract(1);
    await approveTx2.wait();
    console.log("Approver 2 approved ✅");

    // Done
    console.log("Contract should now be fully approved 🚀");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
