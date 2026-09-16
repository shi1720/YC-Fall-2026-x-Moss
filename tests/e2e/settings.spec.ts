import { expect, test } from "@playwright/test";

test("settings validates consent and recovers from setup and disconnect failures", async ({ page }) => {
  let state: Record<string, unknown> = { status: "disconnected", sharedMode: "mock" };
  let payload: Record<string, unknown> | null = null;
  await page.route("**/api/moss", async route => {
    if (route.request().method() === "POST") {
      payload = route.request().postDataJSON();
      state = { status: "error", error: "Moss rejected these credentials. Check the project ID and project API key.", indexName: "raksha-playbook" };
      return route.fulfill({ status: 202, json: { status: "connecting" } });
    }
    if (route.request().method() === "DELETE") state = { status: "disconnected", sharedMode: "mock" };
    return route.fulfill({ json: state });
  });
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Make the demo your own." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect my project", exact: true })).toBeDisabled();
  await page.getByLabel("Moss project ID", { exact: true }).fill("test-project");
  await page.getByLabel("Moss project API key", { exact: true }).fill("test-key-never-save");
  await page.getByRole("checkbox", { name: /I allow Raksha/ }).check();
  await page.getByRole("button", { name: "Connect my project", exact: true }).click();
  await expect(page.getByText("Connection needs attention", { exact: true })).toBeVisible();
  expect(payload).toMatchObject({ consent: true, createIndex: false, indexName: "raksha-playbook" });
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain("test-key-never-save");
  await page.getByRole("button", { name: "Disconnect and use demo", exact: true }).click();
  await expect(page.getByLabel("Moss project API key", { exact: true })).toHaveValue("");
  await expect(page.getByRole("button", { name: "Connect my project", exact: true })).toBeDisabled();
  await page.getByRole("checkbox", { name: /Create a new playbook/ }).check();
  await expect(page.getByLabel("New index name", { exact: true })).toHaveValue(/^raksha-demo-/);
  await expect(page.getByText(/This uses your Moss project/)).toBeVisible();
});

test("Moss settings API rejects cross-site requests, missing consent and oversized input", async ({ request, baseURL }) => {
  const input = { projectId: "test-project", projectKey: "invalid-test-key", indexName: "raksha-playbook", createIndex: false, consent: false };
  expect((await request.post("/api/moss", { data: input, headers: { Origin: "https://other.example" } })).status()).toBe(403);
  expect((await request.delete("/api/moss", { headers: { Origin: "https://other.example" } })).status()).toBe(403);
  expect((await request.post("/api/moss", { data: input, headers: { Origin: baseURL! } })).status()).toBe(400);
  expect((await request.post("/api/moss", { data: { ...input, projectKey: "x".repeat(5000) }, headers: { Origin: baseURL! } })).status()).toBe(413);
  const response = await request.get("/api/moss");
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(await response.json()).toMatchObject({ status: "disconnected" });
});

test("an already-open Shield rechecks the selected project before starting a new call", async ({ page }) => {
  let selected = false;
  await page.route("**/api/moss", route => route.fulfill({ json: selected ? { status: "ready", token: "f".repeat(64), sharedMode: "mock" } : { status: "disconnected", sharedMode: "mock" } }));
  await page.goto("/shield?scenario=digital-arrest&silent=1&fast=1");
  const start = page.getByRole("button", { name: "Start the call", exact: true });
  await expect(start).toBeEnabled();
  selected = true;
  await start.click();
  await expect(page.getByRole("alert").filter({ hasText: "Moss session ended" })).toBeVisible();
  await expect(start).toBeEnabled();
});
