package in.billgst.app;

import android.net.Uri;
import android.os.Bundle;

public class LauncherActivity
        extends com.google.androidbrowserhelper.trusted.LauncherActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        try {
            androidx.activity.EdgeToEdge.enable((androidx.activity.ComponentActivity) (Object) this);
        } catch (Throwable t) {
            // Ignore ClassCastException since androidbrowserhelper LauncherActivity extends android.app.Activity
        }
        try {
            androidx.core.view.WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        } catch (Throwable t) {
        }
        super.onCreate(savedInstanceState);
    }

    @Override
    protected Uri getLaunchingUrl() {
        Uri uri = super.getLaunchingUrl();
        return uri;
    }
}
