import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zoya.aiassistant',
  appName: 'Zoya AI Assistant',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#070512'
  }
};
export default config;
