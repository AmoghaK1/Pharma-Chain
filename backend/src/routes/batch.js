const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const { getContract } = require("../blockchain/contract");
const Batch = require("../models/Batch"); // 👈 ADD THIS

// ─────────────────────────────────────────
// POST /api/batch/create
// ─────────────────────────────────────────
router.post("/create", async (req, res) => {
  try {
    const { batchId, manufacturerId, drugName, expiryDate } = req.body;

    if (!batchId || !manufacturerId || !drugName || !expiryDate) {
      return res.status(400).json({ 
        error: "batchId, manufacturerId, drugName and expiryDate are required" 
      });
    }

    // Step 1: Check if batch already exists in MongoDB
    const existing = await Batch.findOne({ batchId });
    if (existing) {
      return res.status(409).json({ error: "Batch ID already exists" });
    }

    // Step 2: Store on blockchain first (source of truth)
    const contract = await getContract();
    const tx = await contract.createBatch(batchId, manufacturerId);
    await tx.wait();

    // Step 3: Store metadata in MongoDB
    const newBatch = new Batch({
      batchId,
      manufacturerId,
      drugName,
      expiryDate,
      transactionHash: tx.hash
    });
    await newBatch.save();

    // Step 4: Generate QR code
    const verifyUrl = `http://localhost:5000/api/batch/verify/${batchId}`;
    const qrCodeBase64 = await QRCode.toDataURL(verifyUrl);

    res.status(201).json({
      success: true,
      message: "Batch created ✅",
      batchId,
      manufacturerId,
      drugName,
      expiryDate,
      transactionHash: tx.hash,
      qrCode: qrCodeBase64
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create batch" });
  }
});

// ─────────────────────────────────────────
// GET /api/batch/verify/:batchId
// ─────────────────────────────────────────
router.get("/verify/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;

    // Step 1: Check blockchain (source of truth)
    const contract = await getContract();
    const [isValid, manufacturerId, timestamp] = await contract.verifyBatch(batchId);

    if (!isValid) {
      return res.status(404).json({
        success: false,
        verdict: "❌ FAKE — Batch not found on blockchain"
      });
    }

    // Step 2: Fetch extra metadata from MongoDB
    const batchMeta = await Batch.findOne({ batchId });

    res.status(200).json({
      success: true,
      verdict: "✅ AUTHENTIC",
      batchId,
      manufacturerId,
      drugName: batchMeta?.drugName || "N/A",
      expiryDate: batchMeta?.expiryDate || "N/A",
      transactionHash: batchMeta?.transactionHash || "N/A",
      registeredAt: new Date(Number(timestamp) * 1000).toLocaleString()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// GET /api/batch/qr/:batchId
router.get("/qr/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;
    const verifyUrl = `http://localhost:5000/api/batch/verify/${batchId}`;
    res.setHeader("Content-Type", "image/png");
    QRCode.toFileStream(res, verifyUrl);
  } catch (err) {
    res.status(500).json({ error: "QR generation failed" });
  }
});

module.exports = router;