package in.billgst.app;

import com.getcapacitor.BridgeActivity;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.View;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeContactPicker.class);
        super.onCreate(savedInstanceState);

        // Boost WebView Performance & Enable Instant Local Disk Caching + Persistent Cookies
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setCacheMode(WebSettings.LOAD_DEFAULT);
                settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
                settings.setEnableSmoothTransition(true);
                webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
                webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);

                // Enable and persist login cookies permanently across app restarts
                CookieManager cookieManager = CookieManager.getInstance();
                cookieManager.setAcceptCookie(true);
                cookieManager.setAcceptThirdPartyCookies(webView, true);
                cookieManager.flush();
            }
        } catch (Exception e) {
            // Non-fatal if bridge not ready yet
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        try {
            CookieManager.getInstance().flush();
        } catch (Exception e) {}
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        try {
            CookieManager.getInstance().flush();
        } catch (Exception e) {}
    }
}
