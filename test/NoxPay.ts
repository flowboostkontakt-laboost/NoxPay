import { expect } from "chai";
import hre from "hardhat";
import { parseUnits } from "viem";

describe("NoxPay", function () {
  it("Should compile successfully", async function () {
    const artifact = await hre.artifacts.readArtifact("NoxPay");
    expect(artifact.abi.length).to.be.greaterThan(0);
    expect(artifact.bytecode).to.not.equal("0x");
  });

  it("Should expose batchConfidentialTransfer in ABI", async function () {
    const artifact = await hre.artifacts.readArtifact("NoxPay");
    const names = artifact.abi.map((item: any) => item.name);
    expect(names).to.include("batchConfidentialTransfer");
    expect(names).to.include("grantAuditorAccess");
    expect(names).to.include("revokeAuditorAccess");
    expect(names).to.include("getTotalVolume");
    expect(names).to.include("wrap");
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

  it("Should support MockUSDC transfers and mint", async function () {
    const [alice, bob] = await hre.viem.getWalletClients();
    const mockUSDC = await hre.viem.deployContract("MockUSDC", [
      parseUnits("10000", 6),
    ]);

    // Initial balance
    const aliceBal = await mockUSDC.read.balanceOf([alice.account.address]);
    expect(aliceBal).to.equal(parseUnits("10000", 6));

    // Transfer to Bob
    await mockUSDC.write.transfer([bob.account.address, parseUnits("2500", 6)]);
    const bobBal = await mockUSDC.read.balanceOf([bob.account.address]);
    expect(bobBal).to.equal(parseUnits("2500", 6));

    // Mint
    await mockUSDC.write.mint([bob.account.address, parseUnits("1000", 6)]);
    const bobBalAfter = await mockUSDC.read.balanceOf([bob.account.address]);
    expect(bobBalAfter).to.equal(parseUnits("3500", 6));
  });
});

describe("NoxPay — Fork Tests", function () {
  before(function () {
    if (process.env.FORK !== "true") {
      console.log("Skipping fork tests. Set FORK=true to run them.");
      this.skip();
    }
  });

  it("Should read deployed NoxPay name on fork", async function () {
    const noxPay = await hre.viem.getContractAt(
      "NoxPay",
      "0x492a25983c45341593ADf88e3CEF9493d4a66D61"
    );
    const name = await noxPay.read.name();
    expect(name).to.equal("NoxPay Confidential USDC");
  });

  it("Should read underlying token from deployed NoxPay", async function () {
    const noxPay = await hre.viem.getContractAt(
      "NoxPay",
      "0x492a25983c45341593ADf88e3CEF9493d4a66D61"
    );
    const underlying = await noxPay.read.underlying();
    // Arbitrum Sepolia USDC
    expect(underlying.toLowerCase()).to.equal(
      "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d".toLowerCase()
    );
  });
});
