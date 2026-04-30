import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VaultPanel } from "@/components/VaultPanel";
import { PayrollCenter } from "@/components/PayrollCenter";
import { AICompliance } from "@/components/AICompliance";
import { wagmiConfig } from "@/lib/viemClient";

function Header() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
          N
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text">NoxPay</h1>
          <p className="text-xs text-text-muted">Private by Default, Compliant by Design</p>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-3">
          <span className="hidden rounded-lg bg-surface-light px-3 py-1.5 text-xs font-mono text-text sm:inline-block">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <Button variant="outline" size="sm" onClick={() => disconnect()}>
            <LogOut className="mr-1 h-3 w-3" /> Disconnect
          </Button>
        </div>
      ) : (
        <Button variant="primary" size="sm" onClick={() => connect({ connector: wagmiConfig.connectors[0] })}>
          <Wallet className="mr-1 h-3 w-3" /> Connect Wallet
        </Button>
      )}
    </header>
  );
}

export default function App() {
  const { isConnected } = useAccount();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {!isConnected ? (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <div className="mb-4 text-4xl">🔒</div>
            <h2 className="mb-2 text-xl font-semibold text-text">Connect your wallet</h2>
            <p className="text-text-muted">
              Use MetaMask on Arbitrum Sepolia to access the NoxPay vault.
            </p>
          </div>
        </div>
      ) : (
        <main className="mx-auto w-full max-w-7xl flex-1 p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6">
              <VaultPanel />
            </div>
            <div className="space-y-6">
              <PayrollCenter />
            </div>
            <div className="space-y-6">
              <AICompliance />
            </div>
          </div>
        </main>
      )}

      <footer className="border-t border-border bg-surface px-6 py-4 text-center text-xs text-text-muted">
        NoxPay &mdash; Built for iExec Vibe Coding Challenge &middot; Arbitrum Sepolia
      </footer>
    </div>
  );
}
