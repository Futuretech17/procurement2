// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProcurementApproval {
    address public immutable owner;

    enum Role { NONE, PROCUREMENT, APPROVER, AUDITOR }
    mapping(address => Role) public roles;

    struct ProcurementContract {
        uint256 id;
        string title;
        string description;
        string supplierName;
        address creator;
        uint256 value;
        string fileHash;
        uint256 approvals;
        bool isApproved;
        uint256 lastModified;
        uint256 deliveryDate;
    }

    struct ContractModificationRequest {
        uint256 contractId;
        string newDescription;
        uint256 newValue;
        uint256 newDeliveryDate;
        address submittedBy;
        bool isReviewed;
        bool isApproved;
        uint256 approvals;
    }

    struct AuditLog {
        uint256 timestamp;
        string action;
        address actor;
        string notes;
    }

    uint256 public contractCounter;
    address[] public approvers;

    mapping(uint256 => ProcurementContract) private contractStorage;
    mapping(uint256 => ContractModificationRequest) private modificationRequests;
    mapping(uint256 => bool) private hasPendingModification;
    mapping(uint256 => mapping(address => bool)) public approvedBy;
    mapping(uint256 => mapping(address => bool)) public reviewedBy;
    mapping(uint256 => AuditLog[]) private auditLogs;

    uint256 public constant MAX_VALUE_INCREASE_PERCENT = 10;
    uint256 public constant MAX_MODIFICATION_VALUE_INCREASE_PERCENT = 25;
    uint256 public constant MAX_TIME_EXTENSION_DAYS = 30;

    constructor(address[] memory _approvers, address[] memory _auditors) {
        owner = msg.sender;
        if (roles[msg.sender] == Role.NONE) {
            roles[msg.sender] = Role.PROCUREMENT;
        }

        for (uint256 i = 0; i < _approvers.length; i++) {
            require(roles[_approvers[i]] == Role.NONE, "Approver already assigned");
            roles[_approvers[i]] = Role.APPROVER;
            approvers.push(_approvers[i]);
        }

        for (uint256 i = 0; i < _auditors.length; i++) {
            require(roles[_auditors[i]] == Role.NONE, "Auditor already assigned");
            roles[_auditors[i]] = Role.AUDITOR;
        }
    }

    // ✅ This goes **after** the constructor, not inside it
    function hasModificationRequest(uint256 _contractId) external view returns (bool) {
        return hasPendingModification[_contractId];
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

    modifier onlyAuditor() {
        require(roles[msg.sender] == Role.AUDITOR, "Only auditors allowed");
        _;
    }

    modifier validContract(uint256 _id) {
        require(_id > 0 && _id <= contractCounter, "Contract does not exist");
        _;
    }

    function createContract(
        string memory _title,
        string memory _description,
        string memory _supplierName,
        uint256 _value,
        string memory _fileHash,
        uint256 _deliveryDate
    ) public onlyProcurementOfficer returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");
        require(bytes(_supplierName).length > 0, "Supplier name required");
        require(_value > 0, "Value must be > 0");
        require(bytes(_fileHash).length > 0, "File hash required");
        require(_deliveryDate > block.timestamp, "Delivery must be in future");

        contractCounter++;
        ProcurementContract storage newContract = contractStorage[contractCounter];
        newContract.id = contractCounter;
        newContract.title = _title;
        newContract.description = _description;
        newContract.supplierName = _supplierName;
        newContract.creator = msg.sender;
        newContract.value = _value;
        newContract.fileHash = _fileHash;
        newContract.lastModified = block.timestamp;
        newContract.deliveryDate = _deliveryDate;

        emit ContractCreated(contractCounter, _title, msg.sender);
        _logAudit(contractCounter, "Contract Created", msg.sender, _title);
        return contractCounter;
    }

    function approveContract(uint256 _id) public onlyApprover validContract(_id) {
        ProcurementContract storage c = contractStorage[_id];
        require(!c.isApproved, "Already fully approved");
        require(!approvedBy[_id][msg.sender], "Already approved");

        approvedBy[_id][msg.sender] = true;
        c.approvals++;
        c.lastModified = block.timestamp;

        emit ContractApproved(_id, msg.sender);
        _logAudit(_id, "Contract Approved", msg.sender, "");

        if (c.approvals >= approvers.length) {
            c.isApproved = true;
            emit ContractFullyApproved(_id);
            _logAudit(_id, "Contract Fully Approved", msg.sender, "");
        }
    }

    function modifyContractValue(uint256 _id, uint256 _newValue) public onlyProcurementOfficer validContract(_id) {
        ProcurementContract storage c = contractStorage[_id];
        require(!c.isApproved, "Cannot modify approved contract");

        uint256 maxAllowedValue = c.value + (c.value * MAX_VALUE_INCREASE_PERCENT) / 100;
        require(_newValue <= maxAllowedValue, "Value increase exceeds 10% limit");

        c.value = _newValue;
        c.lastModified = block.timestamp;

        emit ContractModified(_id, _newValue, msg.sender);
        _logAudit(_id, "Direct Value Modified", msg.sender, "Within 10% limit");
    }

    function submitModificationRequest(
        uint256 _contractId,
        string memory _newDescription,
        uint256 _newValue,
        uint256 _newDeliveryDate
    ) public onlyProcurementOfficer validContract(_contractId) {
        require(!hasPendingModification[_contractId], "Pending modification exists");

        ProcurementContract storage c = contractStorage[_contractId];
        require(_newValue <= c.value + (c.value * MAX_MODIFICATION_VALUE_INCREASE_PERCENT) / 100,
            "Value increase exceeds 25% limit");
        require(_newDeliveryDate <= c.deliveryDate + (MAX_TIME_EXTENSION_DAYS * 1 days),
            "Delivery extension exceeds 30 days");

        for (uint256 i = 0; i < approvers.length; i++) {
            reviewedBy[_contractId][approvers[i]] = false;
        }

        modificationRequests[_contractId] = ContractModificationRequest({
            contractId: _contractId,
            newDescription: _newDescription,
            newValue: _newValue,
            newDeliveryDate: _newDeliveryDate,
            submittedBy: msg.sender,
            isReviewed: false,
            isApproved: false,
            approvals: 0
        });

        hasPendingModification[_contractId] = true;
        emit ModificationRequested(_contractId, _newValue, msg.sender);
        _logAudit(_contractId, "Modification Requested", msg.sender, _newDescription);
    }

    function reviewModificationRequest(uint256 _contractId, bool approve) public onlyApprover validContract(_contractId) {
        require(hasPendingModification[_contractId], "No pending modification");
        require(!reviewedBy[_contractId][msg.sender], "Already reviewed");

        reviewedBy[_contractId][msg.sender] = true;
        ContractModificationRequest storage req = modificationRequests[_contractId];
        if (approve) {
            req.approvals++;
        }

        emit ModificationReviewed(_contractId, msg.sender, approve);
        _logAudit(_contractId, "Modification Reviewed", msg.sender, approve ? "Approved" : "Rejected");

        if (req.approvals >= approvers.length) {
            ProcurementContract storage c = contractStorage[_contractId];
            c.description = req.newDescription;
            c.value = req.newValue;
            c.deliveryDate = req.newDeliveryDate;
            c.lastModified = block.timestamp;

            req.isReviewed = true;
            req.isApproved = true;
            hasPendingModification[_contractId] = false;

            emit ModificationApplied(_contractId, req.newValue, msg.sender);
            _logAudit(_contractId, "Modification Applied", msg.sender, "");
        } else if (req.approvals <= approvers.length / 2 && countReviewed(_contractId) == approvers.length) {
            req.isReviewed = true;
            req.isApproved = false;
            hasPendingModification[_contractId] = false;
            emit ModificationRejected(_contractId, msg.sender);
            _logAudit(_contractId, "Modification Rejected", msg.sender, "");
        }
    }

    function countReviewed(uint256 _contractId) internal view returns (uint256 count) {
        for (uint256 i = 0; i < approvers.length; i++) {
            if (reviewedBy[_contractId][approvers[i]]) {
                count++;
            }
        }
    }

    function getAuditLogs(uint256 _contractId) public view onlyAuditor returns (AuditLog[] memory) {
        return auditLogs[_contractId];
    }

    function getContract(uint256 _id) public view validContract(_id) returns (
        uint256, string memory, string memory, string memory,
        address, uint256, string memory, uint256, bool, uint256
    ) {
        ProcurementContract storage c = contractStorage[_id];
        return (c.id, c.title, c.description, c.supplierName, c.creator,
            c.value, c.fileHash, c.approvals, c.isApproved, c.lastModified);
    }

    function getAllContracts() public view returns (ProcurementContract[] memory) {
        ProcurementContract[] memory allContracts = new ProcurementContract[](contractCounter);
        for (uint256 i = 1; i <= contractCounter; i++) {
            allContracts[i - 1] = contractStorage[i];
        }
        return allContracts;
    }

    function getUserRole(address _user) public view returns (Role) {
        return roles[_user];
    }

    function hasApproved(uint256 _contractId, address _user) public view returns (bool) {
        return approvedBy[_contractId][_user];
    }

    function hasReviewed(uint256 _contractId, address _user) public view returns (bool) {
        return reviewedBy[_contractId][_user];
    }

    function isModificationPending(uint256 _contractId) public view returns (bool) {
        return hasPendingModification[_contractId];
    }

    function _logAudit(uint256 _contractId, string memory action, address actor, string memory notes) internal {
        auditLogs[_contractId].push(AuditLog(block.timestamp, action, actor, notes));
    }

    // Events
    event ContractCreated(uint256 id, string title, address indexed creator);
    event ContractApproved(uint256 id, address indexed approver);
    event ContractFullyApproved(uint256 id);
    event ContractModified(uint256 id, uint256 newValue, address indexed modifiedBy);
    event ModificationRequested(uint256 contractId, uint256 newValue, address indexed requestedBy);
    event ModificationReviewed(uint256 contractId, address indexed reviewer, bool approved);
    event ModificationApplied(uint256 contractId, uint256 newValue, address indexed appliedBy);
    event ModificationRejected(uint256 contractId, address indexed rejectedBy);
}
