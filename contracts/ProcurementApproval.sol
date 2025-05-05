// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProcurementApproval {
    address public owner;

    enum Role { NONE, PROCUREMENT, APPROVER, AUDITOR }
    mapping(address => Role) public roles;

    struct ProcurementContract {
        uint id;
        string title;
        string description;
        address creator;
        uint approvals;
        bool isApproved;
        mapping(address => bool) approvedBy;
    }

    uint public contractCounter;
    mapping(uint => ProcurementContract) private contractStorage;

    address[] public approvers;

    constructor(address[] memory _approvers) {
        owner = msg.sender;
        roles[msg.sender] = Role.PROCUREMENT;

        approvers = _approvers;
        for (uint i = 0; i < _approvers.length; i++) {
            roles[_approvers[i]] = Role.APPROVER;
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action.");
        _;
    }

    modifier onlyApprover() {
        require(roles[msg.sender] == Role.APPROVER, "Only approvers can perform this action.");
        _;
    }

    modifier onlyProcurementOfficer() {
        require(roles[msg.sender] == Role.PROCUREMENT, "Only procurement officers can perform this action.");
        _;
    }

    function createContract(string memory _title, string memory _description) public onlyProcurementOfficer returns (uint) {
        contractCounter++;
        ProcurementContract storage newContract = contractStorage[contractCounter];
        newContract.id = contractCounter;
        newContract.title = _title;
        newContract.description = _description;
        newContract.creator = msg.sender;
        newContract.isApproved = false;
        return contractCounter;
    }

    function approveContract(uint _id) public onlyApprover {
        ProcurementContract storage c = contractStorage[_id];
        require(!c.isApproved, "Contract already fully approved.");
        require(!c.approvedBy[msg.sender], "You have already approved this contract.");

        c.approvedBy[msg.sender] = true;
        c.approvals++;

        if (c.approvals >= approvers.length) {
            c.isApproved = true;
        }
    }

    function getContract(uint _id) public view returns (
        uint id,
        string memory title,
        string memory description,
        address creator,
        uint approvals,
        bool isApproved
    ) {
        ProcurementContract storage c = contractStorage[_id];
        return (c.id, c.title, c.description, c.creator, c.approvals, c.isApproved);
    }

    function getApprovers() public view returns (address[] memory) {
        return approvers;
    }

    function getUserRole(address user) public view returns (string memory) {
        if (roles[user] == Role.PROCUREMENT) return "PROCUREMENT";
        if (roles[user] == Role.APPROVER) return "APPROVER";
        if (roles[user] == Role.AUDITOR) return "AUDITOR";
        return "NONE";
    }

    function setUserRole(address user, string memory role) public onlyOwner {
        bytes32 r = keccak256(abi.encodePacked(role));

        if (r == keccak256("PROCUREMENT")) roles[user] = Role.PROCUREMENT;
        else if (r == keccak256("APPROVER")) roles[user] = Role.APPROVER;
        else if (r == keccak256("AUDITOR")) roles[user] = Role.AUDITOR;
        else roles[user] = Role.NONE;
    }
}
