/**
 * Minimal, provider-agnostic chat-completion client (OpenAI-compatible wire format).
 * Default provider is Groq's free tier (fast Llama models), but any OpenAI-compatible
 * endpoint works: set LLM_BASE_URL, LLM_API_KEY and LLM_MODEL.
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface ChatResult {
  text: string;
  model: string;
  latencyMs: number;
}

export function llmConfig() {
  const apiKey = process.env.LLM_API_KEY ?? process.env.GROQ_API_KEY ?? "";
  return {
    apiKey,
    baseUrl: (process.env.LLM_BASE_URL ?? "https://api.groq.com/openai/v1").replace(/\/$/, ""),
    model: process.env.LLM_MODEL ?? "llama-3.1-8b-instant",
    enabled: apiKey.length > 0,
  };
}

export async function chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
  const cfg = llmConfig();
  if (!cfg.enabled) throw new Error("LLM disabled: set GROQ_API_KEY (or LLM_API_KEY)");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 8000);
  const t0 = performance.now();
  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${cfg.apiKey}` },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: opts.temperature ?? 0.2,
        max_tokens: opts.maxTokens ?? 400,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`LLM HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as { choices: Array<{ message: { content: string } }>; model?: string };
    return {
      text: data.choices?.[0]?.message?.content ?? "",
      model: data.model ?? cfg.model,
      latencyMs: performance.now() - t0,
    };
  } finally {
    clearTimeout(timer);
  }
}
