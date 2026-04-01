const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config();

const PharmaChainABI = require(
  path.join(__dirname, "../../../blockchain/artifacts/contracts/PharmaChain.sol/PharmaChain.json")
);

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL, {
  chainId: 31337,
  name: "hardhat"
});

const getConfiguredContractAddress = () => {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) {
    throw new Error("CONTRACT_ADDRESS is missing in backend/.env");
  }
  return address;
};

const assertContractDeployed = async () => {
  const address = getConfiguredContractAddress();
  const code = await provider.getCode(address);
  if (code === "0x") {
    throw new Error(
      `No contract bytecode found at CONTRACT_ADDRESS ${address}. Deploy PharmaChain and update backend/.env.`
    );
  }
};


// Returns contract signed by a specific private key
const getContractAs = (privateKey) => {
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(
    getConfiguredContractAddress(),
    PharmaChainABI.abi,
    wallet
  );
};

// Convenience getters per role
const getAdminContract        = () => getContractAs(process.env.ADMIN_PRIVATE_KEY);
const getLabContract          = () => getContractAs(process.env.LAB_PRIVATE_KEY);
const getManufacturerContract = () => getContractAs(process.env.MANUFACTURER_PRIVATE_KEY);
const getDistributorContract  = () => getContractAs(process.env.DISTRIBUTOR_PRIVATE_KEY);
const getRetailerContract     = () => getContractAs(process.env.RETAILER_PRIVATE_KEY);

// Read-only contract (for verify/history — no signer needed)
const getReadContract = () => {
  return new ethers.Contract(
    getConfiguredContractAddress(),
    PharmaChainABI.abi,
    provider
  );
};

module.exports = {
  getAdminContract,
  getLabContract,
  getManufacturerContract,
  getDistributorContract,
  getRetailerContract,
  getReadContract,
  assertContractDeployed
};