import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.billgst.app',
  appName: 'BillGST',
  webDir: 'out',
  server: {
    url: 'https://www.billgst.in',
    cleartext: true,
    allowNavigation: [
      "billgst.in",
      "*.billgst.in",
      "www.billgst.in"
    ]
  }
};

export default config;
