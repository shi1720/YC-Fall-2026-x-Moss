"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, KeyRound, LoaderCircle, LockKeyhole, Unplug } from "lucide-react";
import { readMossStatus, type MossStatus } from "@/lib/client/moss";

export function SettingsApp() {
  const [status, setStatus] = useState<MossStatus | null>(null);
  const [projectId, setProjectId] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const [indexName, setIndexName] = useState("raksha-playbook");
  const [createIndex, setCreateIndex] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    const refresh = () => { void readMossStatus().then(s => { if (!cancelled) setStatus(s); }).catch(e => { if (!cancelled) setError(e.message); }); };
    refresh();
    const timer = setInterval(refresh, 2500);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  async function connect(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/moss", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, projectKey, indexName, createIndex, consent }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not connect to Moss.");
      setProjectKey(""); setProjectId(""); setConsent(false);
      setStatus(await readMossStatus());
      window.dispatchEvent(new Event("raksha-moss-changed"));
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function disconnect() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/moss", { method: "DELETE" });
      if (!response.ok) throw new Error("Could not disconnect. Please retry.");
      setProjectKey(""); setProjectId(""); setConsent(false);
      setStatus(await readMossStatus());
      setNotice("Disconnected. Your server session is removed. Any playbook you created stays in your Moss project. Reload an open Shield tab before starting another call.");
      window.dispatchEvent(new Event("raksha-moss-changed"));
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  const attached = status && status.status !== "disconnected";
  const connecting = status?.status === "connecting";
  const ready = status?.status === "ready";
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="chip chip-saffron"><KeyRound className="h-3.5 w-3.5" /> Your project. Real Moss retrieval.</div>
      <h1 className="display mt-4 text-4xl text-text sm:text-5xl">Make the demo your own.</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">Explore Raksha without a key, or connect your own Moss project to test live semantic retrieval. The shared demo currently uses an offline text detector. Its matches and timings are not Moss results.</p>

      <div className="mt-8 grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <section className="card card-strong p-5 sm:p-7" aria-label="Moss connection">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-moss/10 p-2.5"><KeyRound className="h-5 w-5 text-moss" /></div><div><h2 className="text-lg font-semibold">Connect to Moss</h2><p className="text-sm text-muted">Applies to this browser’s Shield, Playbook and Lab.</p></div></div>
          {status === null && !error && <p role="status" className="mt-5 text-muted">Loading connection status…</p>}
          {attached ? (
            <div className="mt-6">
              <div role="status" className={`rounded-2xl border p-4 ${ready ? "border-moss/30 bg-moss/5" : "border-line bg-white/[0.03]"}`}>
                <div className="flex items-center gap-2 font-semibold">{connecting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : ready ? <CheckCircle2 className="h-4 w-4 text-moss" /> : <Unplug className="h-4 w-4" />}{ready ? "Your Moss project is connected" : connecting ? "Setting up your project" : status.status === "expired" ? "Your session has expired" : "Connection needs attention"}</div>
                <p className="mt-2 text-sm text-muted">{status.error ?? (status.status === "expired" ? "Sessions end after 30 minutes or a server restart. Disconnect, then enter your key again to reconnect." : status.phase)}</p>
                {status.indexName && <p className="mono mt-3 break-all text-xs text-muted">Index: {status.indexName}</p>}
                {ready && <p className="mt-2 text-sm text-moss">{status.runtime?.docCount} playbook lines loaded · {status.runtime?.model}</p>}
                {ready && status.expiresAt && <p className="mt-2 text-xs text-faint">Session ends at {new Date(status.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Credentials are not saved for next time.</p>}
              </div>
              {ready && <div className="mt-4 flex flex-wrap gap-2"><a href="/shield?silent=1" className="btn btn-primary">Test the shield <ArrowRight className="h-4 w-4" /></a><a href="/lab" className="btn btn-ghost">Measure in the lab</a></div>}
              <button className="btn btn-ghost mt-5" disabled={busy} onClick={() => void disconnect()}><Unplug className="h-4 w-4" /> {connecting ? "Cancel and disconnect" : "Disconnect and use demo"}</button>
              <p className="mt-3 text-xs leading-relaxed text-faint">Disconnect stops access to this project, including any open calls using it. Created cloud indexes are kept in your project. Community publishing is disabled for personal sessions.</p>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={connect}>
              <label className="block text-sm font-medium">Moss project ID<input className="input mt-2" value={projectId} onChange={e => setProjectId(e.target.value)} required maxLength={128} pattern={"[a-zA-Z0-9_\\-]+"} autoComplete="off" spellCheck={false} placeholder="Your project ID" disabled={busy} /></label>
              <label className="block text-sm font-medium">Moss project API key<input className="input mt-2" type="password" value={projectKey} onChange={e => setProjectKey(e.target.value)} required minLength={10} maxLength={512} autoComplete="off" spellCheck={false} placeholder="Your project key" disabled={busy} /></label>
              <fieldset className="rounded-xl border border-line p-4"><legend className="px-1 text-sm font-medium">Playbook setup</legend>
                <label className="flex cursor-pointer items-start gap-2 text-sm"><input className="mt-1 accent-saffron" type="checkbox" checked={createIndex} disabled={busy} onChange={e => { setCreateIndex(e.target.checked); setIndexName(e.target.checked ? `raksha-demo-${Date.now().toString(36)}` : "raksha-playbook"); }} /><span>Create a new playbook in my Moss project<span className="mt-1 block text-xs leading-relaxed text-muted">Uploads Raksha’s 409 curated lines using moss-minilm. This uses your Moss project’s credits. Existing indexes are never overwritten.</span></span></label>
                <label className="mt-4 block text-sm">{createIndex ? "New index name" : "Existing Raksha index name"}<input className="input mt-2" value={indexName} onChange={e => setIndexName(e.target.value)} required maxLength={80} pattern={"[a-zA-Z0-9_\\-]+"} autoComplete="off" spellCheck={false} disabled={busy} /></label>
                {!createIndex && <p className="mt-2 text-xs leading-relaxed text-muted">Use an index created from the current Raksha playbook with moss-minilm. Setup checks its contents before enabling detection.</p>}
              </fieldset>
              <label className="flex items-start gap-2 text-xs leading-relaxed text-muted"><input className="mt-1 accent-saffron" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required disabled={busy} /><span>I allow Raksha’s server to use this project key for this session. Moss setup may consume my project’s credits, including creating the playbook if selected.</span></label>
              <button className="btn btn-primary w-full" disabled={busy || !consent || status === null}>{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}{busy ? "Connecting…" : createIndex ? "Create playbook and connect" : "Connect my project"}</button>
            </form>
          )}
          {error && <p role="alert" className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger-2">{error}</p>}
          {notice && <p role="status" className="mt-4 text-sm text-moss">{notice}</p>}
        </section>
        <aside className="space-y-5">
          <div className="card p-5 sm:p-6"><h2 className="text-lg font-semibold">Three steps to a live test</h2><ol className="mt-4 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-muted"><li>Get your project ID and project API key from <a href="https://moss.dev" target="_blank" rel="noreferrer" className="text-saffron underline">Moss</a>. The project needs available credits.</li><li>Connect an existing Raksha index, or create a new playbook here. Wait for the green connected state.</li><li>Open the Shield or Latency lab. Check that the runtime says <strong className="text-moss">Your Moss project</strong> before interpreting results.</li></ol></div>
          <div className="card p-5 sm:p-6"><h2 className="flex items-center gap-2 text-base font-semibold"><LockKeyhole className="h-4 w-4 text-moss" /> How your key is handled</h2><p className="mt-3 text-sm leading-relaxed text-muted">Your key travels over HTTPS to Raksha and is used to authenticate with Moss. It stays in server memory for up to 30 minutes, or until you disconnect or the server restarts. Raksha does not write it to disk, browser storage or application logs.</p><p className="mt-3 text-sm leading-relaxed text-muted">Your project is separate from other visitors. A temporary session cookie connects this browser to it. Two personal Moss sessions can run at once on this prototype.</p><p className="mt-3 text-xs leading-relaxed text-faint">No key? The complete guided demo is still available. The labeled text detector is a different retrieval method, so it is not a Moss benchmark.</p></div>
          <a href="/shield?silent=1" className="btn btn-ghost w-full">Continue to the demo <ArrowRight className="h-4 w-4" /></a>
        </aside>
      </div>
    </div>
  );
}
