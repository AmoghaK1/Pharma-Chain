const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config();

// Load the ABI (the blueprint of your smart contract)
const PharmaChainABI = require(
  path.join(__dirname, "../../../blockchain/artifacts/contracts/PharmaChain.sol/PharmaChain.json")
);

// Connect to your local Hardhat blockchain node
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Use the first Hardhat test account as the signer (who pays gas fees)
const getSigner = async () => {
  const signer = await provider.getSigner(0);
  return signer;
};

// Returns a usable contract instance
const getContract = async () => {
  const signer = await getSigner();
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    PharmaChainABI.abi,
    signer
  );
  return contract;
};

module.exports = { getContract };