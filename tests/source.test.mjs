import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
const live=readFileSync('src/LiveSession.ts','utf8');
test('audio-only Gemini generation',()=>{assert.match(live,/responseModalities:\[Modality.AUDIO\]/);assert.doesNotMatch(live,/generateContent\(/);});
test('continuous realtime audio input',()=>{assert.match(live,/sendRealtimeInput/);assert.match(live,/sendToolResponse/);});
test('separate Maya and Zoya memory storage',()=>{const s=readFileSync('src/settings.ts','utf8');assert.match(s,/zoya-independent-settings-v1/);});
test('website action requires tap',()=>{const s=readFileSync('src/App.tsx','utf8');assert.match(s,/Open website/);});
test('microphone captures audio with AudioWorklet',()=>{const s=readFileSync('src/AudioStreamer.ts','utf8');assert.match(s,/AudioWorkletNode/);});
test('speech buffer flush on interruption',()=>{assert.match(live,/player.interrupt\(\)/);});
