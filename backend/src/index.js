const express     = require("express");
const cors        = require("cors");
const dotenv      = require("dotenv");
const connectDB   = require("./db/connection");
const { getReadContract, assertContractDeployed } = require("./blockchain/contract");
const batchRoutes = require("./routes/batch");
const drugRoutes  = require("./routes/drug");    // 👈 NEW
const adminRoutes = require("./routes/admin");   // 👈 NEW

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/batch", batchRoutes);
app.use("/api/drug",  drugRoutes);   // 👈 NEW
app.use("/api/admin", adminRoutes);  // 👈 NEW

app.get("/", (req, res) => res.json({ message: "PharmaChain backend running ✅" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await connectDB();
  try {
    await assertContractDeployed();
    const contract = getReadContract();
    console.log("✅ Blockchain connected | Contract:", contract.target);
  } catch (err) {
    console.error("❌ Blockchain connection failed:", err.message);
    console.error("➡️  Start hardhat node + redeploy contract, then update backend/.env CONTRACT_ADDRESS.");
  }
});
