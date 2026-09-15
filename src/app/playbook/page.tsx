import type { Metadata } from "next";
import { PlaybookApp } from "./PlaybookApp";

export const metadata: Metadata = { title: "Playbook" };

export default function PlaybookPage() {
  return <PlaybookApp />;
}
