import type { CapacitorConfig } from '@capacitor/cli';

/// <reference types="@capacitor-firebase/authentication" />

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'saber-libre',
  webDir: 'www',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
