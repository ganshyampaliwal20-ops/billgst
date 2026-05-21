package in.billgst.app;

import android.os.Bundle;

public class WebViewFallbackActivity extends com.google.androidbrowserhelper.trusted.WebViewFallbackActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        try {
            androidx.activity.EdgeToEdge.enable((androidx.activity.ComponentActivity) (Object) this);
        } catch (Throwable t) {
        }
        try {
            androidx.core.view.WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        } catch (Throwable t) {
        }
        super.onCreate(savedInstanceState);
    }
}
