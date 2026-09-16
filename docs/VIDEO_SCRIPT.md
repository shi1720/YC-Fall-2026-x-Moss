# Raksha. demo video script

Two cuts: a **3-minute main video** (the submission) and a **60-second teaser**. Read the *Voice-over* column verbatim; the *On screen* column tells you what to record. Record at 1080p, browser at 125% zoom so the text is legible, voices on for the simulation. Total speaking pace: about 150 words per minute.

Set-up before recording: open `/shield?scenario=digital-arrest` in one window and the guardian link (copied from the *Circle of trust* card) in a second window side-by-side. Have `/playbook` and `/lab` in background tabs. Keep the system volume up so the simulation's voices and the shield's spoken intervention are captured.

---

## Main video (≈ 3:15)

| # | Time | On screen | Voice-over (say this verbatim) |
|---|---|---|---|
| 1 | 0:00–0:12 | Black screen, then a phone ringing. Cut to the Raksha landing page hero. | Last year Indians reported twenty-two thousand crore rupees lost to cyber fraud. One scam alone. the "digital arrest". took nineteen hundred crore from a hundred and twenty thousand people. Most of them were on the phone, alone, frightened, and told not to tell anyone. |
| 2 | 0:12–0:25 | Scroll to the "Caller-ID tells you who is calling" section. | Every one of those calls followed a script. Authority. Fear. Secrecy. Then the ask. But today's protection is caller-ID: it tells you *who* is calling. Nobody tells you what they are *doing to you*. |
| 3 | 0:25–0:35 | Cut to the shield page, idle. Cursor over the risk dial. | I'm Shivam. This is Raksha. a shield that listens with you during a call, recognises the scam script in under ten milliseconds, and steps in before you read out the OTP. Let me show you a digital arrest, stopped. |
| 4 | 0:35–1:20 | Click **Start the call**. Let the two voices play. Follow the transcript: tactic chips appear under each line, the dial climbs, the amber "Careful" toast appears. | The caller says he's from the Mumbai Crime Branch. Watch the line. "Authority", "Legal threat". Each fragment of speech is embedded and matched against four hundred lines of real scam scripts, inside the process, in about ten milliseconds. That's Moss. No vector database, no network round-trip. The dial is already moving. Now he says: don't tell your son. "Secrecy", "Isolation". Pressure is building. but there's no ask yet. |
| 5 | 1:20–1:45 | The red overlay fires on "download Skype… keep your camera on". Let the shield's voice speak. Pause on the overlay. | And there it is. The moment pressure meets an ask, the shield interrupts. mid-sentence. It names the script. It gives Sunita one sentence to say. And it tells her exactly what to do: hang up, call 1930. This is the intervention that caller-ID can never make. |
| 6 | 1:45–2:10 | Switch to the guardian window. Show the dial at Danger, the interventions list. Type "Mummy, hang up. I'm calling you now." and send. Cut back to the shield: the message appears and is spoken. Then in the guardian, click "What money did they ask for?" and show the answer with its latency. | Scams work by isolating the victim. Raksha breaks the isolation. Her daughter Anita sees the same call, live. She can speak through the shield. her words are read aloud over the scammer's. And she can ask the call's memory a question. That answer comes from a Moss session: a local index of this call's own turns, queried in milliseconds and thrown away when the call ends. |
| 7 | 2:10–2:30 | Click **Keep listening**; let the "Do NOT transfer any money" targeted warning fire on the RBI account line. Then **I hung up**. Show the summary card and click **Report this script to protect others**. | If she keeps listening, the warnings get specific: *do not transfer any money*. When she hangs up, she gets a plain summary. and one tap sends the caller's lines to a community index. Every running shield hot-swaps that index in. A new script variant protects everyone within minutes, with no redeploy. |
| 7b | 2:30–2:45 | Switch to **Live mic**, put a second phone on speaker (a friend reads two lines from the digital-arrest script: "This is the Mumbai Crime Branch, a parcel with drugs was booked in your name" then "Do not tell anyone, transfer the money to the verification account"). Show the dial and the overlay firing from live speech. | And this is not only a simulation. Live microphone, a real phone on speaker: the same script, spoken by a person, is caught the same way. |
| 8 | 2:45–3:00 | Latency lab: run 5 × 10 queries; hover the p50/p95 tiles and the "share of a sentence" bar. Then the evaluation table: 10 of 10 scams caught, 0 of 8 genuine calls flagged. | Speed isn't a feature here; it's the product. A cloud vector search would spend a third of a sentence on the network. Moss answers in the time it takes to say one syllable, at zero marginal cost. so we check every fragment of every call. And on our evaluation of eighteen scripted calls, every scam script is caught, and all eight genuine calls stay green. |
| 9 | 3:00–3:15 | Landing page "Who pays" card, then the closing card with the GitHub URL. | Banks will carry the cost of these scams from next year; telcos want a protected line on every phone, not just a Pixel; and families will pay to protect their parents. The runtime costs two paise per protected call. Every scam follows a script. Now the phone knows the script. This is Raksha. |

---

## 60-second teaser

| # | Time | On screen | Voice-over |
|---|---|---|---|
| 1 | 0:00–0:08 | Landing hero. | Every scam follows a script. Authority, fear, secrecy. then the ask. Nobody protects you *during* the call. Until now. |
| 2 | 0:08–0:35 | Shield: start the digital-arrest call, fast-forward through the first lines, land on the red overlay with the spoken "Stop". | Raksha listens with you. Each fragment is matched against four hundred real scam lines, in-process with Moss, in about ten milliseconds. The moment pressure meets an ask. it interrupts, names the script, and tells you what to say. |
| 3 | 0:35–0:50 | Guardian window: message sent, spoken on the shield; ask-the-call answer. | Your family sees it live, speaks through the shield, and can ask the call's memory a question. a Moss session that dies when the call ends. |
| 4 | 0:50–1:00 | Latency lab tiles; closing card. | About ten milliseconds. Two paise a call. Every phone, not just a Pixel. Raksha. the real-time scam-call shield. |

---

## Recording notes

* **Voices.** Chrome's built-in voices work well: the simulation uses a lower-pitched voice for the caller and a higher one for the person. If your OS has "Google UK English Male/Female" installed the result is cleaner.
* **Timing.** With voices on, the digital-arrest scenario takes ~2.5 minutes to play in full; you only need the first ~50 seconds for shots 4–5. Use *Pause* liberally while you speak.
* **If the overlay fires before you're ready**, click *Keep listening* and continue; the next ask will fire it again.
* **Latency numbers.** Run the Latency lab against the deployed instance (Moss runtime), not the offline fallback; the runtime badge in the shield header says which is active.
* **Captions.** Burn in the "Say this" sentence as a lower-third when the overlay appears; it is the emotional peak of the video.
* **Credits card (last 3 s).** "Raksha · Shivam Gupta · built with Claude · retrieval by Moss · YC Fall 2026 × Moss Builder Sprint · github.com/shi1720/YC-Fall-2026-x-Moss".
