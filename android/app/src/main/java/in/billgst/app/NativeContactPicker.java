package in.billgst.app;

import android.content.Intent;
import android.provider.ContactsContract;
import android.app.Activity;
import android.database.Cursor;
import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.ActivityCallback;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "NativeContactPicker")
public class NativeContactPicker extends Plugin {

    @PluginMethod
    public void pickPhoneContact(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_PICK, ContactsContract.CommonDataKinds.Phone.CONTENT_URI);
        startActivityForResult(call, intent, "pickPhoneResult");
    }

    @ActivityCallback
    private void pickPhoneResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
            Uri contactData = result.getData().getData();
            Cursor cursor = getContext().getContentResolver().query(contactData, null, null, null, null);
            if (cursor != null && cursor.moveToFirst()) {
                int numberIndex = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER);
                int nameIndex = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME);
                
                String number = numberIndex != -1 ? cursor.getString(numberIndex) : "";
                String name = nameIndex != -1 ? cursor.getString(nameIndex) : "";
                
                JSObject ret = new JSObject();
                ret.put("name", name);
                ret.put("phone", number);
                call.resolve(ret);
                cursor.close();
            } else {
                call.reject("Could not read contact data");
            }
        } else {
            call.reject("Canceled");
        }
    }
}
