import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
import {join,dirname} from 'node:path';

const root='android/app/src/main';
const manifest=join(root,'AndroidManifest.xml');
if(!existsSync(manifest))throw Error('Capacitor Android project has not been created.');
let xml=readFileSync(manifest,'utf8');
const needed=[
 'android.permission.RECORD_AUDIO',
 'android.permission.MODIFY_AUDIO_SETTINGS',
 'android.permission.INTERNET',
 'android.permission.FOREGROUND_SERVICE',
 'android.permission.FOREGROUND_SERVICE_MICROPHONE',
 'android.permission.POST_NOTIFICATIONS'
];
for(const name of needed)if(!xml.includes('android:name="'+name+'"')){
 xml=xml.replace('<application', '<uses-permission android:name="'+name+'" />\n    <application');
}
if(!xml.includes('android.hardware.microphone')){
 xml=xml.replace('<application', '<uses-feature android:name="android.hardware.microphone" android:required="false" />\n    <application');
}
if(!xml.includes('ZoyaForegroundService')){
 xml=xml.replace('</application>', '  <service android:name=".ZoyaForegroundService" android:exported="false" android:foregroundServiceType="microphone" />\\n    </application>');
}
writeFileSync(manifest,xml);
// Capacitor BridgeWebChromeClient natively handles WebView's AUDIO_CAPTURE permission request.
// The AndroidManifest RECORD_AUDIO permission above is required for the runtime prompt.
// Do not replace the Bridge's WebChromeClient with a permissive blanket-grant handler.
const packageDir=join(root,'java/com/zoya/aiassistant');
mkdirSync(packageDir,{recursive:true});
writeFileSync(join(packageDir,'MainActivity.java'),\`package com.zoya.aiassistant;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(ZoyaBackgroundPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
\`);
writeFileSync(join(packageDir,'ZoyaBackgroundPlugin.java'),\`package com.zoya.aiassistant;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ZoyaBackground")
public class ZoyaBackgroundPlugin extends Plugin {
  @PluginMethod
  public void start(PluginCall call) {
    Context ctx = getContext();
    if (ContextCompat.checkSelfPermission(ctx, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
      call.reject("Microphone permission must be approved before background service can start.");
      return;
    }
    try {
      Intent intent = new Intent(ctx, ZoyaForegroundService.class);
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) ctx.startForegroundService(intent);
      else ctx.startService(intent);
      JSObject result = new JSObject();
      result.put("running", true);
      call.resolve(result);
    } catch (Exception e) {
      call.reject("Android blocked the foreground service: " + e.getMessage());
    }
  }
  @PluginMethod
  public void stop(PluginCall call) {
    getContext().stopService(new Intent(getContext(), ZoyaForegroundService.class));
    JSObject result = new JSObject();
    result.put("running", false);
    call.resolve(result);
  }
  @PluginMethod
  public void status(PluginCall call) {
    JSObject result = new JSObject();
    result.put("running", ZoyaForegroundService.running);
    call.resolve(result);
  }
}
\`);
writeFileSync(join(packageDir,'ZoyaForegroundService.java'),\`package com.zoya.aiassistant;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

public class ZoyaForegroundService extends Service {
  public static volatile boolean running = false;
  private static final String CHANNEL = "zoya_voice_notification";
  private static final int NOTIFICATION_ID = 124;
  private static final String STOP_ACTION = "com.zoya.aiassistant.STOP_BACKGROUND";
  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    if (intent != null && STOP_ACTION.equals(intent.getAction())) {
      stopSelf();
      return START_NOT_STICKY;
    }
    NotificationManager manager = getSystemService(NotificationManager.class);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel = new NotificationChannel(CHANNEL, "Zoya voice session", NotificationManager.IMPORTANCE_LOW);
      channel.setDescription("Visible notification while a user-started Zoya call is active");
      manager.createNotificationChannel(channel);
    }
    Intent open = new Intent(this, MainActivity.class);
    open.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    PendingIntent openPending = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    Intent stop = new Intent(this, ZoyaForegroundService.class);
    stop.setAction(STOP_ACTION);
    PendingIntent stopPending = PendingIntent.getService(this, 1, stop, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    Notification notification = new Notification.Builder(this, CHANNEL)
      .setContentTitle("Zoya voice session")
      .setContentText("Tap to return to Zoya. Android may pause audio while locked.")
      .setSmallIcon(getApplicationInfo().icon)
      .setContentIntent(openPending)
      .addAction(android.R.drawable.ic_media_pause, "Stop", stopPending)
      .setOngoing(true)
      .build();
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
        startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE);
      else startForeground(NOTIFICATION_ID, notification);
      running = true;
    } catch (RuntimeException blocked) {
      running = false;
      stopSelf();
    }
    return START_NOT_STICKY;
  }
  @Override public void onDestroy() {
    running = false;
    super.onDestroy();
  }
  @Override public IBinder onBind(Intent intent) { return null; }
}
\`);
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
