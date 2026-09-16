# Test Raksha

Live app: https://raksha-app.web.app
No account or key is required for the guided demo. Live Moss retrieval requires your own Moss project ID, project API key and available credits.

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

## Test live Moss retrieval with your own project

1. Open https://raksha-app.web.app/settings.
2. Enter your Moss project ID and project API key. If you do not already have the current Raksha playbook, select **Create a new playbook in my Moss project**. This uploads the 409 curated lines with `moss-minilm` and may consume your project's credits. Existing indexes are not overwritten.
3. Confirm the connection consent and connect. Setup runs in the background and checks the dataset before enabling detection. Wait for **Your Moss project is connected**.
4. Open the Shield from Settings and repeat the guided call. Then run Playbook search and a small Lab benchmark. The banner must say **Your Moss project**; these queries use your selected project. Guardians use the protected call's runtime automatically and do not need its key.
5. Choose **Disconnect and use demo** to remove your server session. Reload any open Shield tab before starting another call. Created cloud indexes remain in your Moss project.

Keys are sent over HTTPS to Raksha and used to authenticate with Moss. Raksha holds them in server memory for up to 30 minutes, until disconnect or a server restart. It does not save them in browser storage, application logs or files. A temporary session cookie identifies this browser. The prototype permits two private Moss sessions at once; if both are busy, use the guided demo or try later. Community publishing is disabled for personal sessions.

## Demo mode and evidence

The shared public deployment intentionally uses its labeled offline TF-IDF detector. Its text matches and timings are not Moss benchmarks. You do not need to restore the developer's shared Moss credits: connect your own funded project to test the real retrieval path.

The existing video shows the offline demo before Settings was added. Earlier hosted evaluation used real Moss. Current settings validation includes SDK-isolated unit tests and browser tests; a successful live connection with a newly funded visitor project has not been verified in this release because no such credentials were available. This limit is separate from the earlier real-Moss evidence.
