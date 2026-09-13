import re, json

with open('lib/translations.js', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'export const translations = (\{.*?\n\});', text, flags=re.DOTALL)
if match:
    raw_json = match.group(1)
    raw_json = re.sub(r',\s*\}', '}', raw_json)
    data = json.loads(raw_json)
    
    new_keys = {
        "businessOverview": "Business overview",
        "periodThisMonth": "This Month",
        "periodLastMonth": "Last Month",
        "periodThisYear": "This Year",
        "advisory": "Advisory",
        "hsnComplianceHint": "Ensure HSN codes for GST compliance",
        "maximizeItc": "Maximize ITC",
        "itcMaximizeToast": "Claim ITC efficiently",
        "keyMetrics": "Key metrics",
        "activeCustomers": "Active customers",
        "revenueTrend": "Revenue trend",
        "exportTally": "Export Tally XML",
        "exportExcel": "Export Excel",
        "reports": "Reports"
    }
    
    for k, v in new_keys.items():
        if k not in data['en']:
            data['en'][k] = v
            
    formatted_json = json.dumps(data, indent=4, ensure_ascii=False)
    new_text = text[:match.start(1)] + formatted_json + text[match.end(1):]

    with open('lib/translations.js', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Added reports keys successfully!")
