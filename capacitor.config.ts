import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.billgst.app',
  appName: 'BillGST',
  webDir: 'out',
  server: {
    url: 'https://billgst.in',
    cleartext: true
  }
};

export default config;
