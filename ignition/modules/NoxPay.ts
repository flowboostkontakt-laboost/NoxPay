import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NoxPayModule = buildModule("NoxPayModule", (m) => {
  const underlying = m.getParameter("underlying", "0x0000000000000000000000000000000000000000");

  const noxPay = m.contract("NoxPay", [underlying]);

  return { noxPay };
});

export default NoxPayModule;
