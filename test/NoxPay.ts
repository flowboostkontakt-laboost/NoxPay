import { expect } from "chai";
import hre from "hardhat";
import { parseUnits } from "viem";

describe("NoxPay", function () {
  // NOTE: Full Nox TEE tests require a network with NoxCompute deployed.
  // Local Hardhat (chainId 31337) does not have the TEE precompile,
  // so constructor calls to Nox.toEuint256 will revert.
  // Run against a live Arbitrum Sepolia node for full integration tests.

  it("Should compile successfully", async function () {
    const artifact = await hre.artifacts.readArtifact("NoxPay");
    expect(artifact.abi.length).to.be.greaterThan(0);
    expect(artifact.bytecode).to.not.equal("0x");
  });

  it("Should deploy MockUSDC", async function () {
    const mockUSDC = await hre.viem.deployContract("MockUSDC", [
      parseUnits("1000000", 6),
    ]);
    const decimals = await mockUSDC.read.decimals();
    expect(decimals).to.equal(6);
    const totalSupply = await mockUSDC.read.totalSupply();
    expect(totalSupply).to.equal(parseUnits("1000000", 6));
  });
});
