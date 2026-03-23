const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { getContract } = require("./blockchain/contract");
const batchRoutes = require("./routes/batch");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/batch", batchRoutes);

// Test route — confirms server is alive
app.get("/", (req, res) => {
  res.json({ message: "PharmaChain backend is running ✅" });
});

// Test blockchain connection on startup
const testBlockchainConnection = async () => {
  try {
    const contract = await getContract();
    console.log("✅ Blockchain connected | Contract:", contract.target);
  } catch (err) {
    console.error("❌ Blockchain connection failed:", err.message);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await testBlockchainConnection();
});