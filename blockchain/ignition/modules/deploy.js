const hre = require("hardhat");

async function main() {
  const PharmaChain = await hre.ethers.getContractFactory("PharmaChain");
  const pharmaChain = await PharmaChain.deploy();
  await pharmaChain.waitForDeployment();

  console.log("✅ PharmaChain deployed to:", await pharmaChain.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});