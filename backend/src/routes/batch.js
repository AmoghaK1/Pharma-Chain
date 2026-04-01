const express = require("express");
const router  = express.Router();
const QRCode  = require("qrcode");
const {
  getManufacturerContract,
  getDistributorContract,
  getRetailerContract,
  getReadContract
} = require("../blockchain/contract");
const Batch = require("../models/Batch");

const STATUS_LABELS = ["Created", "With Distributor", "With Retailer", "Sold"];
const ROLE_LABELS   = ["None", "Lab", "Manufacturer", "Distributor", "Retailer"];

// POST /api/batch/create  (Manufacturer)
router.post("/create", async (req, res) => {
  try {
    const { batchId, drugId, expiryDate } = req.body;
    if (!batchId || !drugId || !expiryDate) {
      return res.status(400).json({ error: "batchId, drugId and expiryDate required" });
    }

    const existing = await Batch.findOne({ batchId });
    if (existing) return res.status(409).json({ error: "Batch ID already exists" });

    const contract = getManufacturerContract();
    const tx = await contract.createBatch(batchId, drugId, expiryDate);
    await tx.wait();

    // Fetch drug name from blockchain for MongoDB
    const readContract = getReadContract();
    const [,drugName] = await readContract.getDrug(drugId);

    const newBatch = new Batch({
      batchId, drugId, expiryDate, drugName,
      manufacturerId: "MFR001",
      transactionHash: tx.hash
    });
    await newBatch.save();

    const qrCode = await QRCode.toDataURL(
      `http://localhost:5000/api/batch/verify/${batchId}`
    );

    res.status(201).json({
      success: true, message: "Batch created ✅",
      batchId, drugId, drugName, expiryDate,
      transactionHash: tx.hash, qrCode
    });

  } catch (err) {
    if (err.reason === "Unauthorized role" || err.message.includes("Unauthorized role")) {
      return res.status(403).json({
        error: "Manufacturer role not assigned for configured MANUFACTURER_ADDRESS. Run role assignment after each fresh contract deploy."
      });
    }
    if (err.code === "BAD_DATA") {
      return res.status(500).json({
        error: "Blockchain contract call returned empty data. Check CONTRACT_ADDRESS and deployed network."
      });
    }
    if (err.message.includes("Drug not registered")) {
      return res.status(400).json({ error: "Drug ID not registered by any lab" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create batch" });
  }
});

// POST /api/batch/transfer  (Distributor or Retailer)
router.post("/transfer", async (req, res) => {
  try {
    const { batchId, transferTo } = req.body;
    // transferTo: "distributor" or "retailer"

    if (!batchId || !transferTo) {
      return res.status(400).json({ error: "batchId and transferTo required" });
    }

    const TARGET_MAP = {
      distributor: process.env.DISTRIBUTOR_ADDRESS,
      retailer:    process.env.RETAILER_ADDRESS
    };

    const targetAddress = TARGET_MAP[transferTo];
    if (!targetAddress) {
      return res.status(400).json({ error: "transferTo must be 'distributor' or 'retailer'" });
    }

    // Determine who is transferring (current owner)
    // Simple logic: if transferring TO distributor → manufacturer signs
    //               if transferring TO retailer    → distributor signs
    const contract = transferTo === "distributor"
      ? getManufacturerContract()
      : getDistributorContract();

    const tx = await contract.transferOwnership(batchId, targetAddress);
    await tx.wait();

    res.status(200).json({
      success: true,
      message: `Batch transferred to ${transferTo} ✅`,
      batchId, transferTo,
      transactionHash: tx.hash
    });

  } catch (err) {
    if (err.reason === "Unauthorized role" || err.message.includes("Unauthorized role")) {
      return res.status(403).json({
        error: "Required role is missing for current signer. Ensure Manufacturer/Distributor roles are assigned on this deployment."
      });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/batch/verify/:batchId  (Consumer)
router.get("/verify/:batchId", async (req, res) => {
  try {
    const contract = getReadContract();
    const [isValid, manufacturerId, drugName, expiryDate, drugId, statusCode] =
      await contract.verifyBatch(req.params.batchId);

    if (!isValid) {
      return res.status(404).json({
        success: false,
        verdict: "❌ FAKE — Batch not found on blockchain"
      });
    }

    const batchMeta = await Batch.findOne({ batchId: req.params.batchId });

    res.status(200).json({
      success: true,
      verdict: "✅ AUTHENTIC",
      batchId: req.params.batchId,
      manufacturerId, drugName, expiryDate, drugId,
      status: STATUS_LABELS[statusCode] || "Unknown",
      transactionHash: batchMeta?.transactionHash || "N/A"
    });

  } catch (err) {
    if (err.code === "BAD_DATA") {
      return res.status(500).json({
        error: "Blockchain contract call returned empty data. Check CONTRACT_ADDRESS and deployed network."
      });
    }
    res.status(500).json({ error: "Verification failed" });
  }
});

// GET /api/batch/history/:batchId  (Full supply chain journey)
router.get("/history/:batchId", async (req, res) => {
  try {
    const contract = getReadContract();
    const [actions, byIds, roleIds, timestamps] =
      await contract.getBatchHistory(req.params.batchId);

    const history = actions.map((action, i) => ({
      action,
      by:        byIds[i],
      role:      ROLE_LABELS[roleIds[i]],
      timestamp: new Date(Number(timestamps[i]) * 1000).toLocaleString()
    }));

    res.status(200).json({
      success: true,
      batchId: req.params.batchId,
      history
    });

  } catch (err) {
    if (err.code === "BAD_DATA") {
      return res.status(500).json({
        error: "Blockchain contract call returned empty data. Check CONTRACT_ADDRESS and deployed network."
      });
    }
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// GET /api/batch/qr/:batchId
router.get("/qr/:batchId", async (req, res) => {
  try {
    const verifyUrl = `http://localhost:5000/api/batch/verify/${req.params.batchId}`;
    res.setHeader("Content-Type", "image/png");
    QRCode.toFileStream(res, verifyUrl);
  } catch (err) {
    res.status(500).json({ error: "QR generation failed" });
  }
});

module.exports = router;