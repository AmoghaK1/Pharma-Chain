const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config();

const abi = require(
  path.join(__dirname, "../../../blockchain/artifacts/contracts/PharmaChain.sol/PharmaChain.json")
).abi;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL, {
  chainId: 31337,
  name: "hardhat"
});

const roleSpecs = [
  { role: 1, address: process.env.LAB_ADDRESS, id: "LAB001", label: "LAB" },
  { role: 2, address: process.env.MANUFACTURER_ADDRESS, id: "MFR001", label: "MANUFACTURER" },
  { role: 3, address: process.env.DISTRIBUTOR_ADDRESS, id: "DST001", label: "DISTRIBUTOR" },
  { role: 4, address: process.env.RETAILER_ADDRESS, id: "RTL001", label: "RETAILER" }
];

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS is missing in backend/.env");
  }

  const adminKey = process.env.ADMIN_PRIVATE_KEY;
  if (!adminKey) {
    throw new Error("ADMIN_PRIVATE_KEY is missing in backend/.env");
  }

  const adminWallet = new ethers.Wallet(adminKey, provider);
  const contract = new ethers.Contract(contractAddress, abi, adminWallet);

  for (const spec of roleSpecs) {
    if (!spec.address) {
      throw new Error(`${spec.label}_ADDRESS is missing in backend/.env`);
    }

    const currentRole = Number(await contract.getRole(spec.address));
    if (currentRole === spec.role) {
      console.log(`Skipping ${spec.label}: already role ${spec.role}`);
      continue;
    }

    const tx = await contract.assignRole(spec.address, spec.role, spec.id);
    await tx.wait();
    console.log(`Assigned ${spec.label} (${spec.address}) -> role ${spec.role} | tx ${tx.hash}`);
  }

  console.log("Role bootstrap complete.");
}

main().catch((err) => {
  console.error("Role bootstrap failed:", err.message);
  process.exit(1);
});
