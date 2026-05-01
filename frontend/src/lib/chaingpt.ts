const API_KEY = import.meta.env.VITE_CHAINGPT_API_KEY || "";
const BASE_URL = "https://api.chaingpt.org";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function* streamTaxAdvice(messages: ChatMessage[]) {
  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "chaingpt-lite",
      messages,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`ChainGPT API error: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch (err) {
        console.warn("[ChainGPT] Malformed JSON chunk:", data, err);
      }
    }
  }
}

export async function runAuditScan(contractCode: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "chaingpt-lite",
      messages: [
        {
          role: "system",
          content:
            "You are a smart-contract security auditor. Analyze the provided Solidity code for vulnerabilities, TEE integration risks, and compliance issues. Return a concise markdown report.",
        },
        {
          role: "user",
          content: `Please audit the following NoxPay contract:\n\n\`\`\`solidity\n${contractCode}\n\`\`\``,
        },
      ],
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`ChainGPT API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response.";
}
