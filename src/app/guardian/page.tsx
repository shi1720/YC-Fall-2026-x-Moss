import type { Metadata } from "next";
import { GuardianApp } from "./GuardianApp";

export const metadata: Metadata = { title: "Guardian" };

export default async function GuardianPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const code = typeof sp.code === "string" ? sp.code.toUpperCase() : undefined;
  return <GuardianApp initialCode={code} />;
}
