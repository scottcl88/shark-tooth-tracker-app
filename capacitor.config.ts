import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lewis.sharktoothtracker',
  appName: 'Shark Tooth Tracker',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ["apple.com", "google.com"],
    },
  },
};

export default config;
