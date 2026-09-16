# Test Raksha

Live app: https://raksha-app.web.app
No account or API key is required.

1. Open https://raksha-app.web.app/shield?scenario=digital-arrest&silent=1&fast=1.
2. Wait for Connected, then select Start the call. A scripted scam should raise an intervention. The warning explains the pattern and supplies words to say. Choose I hung up to end the simulation.
3. Before starting another call, open the guardian link from Circle of trust in a second tab. Start the digital-arrest scenario. The guardian should receive the same risk and transcript. Send a message and ask “what did they ask for?” while the call is active.
4. Use the Genuine calls filter and choose Genuine hospital call. Let it finish. It should stay Safe.
5. Open Playbook and search “read me the six digit code quickly.” Inspect matching tactics and measured retrieval time.
6. Open Latency lab, choose 1 x 10 queries and Run. Compare engine search, embedding plus search, and browser round-trip time.
7. For live microphone testing, use a supported Chrome, Edge or Safari speech service and allow microphone access. Use a second device on speaker or read a sample phrase aloud. The app cannot directly intercept a cellular call.
8. For recording testing, upload a short, non-sensitive MP3, M4A, WAV or WebM file smaller than 25 MB. It goes to Groq for transcription. Empty files and unsupported file types return actionable errors.

Community reporting shares flagged caller text to a Moss index. Avoid personal information. A family code grants access to that phone's current calls, so share it only with someone you trust.

The committed evaluation uses scripted conversations. Its results do not establish real-world detection accuracy. Speech recognition and LLM providers can fail; the interface reports errors rather than promising continuous protection.

## Current runtime note

Moss cloud credits were exhausted during final rollout on 16 September. If the app shows **Offline detector active**, the fallback remains usable, but its timings and text matches are not Moss benchmarks. Restore credits on the existing Moss project to enable automatic recovery. The final video discloses this mode.
