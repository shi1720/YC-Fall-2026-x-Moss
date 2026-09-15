import type { Metadata } from "next";
import { LabApp } from "./LabApp";

export const metadata: Metadata = { title: "Latency lab" };

export default function LabPage() {
  return <LabApp />;
}
