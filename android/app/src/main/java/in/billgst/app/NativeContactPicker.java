package in.billgst.app;

import android.Manifest;
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
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;

@CapacitorPlugin(
    name = "NativeContactPicker",
    permissions = {
        @Permission(
            alias = "contacts",
            strings = { Manifest.permission.READ_CONTACTS }
        )
    }
)
public class NativeContactPicker extends Plugin {

    @PluginMethod
    public void pickPhoneContact(PluginCall call) {
        if (getPermissionState("contacts") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("contacts", call, "contactsPermsCallback");
        } else {
            launchPicker(call);
        }
    }

    @PermissionCallback
    private void contactsPermsCallback(PluginCall call) {
        // Even if they deny, we try to launch because ACTION_PICK grants temporary read access on most phones.
        launchPicker(call);
    }

    private void launchPicker(PluginCall call) {
        try {
            Intent intent = new Intent(Intent.ACTION_PICK, ContactsContract.CommonDataKinds.Phone.CONTENT_URI);
            startActivityForResult(call, intent, "pickPhoneResult");
        } catch (Exception e) {
            // Fallback to generic contacts URI if Phone.CONTENT_URI fails
            Intent intent = new Intent(Intent.ACTION_PICK, ContactsContract.Contacts.CONTENT_URI);
            startActivityForResult(call, intent, "pickPhoneResult");
        }
    }

    @ActivityCallback
    private void pickPhoneResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
            Uri contactData = result.getData().getData();
            if (contactData == null) {
                call.reject("Contact data URI is null");
                return;
            }
            
            Cursor cursor = null;
            try {
                cursor = getContext().getContentResolver().query(contactData, null, null, null, null);
                if (cursor != null && cursor.moveToFirst()) {
                    int numberIndex = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER);
                    int nameIndex = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME);
                    
                    String number = "";
                    String name = "";
                    
                    if (numberIndex != -1) {
                        number = cursor.getString(numberIndex);
                    }
                    if (nameIndex != -1) {
                        name = cursor.getString(nameIndex);
                    } else {
                        // Fallback name column
                        int displayIdx = cursor.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME);
                        if (displayIdx != -1) name = cursor.getString(displayIdx);
                    }
                    
                    // If number is empty, we might have received a generic Contact URI instead of Phone URI
                    if (number == null || number.isEmpty()) {
                        int idIndex = cursor.getColumnIndex(ContactsContract.Contacts._ID);
                        int hasPhoneIndex = cursor.getColumnIndex(ContactsContract.Contacts.HAS_PHONE_NUMBER);
                        
                        if (idIndex != -1 && hasPhoneIndex != -1) {
                            String contactId = cursor.getString(idIndex);
                            String hasPhone = cursor.getString(hasPhoneIndex);
                            
                            if (contactId != null && "1".equals(hasPhone)) {
                                Cursor phoneCursor = getContext().getContentResolver().query(
                                    ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                                    null,
                                    ContactsContract.CommonDataKinds.Phone.CONTACT_ID + " = ?",
                                    new String[]{ contactId },
                                    null
                                );
                                
                                if (phoneCursor != null && phoneCursor.moveToFirst()) {
                                    int pNumIdx = phoneCursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER);
                                    if (pNumIdx != -1) {
                                        number = phoneCursor.getString(pNumIdx);
                                    }
                                    phoneCursor.close();
                                }
                            }
                        }
                    }
                    
                    JSObject ret = new JSObject();
                    ret.put("name", name != null ? name : "");
                    ret.put("phone", number != null ? number : "");
                    call.resolve(ret);
                } else {
                    call.reject("Could not read contact data cursor");
                }
            } catch (Exception e) {
                call.reject("Error querying contact: " + e.getMessage());
            } finally {
                if (cursor != null) cursor.close();
            }
        } else {
            call.reject("Canceled");
        }
    }
}
