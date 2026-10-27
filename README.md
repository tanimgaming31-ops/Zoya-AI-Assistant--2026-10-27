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

## Android install shortcut (PWA)

Zoya now has a web app manifest, generated 192px/512px icons, and a service worker that caches the **UI only**. Once the site is published over HTTPS, open it in Android Chrome > three-dot menu > **Add to Home screen** / **Install app**. This creates a web app shortcut, **not an APK**. Live Gemini audio does not work offline.

Each GitHub Actions run also uploads **zoya-complete-source** (source ZIP, nested) and **zoya-built-website** (production website ZIP) from the current commit. The GitHub Pages Source selection requires repository-owner access. The workflow does not falsely claim that Pages is live when it is disabled.

To protect your key, never put it in GitHub files. About Me is saved only in Zoya local browser storage and sent to Gemini as voice-call context. No Maya settings or memories are accessed.

## Install as a REAL Android APK (no PC)
This repository now contains a Capacitor v7 Android build workflow. Open [GitHub Actions > Build Zoya Android APK](https://github.com/tanimgaming31-ops/Zoya-AI-Assistant--2026-10-27/actions/workflows/android-apk.yml), run workflow on `main`, and download its `Zoya-AI-Assistant-Android-APK` artifact. Unzip once and tap the `app-debug.apk` file in Android Downloads to install it. Use the device's Install unknown apps permission only for your trusted GitHub-generated APK.

It is **a debug-signed APK, not a Google Play signed production release**; repeat builds may have different debug signing certificates on GitHub runners, meaning reinstall may require uninstalling an old debug build (back up About Me first). The native WebView includes the UI and uses Capacitor's native WebChromeClient for microphone permission; no guarantee of phone-model-specific audio support before a real device test. API key and internet access are still required for Gemini Live. This is not a background service or a direct WhatsApp controller.
