import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
import {join,dirname} from 'node:path';

const root='android/app/src/main';
const manifest=join(root,'AndroidManifest.xml');
if(!existsSync(manifest))throw Error('Capacitor Android project has not been created.');
let xml=readFileSync(manifest,'utf8');
const needed=[
 'android.permission.RECORD_AUDIO',
 'android.permission.MODIFY_AUDIO_SETTINGS',
 'android.permission.INTERNET'
];
for(const name of needed)if(!xml.includes('android:name="'+name+'"')){
 xml=xml.replace('<application', '<uses-permission android:name="'+name+'" />\n    <application');
}
if(!xml.includes('android.hardware.microphone')){
 xml=xml.replace('<application', '<uses-feature android:name="android.hardware.microphone" android:required="false" />\n    <application');
}
writeFileSync(manifest,xml);
// Capacitor BridgeWebChromeClient natively handles WebView's AUDIO_CAPTURE permission request.
// The AndroidManifest RECORD_AUDIO permission above is required for the runtime prompt.
// Do not replace the Bridge's WebChromeClient with a permissive blanket-grant handler.
const packageDir=join(root,'java/com/zoya/aiassistant');
mkdirSync(packageDir,{recursive:true});
writeFileSync(join(packageDir,'MainActivity.java'),`package com.zoya.aiassistant;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  // Uses Capacitor's built-in WebChromeClient for explicit Android microphone permissions.
}
`);
for(const [density,size] of [['mdpi',48],['hdpi',72],['xhdpi',96],['xxhdpi',144],['xxxhdpi',192]]){
 const folder=join(root,'res','mipmap-'+density);
 mkdirSync(folder,{recursive:true});
 const png=join('public','icon-'+size+'.png');
 if(!existsSync(png))throw Error('Missing launcher icon: '+png);
 for(const file of ['ic_launcher.png','ic_launcher_round.png']){
  copyFileSync(png,join(folder,file));
 }
}
// Match the adaptive icon foreground to Zoya instead of the default Capacitor logo.
const drawable=join(root,'res','drawable');
mkdirSync(drawable,{recursive:true});
writeFileSync(join(drawable,'ic_launcher_foreground.xml'),`<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
 android:width="108dp" android:height="108dp"
 android:viewportWidth="108" android:viewportHeight="108">
 <path android:fillColor="#F7D8FF"
   android:pathData="M33,29 L75,29 L75,41 L44,65 L75,65 L75,78 L33,78 L33,66 L64,42 L33,42 Z"/>
</vector>
`);
console.log('Zoya-only native Android app, permissions, and launcher icons configured.');
