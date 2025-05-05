const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContractApproval", function () {
  let contract, signer1, signer2, owner;

  beforeEach(async function () {
    [owner, signer1, signer2] = await ethers.getSigners();
  
    const ContractApproval = await ethers.getContractFactory("ContractApproval");
    contract = await ContractApproval.deploy([signer1.address, signer2.address]);
  });
  

  it("should not be approved initially", async function () {
    const approved = await contract.isApproved();
    expect(approved).to.be.false;
  });

  it("should be approved after both signers approve", async function () {
    await contract.connect(signer1).approveContract();
    await contract.connect(signer2).approveContract();

    const approved = await contract.isApproved();
    expect(approved).to.be.true;
  });

  it("should not allow non-signers to approve", async function () {
    await expect(contract.connect(owner).approveContract()).to.be.revertedWith("Not an authorized signer");
  });

  it("should not allow a signer to approve more than once", async function () {
    await contract.connect(signer1).approveContract();
  
    await expect(
      contract.connect(signer1).approveContract()
    ).to.be.revertedWith("Signer has already approved");
  });

  it("should correctly update hasApproved mapping", async function () {
    await contract.connect(signer1).approveContract();
  
    const hasSigner1Approved = await contract.hasApproved(signer1.address);
    const hasSigner2Approved = await contract.hasApproved(signer2.address);
  
    expect(hasSigner1Approved).to.be.true;
    expect(hasSigner2Approved).to.be.false;
  });
  
  
});
