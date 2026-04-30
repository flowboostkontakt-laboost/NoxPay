import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Lock, CheckCircle2, Loader2, Radio } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNoxPayContract } from "@/hooks/useNoxPay";
import { useNoxHandle } from "@/hooks/useNoxHandle";

type Step = "idle" | "encrypting" | "tee" | "settlement" | "done";

export function PayrollCenter() {
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [encryptedCount, setEncryptedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { client: handleClient } = useNoxHandle();
  const { batchPayroll, isPending, isConfirming, isConfirmed } =
    useNoxPayContract();

  const noxPayAddress = (import.meta.env.VITE_NOXPAY_ADDRESS || "") as `0x${string}`;

  const parseBatch = () => {
    const lines = input.trim().split("\n");
    const recipients: `0x${string}`[] = [];
    const amounts: string[] = [];
    for (const line of lines) {
      const [addr, amt] = line.split(",").map((s) => s.trim());
      if (addr && amt && addr.startsWith("0x")) {
        recipients.push(addr as `0x${string}`);
        amounts.push(amt);
      }
    }
    return { recipients, amounts };
  };

  const handleDistribute = async () => {
    if (!handleClient || !noxPayAddress) return;
    setError(null);
    const { recipients, amounts } = parseBatch();
    if (recipients.length === 0) {
      setError("No valid entries. Use format: address,amount");
      return;
    }

    setStep("encrypting");
    setEncryptedCount(0);

    try {
      const handles: `0x${string}`[] = [];
      for (let i = 0; i < amounts.length; i++) {
        const val = Number(amounts[i]);
        if (isNaN(val) || val <= 0) continue;
        // Encrypt as euint256 with 6 decimals (USDC style)
        const bigVal = BigInt(Math.round(val * 1_000_000));
        const res = await handleClient.encryptInput(
          bigVal,
          "uint256",
          noxPayAddress
        );
        handles.push(res.handle as `0x${string}`);
        setEncryptedCount((c) => c + 1);
      }

      if (handles.length !== recipients.length) {
        setError("Encryption mismatch. Some amounts failed.");
        setStep("idle");
        return;
      }

      setStep("tee");
      batchPayroll(recipients, handles);
    } catch (e) {
      setError((e as Error).message);
      setStep("idle");
    }
  };

  if (isConfirmed && step === "tee") {
    setStep("settlement");
    setTimeout(() => setStep("done"), 1500);
  }

  return (
    <Card className="border-border bg-surface">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4 text-primary" />
            Payroll Center
          </CardTitle>
          <Badge variant="primary">TEE Powered</Badge>
        </div>
        <CardDescription>
          Distribute confidential payroll in one batch
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Textarea
          placeholder={`0xAbC...,1000\n0xDef...,2500\n0x123...,500`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
        />

        <AnimatePresence>
          {step !== "idle" && step !== "done" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-light p-4">
                <NoxEffect step={step} />
                <div className="flex-1 space-y-2">
                  <StepItem
                    label="Encrypting"
                    active={step === "encrypting"}
                    done={step !== "encrypting"}
                    detail={
                      step === "encrypting"
                        ? `${encryptedCount} / ${parseBatch().amounts.length} encrypted`
                        : undefined
                    }
                  />
                  <StepItem
                    label="TEE Validation"
                    active={step === "tee"}
                    done={step === "settlement"}
                  />
                  <StepItem
                    label="Settlement"
                    active={step === "settlement"}
                    done={false}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {step === "done" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success"
          >
            <CheckCircle2 className="h-4 w-4" />
            Payroll distributed successfully via TEE.
          </motion.div>
        )}

        <Button
          variant="primary"
          className="w-full"
          disabled={
            !input || isPending || isConfirming || step === "encrypting"
          }
          onClick={handleDistribute}
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : step === "encrypting" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Encrypting...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Distribute Payroll
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function StepItem({
  label,
  active,
  done,
  detail,
}: {
  label: string;
  active: boolean;
  done: boolean;
  detail?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-success" />
      ) : active ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <div className="h-4 w-4 rounded-full border border-text-muted" />
      )}
      <span
        className={
          active
            ? "text-sm font-medium text-primary"
            : done
            ? "text-sm text-text-muted"
            : "text-sm text-text-muted/60"
        }
      >
        {label}
      </span>
      {detail && (
        <span className="ml-auto text-xs text-text-muted">{detail}</span>
      )}
    </div>
  );
}

function NoxEffect({ step }: { step: Step }) {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/30"
        animate={{
          scale: step === "encrypting" ? [1, 1.3, 1] : 1,
          opacity: step === "encrypting" ? [0.5, 0, 0.5] : 0.3,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border-2 border-primary-glow/20"
        animate={{
          scale: step === "tee" ? [1, 1.2, 1] : 1,
          opacity: step === "tee" ? [0.4, 0, 0.4] : 0.2,
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <Radio
        className={`h-6 w-6 ${
          step === "encrypting"
            ? "text-primary"
            : step === "tee"
            ? "text-primary-glow"
            : "text-success"
        }`}
      />
    </div>
  );
}
