// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PharmaChain {

    struct Batch {
        string batchId;
        string manufacturerId;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Batch) private batches;

    event BatchCreated(string batchId, string manufacturerId, uint256 timestamp);

    // Manufacturer calls this to register a batch
    function createBatch(string memory batchId, string memory manufacturerId) public {
        require(!batches[batchId].exists, "Batch already exists");

        batches[batchId] = Batch({
            batchId: batchId,
            manufacturerId: manufacturerId,
            timestamp: block.timestamp,
            exists: true
        });

        emit BatchCreated(batchId, manufacturerId, block.timestamp);
    }

    // Consumer/backend calls this to verify
    function verifyBatch(string memory batchId) public view returns (
        bool isValid,
        string memory manufacturerId,
        uint256 timestamp
    ) {
        Batch memory b = batches[batchId];
        return (b.exists, b.manufacturerId, b.timestamp);
    }
}