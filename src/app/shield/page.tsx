import type { Metadata } from "next";
import { ShieldApp } from "./ShieldApp";

export const metadata: Metadata = { title: "Shield" };

export default async function ShieldPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const scenario = typeof sp.scenario === "string" ? sp.scenario : undefined;
  const flag = (k: string) => sp[k] === "1" || sp[k] === "true";
  return <ShieldApp initialScenario={scenario} initialSilent={flag("silent")} initialFast={flag("fast")} />;
}
