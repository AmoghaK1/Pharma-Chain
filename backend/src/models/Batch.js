const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true
  },
  manufacturerId: {
    type: String,
    required: true
  },
  drugName: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  transactionHash: {
    type: String,  // Proof that this batch exists on blockchain
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Batch", batchSchema);