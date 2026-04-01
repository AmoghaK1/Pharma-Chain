const express = require("express");
const router = express.Router();
const { getLabContract } = require("../blockchain/contract");
const Drug = require("../models/Drug");

// POST /api/drug/register
router.post("/register", async (req, res) => {
  try {
    const { drugId, drugName, compositionHash } = req.body;

    if (!drugId || !drugName || !compositionHash) {
      return res.status(400).json({ error: "drugId, drugName and compositionHash are required" });
    }

    const existing = await Drug.findOne({ drugId });
    if (existing) {
      return res.status(409).json({ error: "Drug ID already exists" });
    }

    const contract = getLabContract();
    const tx = await contract.registerDrug(drugId, drugName, compositionHash);
    await tx.wait();

    const newDrug = new Drug({ drugId, drugName, compositionHash,
      labId: "LAB001", transactionHash: tx.hash });
    await newDrug.save();

    res.status(201).json({
      success: true,
      message: "Drug registered on blockchain ✅",
      drugId, drugName, compositionHash,
      transactionHash: tx.hash
    });

  } catch (err) {
    if (err.message.includes("Drug already registered")) {
      return res.status(409).json({ error: "Drug already registered on blockchain" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to register drug" });
  }
});

// GET /api/drug/:drugId
router.get("/:drugId", async (req, res) => {
  try {
    const contract = getLabContract();
    const [labId, drugName, compositionHash, registeredAt, exists] =
      await contract.getDrug(req.params.drugId);

    if (!exists) {
      return res.status(404).json({ success: false, error: "Drug not found" });
    }

    res.status(200).json({
      success: true, drugId: req.params.drugId,
      labId, drugName, compositionHash,
      registeredAt: new Date(Number(registeredAt) * 1000).toLocaleString()
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch drug" });
  }
});

module.exports = router;