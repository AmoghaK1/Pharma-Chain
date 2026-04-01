const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");          // 👈 ADD THIS
const { getAdminContract } = require("../blockchain/contract");
require("dotenv").config();

const ROLE_MAP = {
  lab:          1,
  manufacturer: 2,
  distributor:  3,
  retailer:     4
};

const ADDRESS_MAP = {
  lab:          process.env.LAB_ADDRESS,
  manufacturer: process.env.MANUFACTURER_ADDRESS,
  distributor:  process.env.DISTRIBUTOR_ADDRESS,
  retailer:     process.env.RETAILER_ADDRESS
};

router.post("/assign-role", async (req, res) => {
  try {
    const { role, entityId } = req.body;

    if (!ROLE_MAP[role]) {
      return res.status(400).json({ error: "Invalid role. Use: lab, manufacturer, distributor, retailer" });
    }

    const contract = getAdminContract();
    const tx = await contract.assignRole(
      ethers.getAddress(ADDRESS_MAP[role]),  // 👈 THIS IS THE FIX
      ROLE_MAP[role],
      entityId
    );
    await tx.wait();

    res.status(200).json({
      success: true,
      message: `Role '${role}' assigned to ${entityId} ✅`,
      address: ADDRESS_MAP[role],
      transactionHash: tx.hash
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;