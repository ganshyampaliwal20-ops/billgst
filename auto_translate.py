import re, json
import time
from deep_translator import GoogleTranslator

print("Loading translations.js...")
with open('lib/translations.js', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'export const translations = (\{.*?\n\});', text, flags=re.DOTALL)
if not match:
    print("Could not find translations block")
    exit(1)

raw_json = match.group(1)
raw_json = re.sub(r',\s*\}', '}', raw_json)

try:
    data = json.loads(raw_json)
except Exception as e:
    print("JSON Decode Error:", e)
    exit(1)

en_keys = data.get('en', {})
print(f"Found {len(en_keys)} English keys")

target_langs = ['hi', 'gu', 'mr', 'ta', 'te', 'bn', 'kn', 'ml']
total_translated = 0

for lang in target_langs:
    if lang not in data:
        data[lang] = {}
        
    lang_dict = data[lang]
    translator = GoogleTranslator(source='en', target=lang)
    
    to_translate = []
    # Iterate over EN keys! This way, any NEW key added to 'en' gets translated to all langs.
    for k, en_val in en_keys.items():
        v = lang_dict.get(k, '')
        # Translate if it's missing entirely, or if it matches English (and is ascii)
        needs_translation = False
        
        if not v:
            needs_translation = True
        elif v == en_val and re.match(r'^[\x00-\x7F]*$', v) and len(v.strip()) > 0:
            if v.lower().strip() not in ["whatsapp", "gst", "ai", "pdf", "qr code", "whatsapp share", "sms", "email", "ok", "pin", "pos"]:
                needs_translation = True
                
        if needs_translation:
            to_translate.append((k, en_val))
    
    if to_translate:
        print(f"Translating {len(to_translate)} missing items for {lang}...")
        for k, v in to_translate:
            try:
                translated = translator.translate(v)
                if translated:
                    data[lang][k] = translated
                    print(f"[{lang}] {v} -> {translated}")
                    total_translated += 1
            except Exception as e:
                print(f"Failed to translate {v}: {e}")
                time.sleep(1)

if total_translated > 0:
    formatted_json = json.dumps(data, indent=4, ensure_ascii=False)
    new_text = text[:match.start(1)] + formatted_json + text[match.end(1):]

    with open('lib/translations.js', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Saved lib/translations.js successfully!")
else:
    print("Nothing to translate.")
