import re, json

with open('lib/translations.js', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'export const translations = (\{.*?\n\});', text, flags=re.DOTALL)
if match:
    raw_json = match.group(1)
    raw_json = re.sub(r',\s*\}', '}', raw_json)
    data = json.loads(raw_json)
    
    new_keys = {
        "addNewItem": "Add New Item",
        "balanceAmount": "Opening Balance",
        "cancel": "Cancel",
        "discountLabel": "Discount",
        "discountPercentage": "Discount (%)",
        "discountShippingTitle": "Discount & Shipping",
        "extraFee": "Extra Fee (₹)",
        "gst": "GST",
        "gstTotal": "GST Total",
        "itemAmount": "Item Amount",
        "moreOptions": "More Options",
        "nameLabel": "Name",
        "newCustomerSheetSubtitle": "Fill customer details and save",
        "newCustomerSheetTitle": "Add New Customer",
        "optional": "Optional",
        "otherCharges": "Other Charges",
        "otherInfo": "Other Information",
        "paymentDetails": "Payment Details",
        "phoneBookPrompt": "Select from Phone Book",
        "phoneBookSub": "Pick name and number directly from contacts",
        "phoneNumberLabel": "Phone Number",
        "price": "Price",
        "productName": "Product Name",
        "qty": "Qty",
        "recentCustomers": "Recent Customers",
        "requiredInfo": "Required Information",
        "save": "Save",
        "shippingCharge": "Shipping (₹)",
        "stateLabel": "State",
        "typeLabel": "Type",
        "unit": "Unit",
        "usbScanner": "USB Scanner",
        "camera": "Camera",
        "inventory": "Inventory",
        "selectCustomer": "Select Customer",
        "moreDetails": "More Details"
    }
    
    # Add to 'en' only
    for k, v in new_keys.items():
        if k not in data['en']:
            data['en'][k] = v
            
    formatted_json = json.dumps(data, indent=4, ensure_ascii=False)
    new_text = text[:match.start(1)] + formatted_json + text[match.end(1):]

    with open('lib/translations.js', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Added new EN keys successfully!")
