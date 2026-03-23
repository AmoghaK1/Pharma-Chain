const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const { getContract } = require("../blockchain/contract");

// ─────────────────────────────────────────
// POST /api/batch/create
// Manufacturer registers a new batch
// ─────────────────────────────────────────
router.post("/create", async (req, res) => {
  try {
    const { batchId, manufacturerId } = req.body;

    // Basic validation
    if (!batchId || !manufacturerId) {
      return res.status(400).json({ error: "batchId and manufacturerId are required" });
    }

    // Step 1: Store batch on blockchain
    const contract = await getContract();
    const tx = await contract.createBatch(batchId, manufacturerId);
    await tx.wait(); // Wait for transaction to confirm

    // Step 2: Generate QR code (encodes the batchId)
    const verifyUrl = `http://localhost:5000/api/batch/verify/${batchId}`;
    const qrCodeBase64 = await QRCode.toDataURL(verifyUrl);

    res.status(201).json({
      success: true,
      message: "Batch created on blockchain ✅",
      batchId,
      manufacturerId,
      transactionHash: tx.hash,
      qrCode: qrCodeBase64  // Base64 image — frontend can display directly
    });

  } catch (err) {
    // Catch duplicate batch error from smart contract
    if (err.message.includes("Batch already exists")) {
      return res.status(409).json({ error: "Batch ID already exists on blockchain" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create batch" });
  }
});

// ─────────────────────────────────────────
// GET /api/batch/verify/:batchId
// Consumer scans QR → hits this endpoint
// ─────────────────────────────────────────
router.get("/verify/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;

    const contract = await getContract();
    const [isValid, manufacturerId, timestamp] = await contract.verifyBatch(batchId);

    if (!isValid) {
      return res.status(404).json({
        success: false,
        verdict: "❌ FAKE — Batch not found on blockchain"
      });
    }

    res.status(200).json({
      success: true,
      verdict: "✅ AUTHENTIC",
      batchId,
      manufacturerId,
      registeredAt: new Date(Number(timestamp) * 1000).toLocaleString()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;