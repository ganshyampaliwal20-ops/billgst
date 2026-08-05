import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.billgst.app',
  appName: 'BillGST',
  webDir: 'out',
  server: {
    url: 'https://billgst.in',
    cleartext: true,
    allowNavigation: [
      "billgst.in",
      "*.billgst.in"
    ]
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#050810"
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#050810",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
