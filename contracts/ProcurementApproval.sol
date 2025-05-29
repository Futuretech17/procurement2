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
        string supplierName;
        address creator;
        uint value;
        string fileHash;
        uint approvals;
        bool isApproved;
        uint lastModified;
        uint deliveryDate;
    }

    struct ContractModificationRequest {
        uint contractId;
        string newDescription;
        uint newValue;
        uint newDeliveryDate;
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

    uint256 public constant MAX_VALUE_INCREASE_PERCENT = 10;
    uint256 public constant MAX_MODIFICATION_VALUE_INCREASE_PERCENT = 25;
    uint256 public constant MAX_TIME_EXTENSION_DAYS = 30;

    constructor(address[] memory _approvers) {
        owner = msg.sender;
        roles[msg.sender] = Role.PROCUREMENT;

        approvers = _approvers;
        for (uint i = 0; i < _approvers.length; i++) {
            roles[_approvers[i]] = Role.APPROVER;
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner allowed");
        _;
    }

    modifier onlyApprover() {
        require(roles[msg.sender] == Role.APPROVER, "Only approvers allowed");
        _;
    }

    modifier onlyProcurementOfficer() {
        require(roles[msg.sender] == Role.PROCUREMENT, "Only procurement officers allowed");
        _;
    }

    function createContract(
        string memory _title,
        string memory _description,
        string memory _supplierName,
        uint _value,
        string memory _fileHash,
        uint _deliveryDate
    ) public onlyProcurementOfficer returns (uint) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");
        require(bytes(_supplierName).length > 0, "Supplier name required");
        require(_value > 0, "Value must be > 0");
        require(bytes(_fileHash).length > 0, "File hash required");
        require(_deliveryDate > block.timestamp, "Delivery date must be future");

        contractCounter++;
        ProcurementContract storage newContract = contractStorage[contractCounter];
        newContract.id = contractCounter;
        newContract.title = _title;
        newContract.description = _description;
        newContract.supplierName = _supplierName;
        newContract.creator = msg.sender;
        newContract.value = _value;
        newContract.fileHash = _fileHash;
        newContract.isApproved = false;
        newContract.lastModified = block.timestamp;
        newContract.deliveryDate = _deliveryDate;

        emit ContractCreated(contractCounter, _title, msg.sender);
        return contractCounter;
    }

    function approveContract(uint _id) public onlyApprover {
        require(_id > 0 && _id <= contractCounter, "Contract does not exist");
        ProcurementContract storage c = contractStorage[_id];
        require(!c.isApproved, "Already fully approved");
        require(!approvedBy[_id][msg.sender], "Already approved by you");

        approvedBy[_id][msg.sender] = true;
        c.approvals++;
        c.lastModified = block.timestamp;

        emit ContractApproved(_id, msg.sender);

        if (c.approvals >= approvers.length) {
            c.isApproved = true;
            emit ContractFullyApproved(_id);
        }
    }

    function modifyContractValue(uint _id, uint _newValue) public onlyProcurementOfficer {
        require(_id > 0 && _id <= contractCounter, "Contract does not exist");
        ProcurementContract storage c = contractStorage[_id];
        require(!c.isApproved, "Cannot modify approved contract");

        uint maxAllowedValue = c.value + (c.value * MAX_VALUE_INCREASE_PERCENT) / 100;
        if (_newValue > maxAllowedValue) {
            emit UnauthorizedModificationAttempt(msg.sender, _id, "Value increase exceeds 10% limit");
            revert("Value increase exceeds 10% limit");
        }

        c.value = _newValue;
        c.lastModified = block.timestamp;

        emit ContractModified(_id, _newValue, msg.sender);
    }

    function submitModificationRequest(
        uint _contractId,
        string memory _newDescription,
        uint _newValue,
        uint _newDeliveryDate
    ) public onlyProcurementOfficer {
        require(_contractId > 0 && _contractId <= contractCounter, "Contract does not exist");
        require(!hasPendingModification[_contractId], "Pending modification exists");

        ProcurementContract storage c = contractStorage[_contractId];

        uint maxAllowedValue = c.value + (c.value * MAX_MODIFICATION_VALUE_INCREASE_PERCENT) / 100;

        if (_newValue > maxAllowedValue) {
            emit UnauthorizedModificationAttempt(msg.sender, _contractId, "Modification request value increase exceeds 25% limit");
            revert("Value increase exceeds 25% limit");
        }

        if (_newDeliveryDate > c.deliveryDate + (MAX_TIME_EXTENSION_DAYS * 1 days)) {
            emit UnauthorizedModificationAttempt(msg.sender, _contractId, "Modification request delivery date extension exceeds 30 days");
            revert("Delivery date extension exceeds 30 days");
        }

        for (uint i = 0; i < approvers.length; i++) {
            reviewedBy[_contractId][approvers[i]] = false;
        }

        ContractModificationRequest storage req = modificationRequests[_contractId];
        req.contractId = _contractId;
        req.newDescription = _newDescription;
        req.newValue = _newValue;
        req.newDeliveryDate = _newDeliveryDate;
        req.submittedBy = msg.sender;
        req.isReviewed = false;
        req.isApproved = false;
        req.approvals = 0;

        hasPendingModification[_contractId] = true;

        emit ModificationRequested(_contractId, _newValue, msg.sender);
    }

    function reviewModificationRequest(uint _contractId, bool approve) public onlyApprover {
        require(_contractId > 0 && _contractId <= contractCounter, "Contract does not exist");
        require(hasPendingModification[_contractId], "No pending modification");
        require(!reviewedBy[_contractId][msg.sender], "Already reviewed");

        reviewedBy[_contractId][msg.sender] = true;

        ContractModificationRequest storage req = modificationRequests[_contractId];
        if (approve) {
            req.approvals++;
        }

        emit ModificationReviewed(_contractId, msg.sender, approve);

        if (req.approvals >= approvers.length) {
            req.isReviewed = true;
            req.isApproved = true;

            ProcurementContract storage c = contractStorage[_contractId];
            c.description = req.newDescription;
            c.value = req.newValue;
            c.deliveryDate = req.newDeliveryDate;
            c.lastModified = block.timestamp;

            hasPendingModification[_contractId] = false;

            emit ModificationApplied(_contractId, req.newValue, msg.sender);
        }
    }

    function rejectModificationRequest(uint _contractId) public onlyApprover {
        require(_contractId > 0 && _contractId <= contractCounter, "Contract does not exist");
        require(hasPendingModification[_contractId], "No pending modification");
        require(!reviewedBy[_contractId][msg.sender], "Already reviewed");

        reviewedBy[_contractId][msg.sender] = true;

        ContractModificationRequest storage req = modificationRequests[_contractId];

        emit ModificationReviewed(_contractId, msg.sender, false);

        uint reviewedCount = countReviewed(_contractId);
        uint approversCount = approvers.length;

        if (req.approvals * 2 <= approversCount && reviewedCount == approversCount) {
            hasPendingModification[_contractId] = false;
            req.isReviewed = true;
            req.isApproved = false;

            emit ModificationRejected(_contractId, msg.sender);
        }
    }

    function countReviewed(uint _contractId) internal view returns (uint count) {
        for (uint i = 0; i < approvers.length; i++) {
            if (reviewedBy[_contractId][approvers[i]]) {
                count++;
            }
        }
        return count;
    }

    // Main getter for frontend - returns 10 fields as expected
    function getContract(uint _id) public view returns (
        uint id,
        string memory title,
        string memory description,
        string memory supplierName,
        address creator,
        uint value,
        string memory fileHash,
        uint approvals,
        bool isApproved,
        uint lastModified
    ) {
        require(_id > 0 && _id <= contractCounter, "Contract does not exist");
        ProcurementContract storage c = contractStorage[_id];
        return (
            c.id,
            c.title,
            c.description,
            c.supplierName,
            c.creator,
            c.value,
            c.fileHash,
            c.approvals,
            c.isApproved,
            c.lastModified
        );
    }

    // Additional getter for delivery date if needed
    function getDeliveryDate(uint _id) public view returns (uint) {
        require(_id > 0 && _id <= contractCounter, "Contract does not exist");
        return contractStorage[_id].deliveryDate;
    }

    function getAllContracts() public view returns (ProcurementContract[] memory) {
        ProcurementContract[] memory allContracts = new ProcurementContract[](contractCounter);
        for (uint i = 1; i <= contractCounter; i++) {
            allContracts[i - 1] = contractStorage[i];
        }
        return allContracts;
    }

    // Role management
    function assignRole(address _addr, Role _role) public onlyOwner {
        roles[_addr] = _role;
    }

    // Events
    event ContractCreated(uint id, string title, address creator);
    event ContractApproved(uint id, address approver);
    event ContractFullyApproved(uint id);
    event ContractModified(uint id, uint newValue, address modifiedBy);
    event UnauthorizedModificationAttempt(address indexed by, uint indexed contractId, string reason);
    event ModificationRequested(uint contractId, uint newValue, address requestedBy);
    event ModificationReviewed(uint contractId, address reviewer, bool approved);
    event ModificationApplied(uint contractId, uint newValue, address appliedBy);
    event ModificationRejected(uint contractId, address rejectedBy);
}
