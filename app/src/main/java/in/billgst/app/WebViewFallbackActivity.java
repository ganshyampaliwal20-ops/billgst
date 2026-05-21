package in.billgst.app;

import android.os.Bundle;

public class WebViewFallbackActivity extends com.google.androidbrowserhelper.trusted.WebViewFallbackActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        try {
            androidx.activity.EdgeToEdge.enable(this);
        } catch (Exception e) {
            e.printStackTrace();
        }
        super.onCreate(savedInstanceState);
    }
}
