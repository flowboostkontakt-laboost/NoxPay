import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { Eye, EyeOff, Shield, ArrowDownUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useNoxPayContract,
  usePublicBalance,
  useConfidentialBalance,
  useUnderlyingToken,
  useTokenAllowance,
  useApproveToken,
} from "@/hooks/useNoxPay";
import { useNoxHandle } from "@/hooks/useNoxHandle";

export function VaultPanel() {
  const { address } = useAccount();
  const { client: handleClient } = useNoxHandle();
  const { underlying } = useUnderlyingToken();
  const { balance: pubBal } = usePublicBalance(address);
  const { balanceHandle } = useConfidentialBalance(address);
  const { wrap, isPending, isConfirming } = useNoxPayContract();
  const { allowance } = useTokenAllowance(underlying, address, import.meta.env.VITE_NOXPAY_ADDRESS as `0x${string}`);
  const { approve, isPending: approving } = useApproveToken();

  const [wrapAmount, setWrapAmount] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [decryptedValue, setDecryptedValue] = useState<string | null>(null);
  const [revealLoading, setRevealLoading] = useState(false);

  const needsApproval =
    !!wrapAmount &&
    !!allowance &&
    allowance < parseUnits(wrapAmount || "0", 6);

  const handleReveal = async () => {
    if (!balanceHandle || !handleClient) return;
    setRevealLoading(true);
    try {
      const res = await handleClient.decrypt(balanceHandle);
      setDecryptedValue(String(res.value));
      setRevealed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setRevealLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border bg-surface">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              The Vault
            </CardTitle>
            <Badge variant="outline">Arbitrum Sepolia</Badge>
          </div>
          <CardDescription>Manage USDC and confidential ncUSDC</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Public Balance */}
          <div className="rounded-lg border border-border bg-surface-light p-4">
            <div className="text-xs text-text-muted">USDC Balance</div>
            <div className="mt-1 text-2xl font-semibold text-text">
              {pubBal !== undefined
                ? formatUnits(pubBal, 6)
                : "—"}{" "}
              <span className="text-sm text-text-muted">USDC</span>
            </div>
          </div>

          {/* Confidential Balance */}
          <div className="rounded-lg border border-border bg-surface-light p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-text-muted">ncUSDC Balance</div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 text-xs"
                onClick={() => {
                  if (revealed) {
                    setRevealed(false);
                    setDecryptedValue(null);
                  } else {
                    handleReveal();
                  }
                }}
                disabled={revealLoading || !balanceHandle}
              >
                {revealed ? (
                  <>
                    <EyeOff className="h-3 w-3" /> Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" /> Reveal
                  </>
                )}
              </Button>
            </div>
            <AnimatePresence mode="wait">
              {revealed && decryptedValue ? (
                <motion.div
                  key="revealed"
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  className="mt-1 text-2xl font-semibold text-primary-glow glow-purple"
                >
                  {decryptedValue}{" "}
                  <span className="text-sm text-primary">ncUSDC</span>
                </motion.div>
              ) : (
                <motion.div
                  key="hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-1 text-2xl font-semibold text-text-muted blur-secret"
                >
                  •••••• <span className="text-sm">ncUSDC</span>
                </motion.div>
              )}
            </AnimatePresence>
            {balanceHandle && (
              <div className="mt-2 break-all font-mono text-[10px] text-text-muted">
                Handle: {balanceHandle}
              </div>
            )}
          </div>

          {/* Wrap Controls */}
          <div className="flex gap-2">
            <Input
              placeholder="Amount to wrap"
              value={wrapAmount}
              onChange={(e) => setWrapAmount(e.target.value)}
              className="flex-1"
            />
            {needsApproval ? (
              <Button
                variant="primary"
                disabled={approving || !underlying}
                onClick={() =>
                  underlying &&
                  approve(
                    underlying,
                    import.meta.env.VITE_NOXPAY_ADDRESS as `0x${string}`,
                    parseUnits(wrapAmount || "0", 6)
                  )
                }
              >
                {approving ? "Approving..." : "Approve"}
              </Button>
            ) : (
              <Button
                variant="primary"
                disabled={!wrapAmount || isPending || isConfirming}
                onClick={() => address && wrap(address, wrapAmount)}
              >
                <ArrowDownUp className="mr-1 h-4 w-4" />
                {isPending || isConfirming ? "Wrapping..." : "Wrap"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
