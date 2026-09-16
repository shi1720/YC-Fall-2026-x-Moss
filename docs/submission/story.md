## Inspiration

A scam call does not need to sound suspicious at first. It needs to keep someone frightened, isolated and talking long enough to make one irreversible mistake.

We wanted to help at that moment. Raksha means protection. It is a second listener that recognises familiar pressure tactics and helps a person pause, verify and reach someone they trust.

The YC Fall 2026 themes of real-time voice, collaborative agents and agent reliability shaped the idea. Moss made a useful design possible: check each spoken fragment locally inside the server process, without waiting for a remote vector database or an LLM verdict.

## What it does

Raksha is a browser-based scam-call shield. Try one of 18 scripted calls, listen through a supported browser microphone, or upload a recording for transcription.

As the conversation unfolds, Raksha compares its words with a 409-line playbook. The risk engine looks for combinations such as claimed authority, urgency, secrecy and a request for money, codes or remote access. It shows the evidence behind the warning and gives the person a short sentence to end the call.

A trusted guardian can open a shared family link, follow the same call, send a message to the shield and search the current conversation. A separate latency lab lets anyone measure the running retrieval layer and distinguish server analysis time from browser network time.

Raksha is a working prototype and a decision aid. It does not intercept mobile calls or hang up for you. A safe score means no recognised pattern was found, not that a caller has been verified.

## How we built it

The app uses Next.js, React and TypeScript with a custom Node.js WebSocket server. Firebase Hosting provides the clean public URL. Google Cloud Run runs the app, the call manager and the Moss runtime in one process.

Moss loads the curated scam playbook into memory. Each fragment is embedded and retrieved in-process. A deterministic risk engine combines the detected tactics and checks legitimate look-alikes before raising an intervention. A Groq-hosted language model provides plain-language coaching outside the critical detection path.

Moss sessions hold current-call context with call-specific metadata filters for guardian questions. Optional community reports add flagged caller lines to a second index. Multi-index retrieval and automatic refresh let that knowledge become available without rebuilding the application.

The public demo uses one bounded Cloud Run instance because the guardian connections and call state are in process memory. A distributed production deployment would require shared routing and state. Browser speech recognition powers live microphone mode, and Groq Whisper transcribes uploaded recordings.

## Challenges we ran into

The hard problem was avoiding a warning every time someone said “OTP” or “payment.” A legitimate bank might say it will never ask for an OTP. A real courier might ask for a delivery code at the door. We added benign look-alikes and tested entire conversations, not just suspicious keywords.

Keeping the experience responsive also meant separating detection from explanation. Retrieval and the deterministic warning run first. Coaching arrives independently.

Final rollout also exhausted the Moss project's cloud credits. We preserved a clearly labeled offline detector, separated its timings from Moss benchmarks, and documented the service dependency. Earlier hosted verification had already exercised the real Moss runtime.

Deployment exposed practical problems too. Firebase Hosting does not proxy the app's WebSocket connection, so the browser resolves the Cloud Run socket endpoint separately. We also fixed startup races, interrupted speech playback, post-call reporting, reconnect behaviour, input validation and mobile overflow.

## Accomplishments that we're proud of

- A complete phone-and-guardian workflow with a live risk dial, transcript evidence and specific next steps.
- Meaningful use of Moss for playbook retrieval, filtered call memory, multi-index search and refreshed community knowledge.
- A committed scripted evaluation covering 18 calls and 264 utterances. It detected all ten scripted scam calls and raised no danger alert on the eight genuine calls. These are fixture results, not a claim of real-world accuracy.
- A public latency lab that shows measurements from the running server rather than presenting a fixed animation as a benchmark.
- An accessible, responsive demo with no account required and clear error recovery.

## What we learned

Speed matters when the product needs to interrupt before someone acts. But a fast warning only helps if it is understandable and supported by evidence.

We also learned that a trusted person belongs in the product. A guardian saying “hang up, I am calling you” can be more useful than another risk score.

Finally, privacy claims must match the implementation. Live mode sends transcript text to Raksha; browser speech services may process audio. Uploaded recordings pass through Raksha to Groq. Completed call records remain in RAM for up to ten minutes, and sharing flagged caller lines is an explicit action.

## What's next for Raksha

Next we want to evaluate with consented conversations outside our scripted set, measure false alarms across accents and languages, add Hindi and other Indian languages, and test the experience with older adults and their families.

Before broader use, we would add signed guardian invitations, moderation for community reports, stronger abuse controls, shared session routing and an on-device speech option. Native calling integration remains a separate future step.

Our goal is simple: give someone a moment to pause before a scam becomes a loss.
