import { expect, test } from "@playwright/test";

test("health reports a ready retrieval runtime", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.retrieval.docCount).toBeGreaterThan(300);
});

test("playbook search returns tactic matches with latency", async ({ request }) => {
  const res = await request.get("/api/playbook?q=" + encodeURIComponent("read me the six digit OTP quickly"));
  const body = await res.json();
  expect(body.matches.length).toBeGreaterThan(0);
  expect(body.matches.some((m: { tactics: string[] }) => m.tactics.includes("otp_request"))).toBeTruthy();
  expect(typeof body.wallMs).toBe("number");
});

test("a simulated digital-arrest call is stopped and the guardian sees it", async ({ page, context }) => {
  await page.goto("/shield?scenario=digital-arrest&silent=1&fast=1");
  await expect(page.getByText("connected", { exact: true })).toBeVisible({ timeout: 20_000 });
  const code = await page.getByLabel("Family code").inputValue();
  expect(code.length).toBeGreaterThanOrEqual(3);

  const guardian = await context.newPage();
  await guardian.goto(`/guardian?code=${code}`);
  await expect(guardian.getByText(`watching ${code}`)).toBeVisible({ timeout: 20_000 });

  await page.getByRole("button", { name: "Start the call" }).click();

  await expect(page.getByText("scam detected", { exact: false })).toBeVisible({ timeout: 45_000 });
  await expect(guardian.getByText("Interventions on their phone")).toBeVisible({ timeout: 20_000 });
  await expect(guardian.getByText("Danger").first()).toBeVisible();

  await guardian.getByPlaceholder("What did they ask for?").fill("what money did they ask for");
  await guardian.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(guardian.getByText("“what money did they ask for”")).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "I hung up" }).click();
  await expect(page.getByText(/Call ended · \d/)).toBeVisible({ timeout: 20_000 });
});

test("a genuine hospital call never triggers the overlay", async ({ page }) => {
  await page.goto("/shield?scenario=benign-hospital&silent=1&fast=1");
  await expect(page.getByText("connected", { exact: true })).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Start the call" }).click();
  await expect(page.getByText(/Call ended · \d/)).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText("scam detected", { exact: false })).toHaveCount(0);
  await expect(page.getByText("Safe").first()).toBeVisible();
});
