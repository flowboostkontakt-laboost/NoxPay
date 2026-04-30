# NoxPay

> **Private by Default, Compliant by Design**

NoxPay is an institutional AI-driven privacy payroll framework built on iExec's Nox TEE infrastructure. It wraps public ERC-20 tokens (USDC) into confidential ERC-7984 tokens (ncUSDC) on Arbitrum Sepolia, enabling encrypted batch payroll distribution with auditor viewing policies and AI-powered compliance oversight via ChainGPT.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     NoxPay Dashboard                         │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  Vault   │  │ Payroll Center│  │ AI Compliance Officer│   │
│  │  Panel   │  │              │  │                     │   │
│  └──────────┘  └──────────────┘  └─────────────────────┘   │
│         │                │                      │            │
│    @iexec-nox/handle   wagmi/viem           ChainGPT API    │
│         │                │                      │            │
│         └────────────────┴──────────────────────┘            │
│                              │                               │
│                    ┌─────────────────┐                       │
│                    │   NoxPay.sol    │                       │
│                    │ (ERC-7984 Wrap) │                       │
│                    └────────┬────────┘                       │
│                             │                                │
│              ┌──────────────┴──────────────┐                │
│              │  iExec Nox TEE (Arbitrum)   │                │
│              │  Confidential Compute       │                │
│              └─────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Features

- **The Vault**: Wrap USDC into ncUSDC (1:1). View encrypted balances with a "Reveal" mechanic powered by `@iexec-nox/handle` decryption.
- **Payroll Center**: Batch confidential transfers. Enter `address,amount` lines, encrypt amounts client-side via Nox TEE, and submit a single batch transaction.
- **AI Compliance Officer**: ChainGPT-powered tax advisor chat + automated smart-contract security audit console.
- **Viewing Policy**: Time-bounded auditor access to encrypted total volume via `grantAuditorAccess` / `revokeAuditorAccess`.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Hardhat 3, Solidity ^0.8.28, viem |
| Privacy Layer | `@iexec-nox/nox-confidential-contracts` (ERC-7984), `@iexec-nox/nox-protocol-contracts` |
| Frontend | Vite, React 19, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui style (custom) |
| Animations | Framer Motion (Nox Effect) |
| Wallet | wagmi + viem |
| AI | ChainGPT API |

## Quick Start

### Prerequisites

- Node.js 20+
- MetaMask with Arbitrum Sepolia configured
- `ARB_SEPOLIA_RPC` and `PRIVATE_KEY` for deployment
- `VITE_CHAINGPT_API_KEY` for AI features

### Contract Deployment

```bash
npm install
npx hardhat compile
npx hardhat ignition deploy ignition/modules/NoxPay.ts --network arbitrumSepolia --parameters "{\"underlying\":\"0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d\"}"
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set environment variables in `frontend/.env`:

```env
VITE_NOXPAY_ADDRESS=0x...
VITE_ARB_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
VITE_CHAINGPT_API_KEY=...
```

## Key Design Decisions

- **euint256 over euint64**: The `@iexec-nox` packages use `euint256` natively, avoiding decimal compression issues with USDC (6 decimals).
- **Batch via handles**: The frontend encrypts amounts using `handleClient.encryptInput()` and passes the resulting handles to `batchConfidentialTransfer(euint256[])`. This avoids managing individual input proofs per recipient.
- **Volume tracking in _update**: We override `_update` to accumulate encrypted `_totalVolume` for compliance dashboards, allowing auditors to request decryption of aggregate stats without seeing individual balances.

## License

MIT
