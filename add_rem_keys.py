import re, json

with open('lib/translations.js', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'export const translations = (\{.*?\n\});', text, flags=re.DOTALL)
if match:
    raw_json = match.group(1)
    raw_json = re.sub(r',\s*\}', '}', raw_json)
    data = json.loads(raw_json)
    
    new_keys = {
        "autoReminderOn": "Turn ON Auto Payment Reminder",
        "autoReminderDesc": "Pending customers will automatically receive reminders on your behalf via the BillGST Support Bot (+7498571873).",
        "autoReminderPreviewTitle": "📱 This is how the message will look to your customers",
        "yourBusinessName": "Your Business Name",
        "sentAutoViaBillGST": "- Sent automatically via BillGST App",
        "reminderDaysLabel": "📅 Send reminder after how many days?",
        "days1": "After 1 day",
        "days2": "After 2 days",
        "days3": "After 3 days",
        "days5": "After 5 days",
        "days7": "After 7 days (1 week)",
        "days14": "After 14 days",
        "days30": "After 30 days",
        "reminderDaysHint": "Send reminder if invoice is pending for these many days after creation",
        "reminderTimeLabel": "⏰ At what time should we send it?",
        "reminderTimeHint": "Reminders will be automatically sent at this time",
        "reminderSuccessMsg1": "✅ All set! Save settings — starting tomorrow, automatic reminders will be sent to pending customers every day at",
        "reminderSuccessMsg2": "on your behalf."
    }
    
    # Add to 'en' only
    for k, v in new_keys.items():
        data['en'][k] = v
            
    formatted_json = json.dumps(data, indent=4, ensure_ascii=False)
    new_text = text[:match.start(1)] + formatted_json + text[match.end(1):]

    with open('lib/translations.js', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Added reminder EN keys successfully!")
