// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ContractApproval {
    address[] public signers;
    mapping(address => bool) public hasApproved;

    uint public approvalCount;

    modifier onlySigner() {
        require(isSigner(msg.sender), "Not an authorized signer");
        _;
    }

    constructor(address[] memory _signers) {
        require(_signers.length > 0, "Must have at least one signer");
        signers = _signers;
    }

    function isSigner(address addr) internal view returns (bool) {
        for (uint i = 0; i < signers.length; i++) {
            if (signers[i] == addr) {
                return true;
            }
        }
        return false;
    }

    function approveContract() public onlySigner {
        require(!hasApproved[msg.sender], "Signer has already approved");
        hasApproved[msg.sender] = true;
        approvalCount++;
    }

    function isApproved() public view returns (bool) {
        return approvalCount == signers.length;
    }
}
