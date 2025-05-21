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
        uint value;
        string fileHash;
        uint approvals;
        bool isApproved;
        uint lastModified;
    }

    struct ContractModificationRequest {
        uint contractId;
        string newDescription;
        uint newValue;
        address submittedBy;
        bool isReviewed;
        bool isApproved;
        uint approvals;
    }

    uint public contractCounter;
    mapping(uint => ProcurementContract) private contractStorage;
    mapping(uint => ContractModificationRequest) private modificationRequests;
    mapping(uint => bool) private hasPendingModification;

    mapping(uint => mapping(address => bool)) public approvedBy;
    mapping(uint => mapping(address => bool)) public reviewedBy;

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

    function createContract(
        string memory _title,
        string memory _description,
        uint _value,
        string memory _fileHash
    ) public onlyProcurementOfficer returns (uint) {
        contractCounter++;
        ProcurementContract storage newContract = contractStorage[contractCounter];
        newContract.id = contractCounter;
        newContract.title = _title;
        newContract.description = _description;
        newContract.creator = msg.sender;
        newContract.value = _value;
        newContract.fileHash = _fileHash;
        newContract.isApproved = false;
        newContract.lastModified = block.timestamp;

        emit ContractCreated(contractCounter, _title, msg.sender);
        return contractCounter;
    }

    function approveContract(uint _id) public onlyApprover {
        ProcurementContract storage c = contractStorage[_id];
        require(!c.isApproved, "Contract already fully approved.");
        require(!approvedBy[_id][msg.sender], "You have already approved this contract.");

        approvedBy[_id][msg.sender] = true;
        c.approvals++;
        c.lastModified = block.timestamp;

        if (c.approvals >= approvers.length) {
            c.isApproved = true;
        }
    }

    function modifyContractValue(uint _id, uint _newValue) public onlyProcurementOfficer {
        ProcurementContract storage c = contractStorage[_id];
        require(!c.isApproved, "Approved contracts cannot be modified.");
        require(_newValue <= c.value * 110 / 100, "Value increase exceeds allowed threshold (10%).");

        c.value = _newValue;
        c.lastModified = block.timestamp;

        emit ContractModified(_id, _newValue, msg.sender);
    }

    function submitModificationRequest(
        uint _contractId,
        string memory _newDescription,
        uint _newValue
    ) public onlyProcurementOfficer {
        require(!hasPendingModification[_contractId], "Pending modification already exists.");

        ProcurementContract storage c = contractStorage[_contractId];
        require(c.id != 0, "Contract does not exist.");
        require(_newValue <= c.value * 125 / 100, "New value exceeds 25% allowed limit.");

        ContractModificationRequest storage req = modificationRequests[_contractId];
        req.contractId = _contractId;
        req.newDescription = _newDescription;
        req.newValue = _newValue;
        req.submittedBy = msg.sender;
        req.isReviewed = false;
        req.isApproved = false;
        req.approvals = 0;
        hasPendingModification[_contractId] = true;

        emit ModificationRequested(_contractId, _newValue, msg.sender);
    }

    function reviewModificationRequest(uint _contractId, bool approve) public onlyApprover {
        ContractModificationRequest storage req = modificationRequests[_contractId];
        require(hasPendingModification[_contractId], "No pending modification.");
        require(!reviewedBy[_contractId][msg.sender], "Already reviewed by this approver.");

        reviewedBy[_contractId][msg.sender] = true;
        if (approve) {
            req.approvals++;
        }

        if (req.approvals >= approvers.length) {
            req.isReviewed = true;
            req.isApproved = true;

            ProcurementContract storage c = contractStorage[_contractId];
            c.description = req.newDescription;
            c.value = req.newValue;
            c.lastModified = block.timestamp;

            hasPendingModification[_contractId] = false;

            emit ModificationApplied(_contractId, req.newValue, msg.sender);
        }

        emit ModificationReviewed(_contractId, msg.sender, approve);
    }

    function getContract(uint _id) public view returns (
        uint id,
        string memory title,
        string memory description,
        address creator,
        uint value,
        string memory fileHash,
        uint approvals,
        bool isApproved,
        uint lastModified
    ) {
        ProcurementContract storage c = contractStorage[_id];
        return (c.id, c.title, c.description, c.creator, c.value, c.fileHash, c.approvals, c.isApproved, c.lastModified);
    }

    // ✅ NEW FUNCTION 1: Return all contracts
    function getAllContracts() public view returns (ProcurementContract[] memory) {
        ProcurementContract[] memory allContracts = new ProcurementContract[](contractCounter);
        for (uint i = 1; i <= contractCounter; i++) {
            allContracts[i - 1] = contractStorage[i];
        }
        return allContracts;
    }

    // ✅ NEW FUNCTION 2: Check if a specific user approved a contract
    function hasApproved(uint _id, address _user) public view returns (bool) {
        return approvedBy[_id][_user];
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

    // 🔹 Events for Audit Trail
    event ContractCreated(uint contractId, string title, address creator);
    event ContractModified(uint contractId, uint newValue, address modifiedBy);
    event ModificationRequested(uint contractId, uint proposedValue, address submittedBy);
    event ModificationReviewed(uint contractId, address reviewedBy, bool approved);
    event ModificationApplied(uint contractId, uint newValue, address appliedBy);
}
