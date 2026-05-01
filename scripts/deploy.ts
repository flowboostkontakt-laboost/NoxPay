import hre from "hardhat";
import { parseUnits } from "viem";

async function main() {
  const USDC_ARBITRUM_SEPOLIA = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

  console.log("Deploying NoxPay with underlying:", USDC_ARBITRUM_SEPOLIA);

  const noxPay = await hre.viem.deployContract("NoxPay", [USDC_ARBITRUM_SEPOLIA]);

  console.log("NoxPay deployed to:", noxPay.address);

  // Verify underlying is set correctly
  const underlying = await noxPay.read.underlying();
  console.log("Underlying token:", underlying);

  if (underlying.toLowerCase() !== USDC_ARBITRUM_SEPOLIA.toLowerCase()) {
    throw new Error("Underlying token mismatch!");
  }

  console.log("Deployment verified successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
