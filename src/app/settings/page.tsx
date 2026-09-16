import type { Metadata } from "next";
import { SettingsApp } from "./SettingsApp";
export const metadata: Metadata = { title: "Moss settings" };
export default function SettingsPage() { return <SettingsApp />; }
