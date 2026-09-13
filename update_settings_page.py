import re

with open('app/dashboard/settings/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

replacements = [
    (r'<h1>Business Settings</h1>', r'<h1>{t.settings}</h1>'),
    (r'<p>Manage your business profile, tax settings, and invoice preferences</p>', r'<p>{t.manageProfile}</p>'),
    
    # Nav links
    (r'\{ id: \'profile\', label: \'Business Profile\' \}', r'{ id: \'profile\', label: t.businessProfile }'),
    (r'\{ id: \'tax\', label: \'Tax Settings\' \}', r'{ id: \'tax\', label: t.taxSettings }'),
    (r'\{ id: \'bank\', label: \'Bank Details\' \}', r'{ id: \'bank\', label: t.bankDetails }'),
    (r'\{ id: \'payments\', label: \'Payments\' \}', r'{ id: \'payments\', label: t.payments }'),
    (r'\{ id: \'branding\', label: \'Branding\' \}', r'{ id: \'branding\', label: t.branding }'),
    (r'\{ id: \'signatory\', label: \'Signatory\' \}', r'{ id: \'signatory\', label: t.signatory }'),
    (r'\{ id: \'terms\', label: \'Terms & Conditions\' \}', r'{ id: \'terms\', label: t.termsAndConditions }'),
    (r'\{ id: \'modules\', label: \'Features & Modules\' \}', r'{ id: \'modules\', label: t.featuresAndModules }'),
    (r'\{ id: \'design\', label: \'Invoice Design\' \}', r'{ id: \'design\', label: t.invoiceDesign }'),
    (r'\{ id: \'prefs\', label: \'Preferences\' \}', r'{ id: \'prefs\', label: t.preferences }'),
    (r'\{ id: \'security\', label: \'Account Security\' \}', r'{ id: \'security\', label: t.accountSecurity }'),
    
    # Section Headers
    (r'<h2>Business Profile</h2>', r'<h2>{t.businessProfile}</h2>'),
    (r'<h2>Tax Settings</h2>', r'<h2>{t.taxSettings}</h2>'),
    (r'<h2>Bank Details</h2>', r'<h2>{t.bankDetails}</h2>'),
    (r'<h2>Payments</h2>', r'<h2>{t.payments}</h2>'),
    (r'<h2>Branding</h2>', r'<h2>{t.branding}</h2>'),
    (r'<h2>Signatory</h2>', r'<h2>{t.signatory}</h2>'),
    (r'<h2>Terms & Conditions</h2>', r'<h2>{t.termsAndConditions}</h2>'),
    (r'<h2>Features & Modules</h2>', r'<h2>{t.featuresAndModules}</h2>'),
    (r'<h2>Invoice Design</h2>', r'<h2>{t.invoiceDesign}</h2>'),
    (r'<h2>Preferences</h2>', r'<h2>{t.preferences}</h2>'),
    (r'<h2>Account Security</h2>', r'<h2>{t.accountSecurity}</h2>'),
    
    (r'<p>Select display language for your dashboard</p>', r'<p>{t.selectDisplayLanguage}</p>'),
    (r'<label>Language</label>', r'<label>{t.language}</label>'),
    (r'Save All Settings', r'{t.saveAllSettings}')
]

for old, new in replacements:
    code = re.sub(old, new, code)

with open('app/dashboard/settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
