# Feedback for iExec Nox Team

## 1. Missing React Hooks in `@iexec-nox/handle`

**Observation**: The `@iexec-nox/handle` SDK provides `createViemHandleClient` and `createEthersHandleClient`, but no React hooks (e.g., `useHandleClient`). Integrating with wagmi requires manual `useWalletClient` + `useEffect` + async initialization, which is boilerplate-heavy and error-prone in React's strict mode.

**Suggestion**: Ship an optional `@iexec-nox/handle-react` package with `useHandleClient(walletClient)` that handles mounting, loading states, and errors.

## 2. `euint256` vs `euint64` Documentation Gap

**Observation**: The official iExec documentation and hackathon spec frequently reference `euint64` and OpenZeppelin's confidential ERC-20 wrapper patterns. However, the actual `@iexec-nox/nox-confidential-contracts` uses `euint256` exclusively and provides `ERC20ToERC7984WrapperAdvanced` which behaves differently (no rate conversion, direct 1:1 wrapping).

**Suggestion**: Update docs to clearly distinguish between:
- OZ-style `euint64` + rate-based wrappers
- Nox-style `euint256` + direct wrappers

This would prevent confusion when porting code from OZ examples.

## 3. Gas Estimation for `confidentialTransfer`

**Observation**: Hardhat's `eth_estimateGas` frequently fails for `confidentialTransfer` and `batchConfidentialTransfer` when called with raw `euint256` handles (bytes32). The TEE proof validation seems to throw off standard gas estimation because the handle validity is checked at execution time inside the TEE.

**Suggestion**: Provide a helper or documentation snippet for estimating gas on confidential calls, or expose a `simulateConfidentialTransfer` helper in the SDK that performs off-chain validation before submitting.

## 4. Batch Input Proofs

**Observation**: Our `batchConfidentialTransfer` with `externalEuint256[]` and a single `bytes inputProof` works for the hackathon, but the proof format for batch operations is under-documented. It's unclear whether a single proof can cover multiple encrypted inputs, or if each input requires its own proof.

**Suggestion**: Clarify the relationship between `externalEuint256` handles and input proofs in batch contexts. If batch proofs are supported, document the aggregation format.
