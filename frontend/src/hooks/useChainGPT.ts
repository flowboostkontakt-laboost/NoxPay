import { useState, useCallback } from "react";
import { streamTaxAdvice, runAuditScan, type ChatMessage } from "@/lib/chaingpt";

export function useChainGPT() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "system",
      content:
        "You are NoxPay's AI Compliance Officer. You help with tax optimization, regulatory questions, and payroll compliance across jurisdictions.",
    },
  ]);
  const [streaming, setStreaming] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [auditing, setAuditing] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: ChatMessage = { role: "user", content };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setStreaming(true);

      const assistantMsg: ChatMessage = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMsg]);

      try {
        const stream = streamTaxAdvice(nextMessages);
        let full = "";
        for await (const chunk of stream) {
          full += chunk;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { ...copy[copy.length - 1], content: full };
            return copy;
          });
        }
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${(e as Error).message}` },
        ]);
      } finally {
        setStreaming(false);
      }
    },
    [messages]
  );

  const runAudit = useCallback(async (contractCode: string) => {
    setAuditing(true);
    setAuditResult(null);
    try {
      const result = await runAuditScan(contractCode);
      setAuditResult(result);
    } catch (e) {
      setAuditResult(`Audit failed: ${(e as Error).message}`);
    } finally {
      setAuditing(false);
    }
  }, []);

  return {
    messages,
    streaming,
    sendMessage,
    auditResult,
    auditing,
    runAudit,
  };
}
