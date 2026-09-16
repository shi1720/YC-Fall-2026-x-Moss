import { expect, test } from "@playwright/test";
import WebSocket from "ws";

test("API rejects invalid search sizes, recording types and scenario traversal", async ({ request }) => {
  for (const query of ["?q=hello&k=NaN", "?q=hello&k=999", "?q=" + "a".repeat(2001)]) expect((await request.get("/api/playbook" + query)).status()).toBe(400);
  expect((await request.get("/api/scenarios?id=..%2Fsecret")).status()).toBe(400);
  expect((await request.post("/api/transcribe", { data: "invalid" })).status()).toBe(400);
  expect((await request.post("/api/transcribe", { multipart: { file: { name: "test.txt", mimeType: "text/plain", buffer: Buffer.from("not audio") } } })).status()).toBe(415);
});

test("ended call remains reportable and malformed socket input does not break the session", async ({ request, baseURL }) => {
  const config = await (await request.get("/api/config")).json();
  const url = new URL("/ws", config.wsOrigin || baseURL); url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  const ws = new WebSocket(url.toString(), { origin: baseURL });
  const messages: Array<Record<string, unknown>> = [];
  ws.on("message", raw => messages.push(JSON.parse(raw.toString())));
  await new Promise<void>((resolve, reject) => { ws.on("open", resolve); ws.on("error", reject); });
  try {
    ws.send(JSON.stringify({ type: "call.start", mode: "simulation", familyCode: "TEST2345" }));
    await expect.poll(() => messages.some(m => m.type === "call.started")).toBe(true);
    ws.send('{"type":"utterance","text":42}');
    await expect.poll(() => messages.some(m => m.type === "error" && String(m.message).includes("Invalid"))).toBe(true);
    ws.send('{"type":"call.end"}');
    await expect.poll(() => messages.some(m => m.type === "call.ended"), { timeout: 20000 }).toBe(true);
    ws.send('{"type":"call.report","consent":true}');
    await expect.poll(() => messages.some(m => m.type === "call.reported"), { timeout: 10000 }).toBe(true);
    expect(messages.find(m => m.type === "call.reported")?.message).toContain("Nothing flagged");
  } finally { ws.close(); }
});

test("mobile pages fit the viewport and the live entry link selects the microphone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/", "/shield", "/guardian", "/playbook", "/lab"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route).toBe(true);
  }
  await page.goto("/shield?mode=live");
  await expect(page.getByRole("button", { name: "Start listening" })).toBeVisible();
});

test("benchmark recovers from a failed request and search clearing removes stale matches", async ({ page }) => {
  await page.goto("/lab");
  await page.route("**/api/playbook?**", route => route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"temporary"}' }));
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Benchmark request failed" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run", exact: true })).toBeEnabled();
  await page.unroute("**/api/playbook?**");
  await page.goto("/playbook");
  await page.getByLabel("Search the scam playbook").fill("read the OTP");
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByLabel("Search the scam playbook")).toHaveValue("");
  await expect(page.getByText("engine search", { exact: true })).toHaveCount(0);
});
