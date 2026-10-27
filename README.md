# Zoya AI Assistant

A completely **separate** mobile-first AI voice companion built in React, TypeScript, Tailwind and Vite. Gemini Live audio-only conversation, PCM16 microphone 16kHz, response playback 24kHz, interrupt handling, Gemini tool calling, website and search requests (user approves with a tap), editable Zoya-only About Me, and dark holographic mobile UI.

## Use on Android (no PC)
1. In GitHub open **Settings > Pages > Build and deployment > Source: GitHub Actions**.
2. Open **Actions > Zoya Build and Deploy** and run the workflow, or push to main.
3. Open your HTTPS GitHub Pages URL in Chrome and allow microphone access.
4. Tap Zoya Settings, enter your own Gemini API key (never commit the key to GitHub), edit About Me and Save Changes.
5. Tap the microphone to start a real voice session.

## Important limitations
This is a web application, not an APK. It cannot control arbitrary installed Android apps, send WhatsApp messages, or operate reliably with the browser closed. Browser local storage is not fully secure for API keys; use a restricted key. User About Me from Maya was not automatically copied; that text was unavailable and is left editable rather than fabricated. The profile is included in the prompt sent to Google during voice sessions.

Live API availability, pricing, quotas and voice model support depend on Google. A supported HTTPS Android browser and user microphone permission are required. No guaranteed Gemini voice call has yet been tested on the user's phone.

## Local tests
```sh
npm install
npm test
npm run build
```

## Build and deployment status

The source compiles and the GitHub Actions tests passed on October 27, 2026. The workflow always uploads a downloadable `zoya-built-website` ZIP, including while GitHub Pages is disabled.

**One owner-only action is still required:** Open [the repository GitHub Pages settings](https://github.com/tanimgaming31-ops/Zoya-AI-Assistant--2026-10-27/settings/pages), choose **GitHub Actions** as the Build and deployment Source, then run the [Zoya Build and Deploy workflow](https://github.com/tanimgaming31-ops/Zoya-AI-Assistant--2026-10-27/actions/workflows/deploy.yml). ChatGPT's GitHub integration can push files, but cannot activate repository Pages configuration on your behalf.

Default Gemini model is `gemini-3.8-live`. Switch to the original `gemini-3.1-flash-live-preview` in Settings only if you specifically need the legacy preview. Neither model will talk until a user supplies a valid key and opens the app over HTTPS.
