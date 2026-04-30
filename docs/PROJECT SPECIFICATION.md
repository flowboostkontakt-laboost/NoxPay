# NOXPAY: INSTITUTIONAL AI-DRIVEN PRIVACY LAYER - PROJECT SPECIFICATION

You are an expert Senior Web3 Full-stack Developer. Your goal is to build "NoxPay" for the iExec Vibe Coding Challenge. The deadline is in less than 24h. You must deliver a functional, high-fidelity prototype on Arbitrum Sepolia.

---

## 1. PROJECT VISION & VALUE PROPOSITION
**NoxPay** is an enterprise payroll framework that brings banking-grade privacy to Web3.
- **Problem:** Public ledgers expose corporate salary structures, bonuses, and competitive intelligence.
- **Solution:** 
    - **iExec Nox (TEE):** Encrypts transaction amounts and balances on-chain.
    - **ChainGPT (AI):** Automates security audits and localized tax compliance.
- **Network:** Arbitrum Sepolia.

---

## 2. TECHNICAL STACK
- **Privacy:** `@iexec/nox-contracts` (Solidity), `@iexec/nox-fcl` (Frontend).
- **Blockchain:** Arbitrum Sepolia (USDC as base asset).
- **AI:** ChainGPT API (Audit & Web3 LLM).
- **Frontend:** React, Tailwind CSS, Framer Motion (for "Nox Effect" animations), Shadcn/UI.

---

## 3. TASK 1: THE PRIVACY ENGINE (SMART CONTRACTS)
Build `NoxPay.sol`. It must act as a **Confidential Wrapper**.

### Technical Requirements:
- **Encrypted Types:** Use `euint32` from Nox to store `encryptedBalances`.
- **Core Functions:**
    1. `wrap(uint32 amount)`: ERC20 USDC -> Confidential cUSDC.
    2. `transferConfidential(address to, euint32 encryptedAmount)`: Moves funds between encrypted balances without revealing the amount on the Arbitrum explorer.
    3. `unwrap(euint32 encryptedAmount)`: Decrypts and releases public USDC.
    4. `getConfidentialBalance()`: Returns the encrypted balance (accessible via Nox FCL).
- **Institutional Logic:** Implement a "Viewing Policy" that allows an admin to grant an auditor access to *total* volume without revealing individual data points.

---

## 4. TASK 2: FRONTEND UI/UX (INSTITUTIONAL DASHBOARD)
Design a high-end Fintech SaaS interface. 

### Visual Identity:
- **Style:** Institutional Dark Mode. Background: `#0f172a`, Primary Accent: `#7c3aed` (Purple).
- **Glassmorphism:** Use `backdrop-blur-md` and `border-slate-800`.

### Layout (Three-Column Dashboard):
1. **Column 1: The Vault (Left)**
    - Public USDC card vs. Confidential cUSDC card.
    - **Reveal Mechanic:** Blurred value that glows purple after `NoxFCL` signature.
2. **Column 2: Payroll Center (Center)**
    - **Batch Distribution:** Multi-line input for addresses and amounts.
    - **Nox Effect:** Framer Motion animation showing public data "locking" into a shield icon during execution.
    - **Status Stepper:** `Encrypting` -> `TEE Validation` -> `Settlement`.
3. **Column 3: AI Compliance Officer (Right)**
    - **ChainGPT Widget:** Real-time chat for tax/legal questions.
    - **Audit Console:** A streaming text window showing "AI Security Scan" results for the contract.

---

## 5. TASK 3: AI INTEGRATION (CHAINGPT)
- **AI Auditor:** Implement a function `runSecurityAudit()` that simulates/calls ChainGPT to verify the `NoxPay.sol` logic.
- **Tax Advisor:** A chat interface where ChainGPT provides localized tax withholding estimates for payroll batches.

---

## 6. TASK 4: MANDATORY SUBMISSION FILES
Generate these files exactly as required by hackathon rules:

1. **README.md:** 
    - Tagline: "Private by Default, Compliant by Design."
    - Professional breakdown of Nox TEE architecture and ChainGPT integration.
2. **feedback.md:** 
    - 3-4 specific technical feedbacks for iExec (e.g., "Request for Nox FCL React hooks", "Clarity on euint32 gas optimization").
3. **video_script.md:** 
    - 4-minute script: **Problem (Public Salaries) -> Solution (Nox TEE) -> App Demo (Wrap/Transfer) -> AI Audit -> Conclusion.**

---

## EXECUTION ORDER:
1. **Step 1:** Generate `NoxPay.sol` and the Deployment Script.
2. **Step 2:** Build the React Frontend (NoxPay Dashboard) with Tailwind and Framer Motion.
3. **Step 3:** Generate the README, Feedback, and Video Script.

**Start with Step 1: Smart Contract and Deployment Script NOW.**