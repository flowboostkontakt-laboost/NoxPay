import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, ShieldCheck, User, Terminal } from "lucide-react";
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
import { useChainGPT } from "@/hooks/useChainGPT";

const CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Nox, euint256, externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {ERC20ToERC7984WrapperAdvanced} from "@iexec-nox/nox-confidential-contracts/contracts/token/extensions/ERC20ToERC7984WrapperAdvanced.sol";

contract NoxPay is ERC20ToERC7984WrapperAdvanced, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    euint256 private _totalVolume;
    mapping(address => uint48) public auditorVolumeAccess;

    constructor(IERC20 underlying)
        ERC20ToERC7984WrapperAdvanced(underlying)
        ERC7984Advanced("NoxPay Confidential USDC", "ncUSDC", "")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _totalVolume = Nox.toEuint256(0);
    }

    function grantAuditorAccess(address auditor, uint48 until) external onlyRole(ADMIN_ROLE) { ... }
    function revokeAuditorAccess(address auditor) external onlyRole(ADMIN_ROLE) { ... }
    function getTotalVolume() external view returns (euint256) { ... }

    function batchConfidentialTransfer(address[] calldata to, euint256[] calldata amounts) external returns (euint256[] memory) { ... }

    function _update(address from, address to, euint256 amount) internal virtual override returns (euint256 transferred) {
        transferred = super._update(from, to, amount);
        if (from != address(0) && to != address(0)) {
            _totalVolume = Nox.add(_totalVolume, transferred);
            Nox.allowThis(_totalVolume);
        }
    }
}`;

export function AICompliance() {
  const { messages, streaming, sendMessage, auditResult, auditing, runAudit } =
    useChainGPT();
  const [chatInput, setChatInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, auditResult]);

  const handleSend = () => {
    if (!chatInput.trim() || streaming) return;
    sendMessage(chatInput);
    setChatInput("");
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border bg-surface">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-4 w-4 text-primary" />
              AI Compliance Officer
            </CardTitle>
            <Badge variant="outline">ChainGPT</Badge>
          </div>
          <CardDescription>
            Tax advisor and smart-contract security auditor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat */}
          <div
            ref={scrollRef}
            className="flex h-64 flex-col gap-3 overflow-y-auto rounded-lg border border-border bg-surface-light p-3"
          >
            {messages
              .filter((m) => m.role !== "system")
              .map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-surface text-text"
                    }`}
                  >
                    {msg.content || (
                      <span className="animate-pulse">Thinking...</span>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-light">
                      <User className="h-3 w-3 text-text-muted" />
                    </div>
                  )}
                </motion.div>
              ))}
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about tax optimization, compliance, or payroll regulations..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              className="flex-1"
            />
            <Button
              variant="primary"
              className="self-end"
              disabled={streaming || !chatInput.trim()}
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Console */}
      <Card className="border-border bg-surface">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Terminal className="h-4 w-4 text-primary" />
              Audit Console
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              disabled={auditing}
              onClick={() => runAudit(CONTRACT_CODE)}
            >
              <ShieldCheck className="mr-1 h-3 w-3" />
              {auditing ? "Scanning..." : "Run AI Scan"}
            </Button>
          </div>
          <CardDescription>
            Automated security scan powered by ChainGPT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative min-h-[140px] overflow-hidden rounded-lg border border-border bg-black p-4 font-mono text-xs text-green-400">
            {auditResult ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-pre-wrap"
              >
                {auditResult}
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                {auditing ? (
                  <span className="animate-pulse">
                    Running security analysis on NoxPay.sol...
                  </span>
                ) : (
                  "No scan initiated. Click Run AI Scan to analyze the contract."
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
