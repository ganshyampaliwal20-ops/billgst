import re

with open('app/dashboard/settings/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

replacements = [
    (r'🔔 Auto Payment Reminder ON Karo', r'{t.autoReminderOn || \'🔔 Auto Payment Reminder ON Karo\'}'),
    (r'Pending customers ko <strong style={{ color: \'#c4b5fd\' }}>BillGST Support Bot \(\+7498571873\)</strong> se automatic reminder jayega — aapke behalf par\.',
     r'{t.autoReminderDesc || \'Pending customers will automatically receive reminders on your behalf via the BillGST Support Bot (+7498571873).\'}'),
    (r'📱 Aisa Message Jayega Customer Ko \(BillGST System Se\)', r'{t.autoReminderPreviewTitle || \'📱 This is how the message will look to your customers\'}'),
    (r'Aapki Dukan', r'{t.yourBusinessName || \'Your Business Name\'}'),
    (r'Aapki Dukan', r'{t.yourBusinessName || \'Your Business Name\'}'), # twice
    (r'- Sent automatically via BillGST App', r'{t.sentAutoViaBillGST || \'- Sent automatically via BillGST App\'}'),
    (r'📅 Kitne din baad reminder\?', r'{t.reminderDaysLabel || \'📅 Send reminder after how many days?\'}'),
    (r'>1 din baad<', r'>{t.days1 || \'After 1 day\'}<'),
    (r'>2 din baad<', r'>{t.days2 || \'After 2 days\'}<'),
    (r'>3 din baad<', r'>{t.days3 || \'After 3 days\'}<'),
    (r'>5 din baad<', r'>{t.days5 || \'After 5 days\'}<'),
    (r'>7 din baad \(1 hafta\)<', r'>{t.days7 || \'After 7 days (1 week)\'}<'),
    (r'>14 din baad<', r'>{t.days14 || \'After 14 days\'}<'),
    (r'>30 din baad<', r'>{t.days30 || \'After 30 days\'}<'),
    (r'Invoice ke baad kitne din pending rahe tab reminder bheje', r'{t.reminderDaysHint || \'Send reminder if invoice is pending for these many days after creation\'}'),
    (r'⏰ Kaunse waqt bheja jaye\?', r'{t.reminderTimeLabel || \'⏰ At what time should we send it?\'}'),
    (r'Is waqt automatically reminder jayega', r'{t.reminderTimeHint || \'Reminders will be automatically sent at this time\'}'),
    (r'✅ <strong>Sab ready hai!</strong> Settings save karo — kal se har roz <strong>\{formData\.reminderTime \|\| \'10:00\'\}</strong> baje pending customers ko aapke behalf par automatic reminder jayega\.', 
     r'{t.reminderSuccessMsg1 || \'✅ All set! Save settings — starting tomorrow, automatic reminders will be sent to pending customers every day at\'} <strong>{formData.reminderTime || \'10:00\'}</strong> {t.reminderSuccessMsg2 || \'on your behalf.\'}'),
    (r'<p>Customers ko automatic payment reminders bhejein — 100% Free!</p>', r'<p>{t.autoReminderSub || \'Send automatic payment reminders to customers — 100% Free!\'}</p>')
]

for old, new in replacements:
    code = re.sub(old, new, code)

with open('app/dashboard/settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
