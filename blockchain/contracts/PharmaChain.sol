// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PharmaChain {

    // ─────────────────────────────────────────
    // ENUMS & STRUCTS
    // ─────────────────────────────────────────

    enum Role { None, Lab, Manufacturer, Distributor, Retailer }

    enum BatchStatus { 
        Created,       // Manufacturer just created it
        WithDistributor, 
        WithRetailer,
        Sold           // Consumer purchased
    }

    struct Drug {
        string drugId;
        string labId;
        string drugName;
        string compositionHash; // hash of formula (integrity check)
        uint256 registeredAt;
        bool exists;
    }

    struct TransferEvent {
        string   action;      // "CREATED" | "TRANSFERRED" | "RECEIVED"
        address  by;
        string   byId;        // human-readable ID
        Role     role;
        uint256  timestamp;
    }

    struct Batch {
        string      batchId;
        string      drugId;
        string      manufacturerId;
        string      drugName;
        string      expiryDate;
        BatchStatus status;
        address     currentOwner;
        bool        exists;
    }

    // ─────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────

    mapping(string => Drug)              private drugs;
    mapping(string => Batch)             private batches;
    mapping(string => TransferEvent[])   private batchHistory;
    mapping(address => Role)             private roles;
    mapping(address => string)           private entityIds; // address → human ID

    address public owner; // contract deployer (admin)

    // ─────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────

    event DrugRegistered(string drugId, string labId, uint256 timestamp);
    event BatchCreated(string batchId, string drugId, string manufacturerId, uint256 timestamp);
    event OwnershipTransferred(string batchId, address from, address to, uint256 timestamp);
    event RoleAssigned(address entity, Role role, string entityId);

    // ─────────────────────────────────────────
    // MODIFIERS
    // ─────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Only admin");
        _;
    }

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Unauthorized role");
        _;
    }

    modifier batchExists(string memory batchId) {
        require(batches[batchId].exists, "Batch not found");
        _;
    }

    // ─────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─────────────────────────────────────────
    // ROLE MANAGEMENT (Admin only)
    // ─────────────────────────────────────────

    function assignRole(
        address entity,
        Role role,
        string memory entityId
    ) public onlyOwner {
        roles[entity]     = role;
        entityIds[entity] = entityId;
        emit RoleAssigned(entity, role, entityId);
    }

    function getRole(address entity) public view returns (Role) {
        return roles[entity];
    }

    // ─────────────────────────────────────────
    // RESEARCH LAB — Register Drug
    // ─────────────────────────────────────────

    function registerDrug(
        string memory drugId,
        string memory drugName,
        string memory compositionHash
    ) public onlyRole(Role.Lab) {
        require(!drugs[drugId].exists, "Drug already registered");

        drugs[drugId] = Drug({
            drugId:          drugId,
            labId:           entityIds[msg.sender],
            drugName:        drugName,
            compositionHash: compositionHash,
            registeredAt:    block.timestamp,
            exists:          true
        });

        emit DrugRegistered(drugId, entityIds[msg.sender], block.timestamp);
    }

    function getDrug(string memory drugId) public view returns (
        string memory labId,
        string memory drugName,
        string memory compositionHash,
        uint256 registeredAt,
        bool exists
    ) {
        Drug memory d = drugs[drugId];
        return (d.labId, d.drugName, d.compositionHash, d.registeredAt, d.exists);
    }

    // ─────────────────────────────────────────
    // MANUFACTURER — Create Batch (must link to valid Drug)
    // ─────────────────────────────────────────

    function createBatch(
        string memory batchId,
        string memory drugId,
        string memory expiryDate
    ) public onlyRole(Role.Manufacturer) {
        require(!batches[batchId].exists, "Batch already exists");
        require(drugs[drugId].exists,     "Drug not registered by any lab");

        string memory mfrId   = entityIds[msg.sender];
        string memory drgName = drugs[drugId].drugName;

        batches[batchId] = Batch({
            batchId:        batchId,
            drugId:         drugId,
            manufacturerId: mfrId,
            drugName:       drgName,
            expiryDate:     expiryDate,
            status:         BatchStatus.Created,
            currentOwner:   msg.sender,
            exists:         true
        });

        batchHistory[batchId].push(TransferEvent({
            action:    "CREATED",
            by:        msg.sender,
            byId:      mfrId,
            role:      Role.Manufacturer,
            timestamp: block.timestamp
        }));

        emit BatchCreated(batchId, drugId, mfrId, block.timestamp);
    }

    // ─────────────────────────────────────────
    // SUPPLY CHAIN — Transfer Ownership
    // Manufacturer → Distributor → Retailer
    // ─────────────────────────────────────────

    function transferOwnership(
        string memory batchId,
        address newOwner
    ) public batchExists(batchId) {
        Batch storage b = batches[batchId];
        require(b.currentOwner == msg.sender, "You don't own this batch");

        Role newRole = roles[newOwner];
        require(
            newRole == Role.Distributor || newRole == Role.Retailer,
            "Can only transfer to Distributor or Retailer"
        );

        // Update status based on who receives it
        if (newRole == Role.Distributor) {
            b.status = BatchStatus.WithDistributor;
        } else if (newRole == Role.Retailer) {
            b.status = BatchStatus.WithRetailer;
        }

        b.currentOwner = newOwner;

        batchHistory[batchId].push(TransferEvent({
            action:    "TRANSFERRED",
            by:        msg.sender,
            byId:      entityIds[msg.sender],
            role:      roles[msg.sender],
            timestamp: block.timestamp
        }));

        batchHistory[batchId].push(TransferEvent({
            action:    "RECEIVED",
            by:        newOwner,
            byId:      entityIds[newOwner],
            role:      newRole,
            timestamp: block.timestamp
        }));

        emit OwnershipTransferred(batchId, msg.sender, newOwner, block.timestamp);
    }

    // ─────────────────────────────────────────
    // CONSUMER — Verify + Get Full History
    // ─────────────────────────────────────────

    function verifyBatch(string memory batchId) public view returns (
        bool        isValid,
        string memory manufacturerId,
        string memory drugName,
        string memory expiryDate,
        string memory drugId,
        uint8         status        // BatchStatus as uint
    ) {
        Batch memory b = batches[batchId];
        return (
            b.exists,
            b.manufacturerId,
            b.drugName,
            b.expiryDate,
            b.drugId,
            uint8(b.status)
        );
    }

    function getBatchHistory(string memory batchId)
        public
        view
        batchExists(batchId)
        returns (
            string[]  memory actions,
            string[]  memory byIds,
            uint8[]   memory roleIds,
            uint256[] memory timestamps
        )
    {
        TransferEvent[] memory history = batchHistory[batchId];
        uint len = history.length;

        actions    = new string[](len);
        byIds      = new string[](len);
        roleIds    = new uint8[](len);
        timestamps = new uint256[](len);

        for (uint i = 0; i < len; i++) {
            actions[i]    = history[i].action;
            byIds[i]      = history[i].byId;
            roleIds[i]    = uint8(history[i].role);
            timestamps[i] = history[i].timestamp;
        }

        return (actions, byIds, roleIds, timestamps);
    }
}