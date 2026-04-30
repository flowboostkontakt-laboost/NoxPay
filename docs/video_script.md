# NoxPay Demo Video Script (4 minutes)

## 1. The Problem (0:00 - 0:45)

**[Scene: Split screen - public blockchain explorer showing payroll tx amounts]**

"Traditional on-chain payroll is fully transparent. Every salary, bonus, and contractor payment is visible to competitors, scrapers, and the public. For institutions, this is unacceptable."

"But privacy solutions often sacrifice compliance. Regulators and internal auditors still need access to aggregate financial data."

"Enter NoxPay."

## 2. Nox TEE Architecture (0:45 - 1:30)

**[Scene: Animated diagram - USDC flows into TEE, comes out as ncUSDC]**

"NoxPay is built on iExec's Nox TEE infrastructure on Arbitrum Sepolia. It wraps USDC into ncUSDC - a confidential ERC-7984 token where balances and amounts are encrypted as euint256 handles."

"The TEE validates transfers without revealing amounts. Only authorized parties with cryptographic ACL access can decrypt values."

"Our smart contract extends ERC20ToERC7984WrapperAdvanced, adding:
- Batch confidential payroll
- Time-bounded auditor viewing policies
- Encrypted total volume tracking for compliance"

## 3. Live Demo - The Vault (1:30 - 2:15)

**[Screen recording: Dashboard, Vault Panel]**

"Let's connect MetaMask on Arbitrum Sepolia. Here in the Vault, I can see my public USDC balance... and my confidential ncUSDC balance."

**[Click Reveal]**

"By clicking Reveal, I use the Nox Handle SDK to decrypt my confidential balance locally. The value illuminates with the Nox glow - proof that TEE decryption succeeded."

"I can also wrap more USDC into ncUSDC, ready for payroll distribution."

## 4. Live Demo - Payroll Center (2:15 - 3:00)

**[Screen recording: Payroll Center]**

"Now let's pay three contractors. I paste their addresses and amounts. Each amount is encrypted client-side by the Nox Handle SDK before hitting the chain."

**[Click Distribute Payroll - show Nox Effect animation]**

"Watch the Nox Effect: the data collapses into a shield, encryption waves ripple outward, and the TEE validates the batch. Within seconds, settlement is confirmed."

"All three recipients received ncUSDC. Their individual amounts remain confidential."

## 5. AI Compliance Officer (3:00 - 3:45)

**[Screen recording: AI Compliance panel]**

"Compliance isn't just encryption - it's oversight. Our AI Compliance Officer, powered by ChainGPT, acts as a 24/7 tax advisor and security auditor."

**[Type question in chat]**

"I can ask regulatory questions like 'What are the tax implications of paying contractors in privacy tokens?' and receive streamed AI guidance."

**[Click Run AI Scan]**

"The Audit Console sends our NoxPay.sol source to ChainGPT for automated security analysis. In seconds, we get a markdown report highlighting TEE integration risks and access control logic."

## 6. Conclusion (3:45 - 4:00)

**[Scene: Return to dashboard, all three panels visible]**

"NoxPay proves that institutional finance doesn't have to choose between privacy and compliance. With iExec's Nox TEE, we get private-by-default payroll, compliant-by-design oversight, and AI-powered governance."

"Private by Default. Compliant by Design. NoxPay."

**[End card: GitHub repo, deployment address, team info]**
