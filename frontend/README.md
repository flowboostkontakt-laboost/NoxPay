# NoxPay Frontend

React + Vite + TypeScript dashboard for the NoxPay protocol.

## Setup

```bash
npm install
```

Create `.env`:

```env
VITE_NOXPAY_ADDRESS=0x...
VITE_ARB_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
VITE_CHAINGPT_API_KEY=...
```

## Run locally

```bash
npm run dev
```

## Build for production

```bash
npm run build
```

## Stack

- React 19 + TypeScript
- Vite
- wagmi + viem (wallet & contract interaction)
- Tailwind CSS
- Framer Motion
- @iexec-nox/handle (TEE encryption/decryption)
