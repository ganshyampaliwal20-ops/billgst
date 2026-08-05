package in.billgst.app;

import com.getcapacitor.BridgeActivity;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.View;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeContactPicker.class);
        super.onCreate(savedInstanceState);

        // Boost WebView Performance & Enable Instant Local Disk Caching
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                // LOAD_DEFAULT uses cached resources whenever available/valid
                settings.setCacheMode(WebSettings.LOAD_DEFAULT);
                settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
                settings.setEnableSmoothTransition(true);
                // Hardware layer acceleration for 60fps animations
                webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
                webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
            }
        } catch (Exception e) {
            // Non-fatal if bridge not ready yet
        }
    }
}
