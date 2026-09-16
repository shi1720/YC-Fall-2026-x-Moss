import { describe, expect, it } from "vitest";
import { wsUrl } from "@/lib/utils";

describe("wsUrl", () => {
  it("routes the socket to an explicit origin (Firebase Hosting in front of Cloud Run)", () => {
    expect(wsUrl("https://raksha-123.asia-south1.run.app")).toBe("wss://raksha-123.asia-south1.run.app/ws");
    expect(wsUrl("http://localhost:3000/")).toBe("ws://localhost:3000/ws");
  });
  it("falls back to the page origin when none is configured", () => {
    expect(wsUrl(null)).toBe(typeof window === "undefined" ? "" : `ws://${window.location.host}/ws`);
  });
});
