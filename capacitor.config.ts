import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.aa66b4a2237042b586c58fc293c37a62',
  appName: 'FreshFlow - Food Delivery Platform',
  webDir: 'dist',
  server: {
    url: "https://aa66b4a2-2370-42b5-86c5-8fc293c37a62.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#22c55e",
      showSpinner: false
    }
  }
};

export default config;