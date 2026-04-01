const mongoose = require("mongoose");

const drugSchema = new mongoose.Schema({
  drugId:          { type: String, required: true, unique: true },
  labId:           { type: String, required: true },
  drugName:        { type: String, required: true },
  compositionHash: { type: String, required: true },
  transactionHash: { type: String },
  registeredAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model("Drug", drugSchema);