import type { Metadata } from "next";
import { ShieldApp } from "./ShieldApp";

export const metadata: Metadata = { title: "Shield" };

export default async function ShieldPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const scenario = typeof sp.scenario === "string" ? sp.scenario : undefined;
  return <ShieldApp initialScenario={scenario} />;
}
