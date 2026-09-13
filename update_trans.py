import json, re

def update_translations(new_keys):
    with open('lib/translations.js', 'r', encoding='utf-8') as f:
        text = f.read()
    
    for lang, keys in new_keys.items():
        # Find the block for this language
        pattern = r'("' + lang + r'":\s*\{)(.*?)(\})'
        
        def replacer(match):
            prefix = match.group(1)
            content = match.group(2)
            suffix = match.group(3)
            
            # append new keys to content
            additions = ""
            for k, v in keys.items():
                if f'"{k}":' not in content:
                    escaped_v = v.replace('"', '\\"')
                    additions += f',\n        "{k}": "{escaped_v}"'
            
            return prefix + content + additions + '\n    ' + suffix

        text = re.sub(pattern, replacer, text, flags=re.DOTALL)
        
    with open('lib/translations.js', 'w', encoding='utf-8') as f:
        f.write(text)

new_data = {
  "en": {
    "manageProfile": "Manage your business profile, tax settings, and invoice preferences",
    "businessProfile": "Business Profile",
    "taxSettings": "Tax Settings",
    "bankDetails": "Bank Details",
    "payments": "Payments",
    "branding": "Branding",
    "signatory": "Signatory",
    "termsAndConditions": "Terms & Conditions",
    "featuresAndModules": "Features & Modules",
    "invoiceDesign": "Invoice Design",
    "preferences": "Preferences",
    "accountSecurity": "Account Security",
    "saveAllSettings": "Save All Settings",
    "selectDisplayLanguage": "Select display language for your dashboard",
    "language": "Language"
  },
  "hi": {
    "manageProfile": "अपनी बिज़नेस प्रोफ़ाइल, टैक्स सेटिंग और इनवॉइस प्राथमिकताएँ मैनेज करें",
    "businessProfile": "बिज़नेस प्रोफ़ाइल",
    "taxSettings": "टैक्स सेटिंग",
    "bankDetails": "बैंक डिटेल्स",
    "payments": "पेमेंट्स",
    "branding": "ब्रांडिंग",
    "signatory": "हस्ताक्षरकर्ता",
    "termsAndConditions": "नियम एवं शर्तें",
    "featuresAndModules": "फीचर्स और मॉड्यूल्स",
    "invoiceDesign": "इनवॉइस डिज़ाइन",
    "preferences": "प्राथमिकताएं",
    "accountSecurity": "खाता सुरक्षा",
    "saveAllSettings": "सभी सेटिंग्स सेव करें",
    "selectDisplayLanguage": "अपने डैशबोर्ड के लिए प्रदर्शन भाषा चुनें",
    "language": "भाषा"
  },
  "gu": {
    "manageProfile": "તમારી બિઝનેસ પ્રોફાઇલ, ટેક્સ સેટિંગ્સ અને ઇનવોઇસ પસંદગીઓ મેનેજ કરો",
    "businessProfile": "બિઝનેસ પ્રોફાઇલ",
    "taxSettings": "ટેક્સ સેટિંગ્સ",
    "bankDetails": "બેંક વિગતો",
    "payments": "પેમેન્ટ્સ",
    "branding": "બ્રાન્ડિંગ",
    "signatory": "સહી કરનાર",
    "termsAndConditions": "નિયમો અને શરતો",
    "featuresAndModules": "ફીચર્સ અને મોડ્યુલ્સ",
    "invoiceDesign": "ઇનવોઇસ ડિઝાઇન",
    "preferences": "પસંદગીઓ",
    "accountSecurity": "એકાઉન્ટ સુરક્ષા",
    "saveAllSettings": "બધા સેટિંગ્સ સાચવો",
    "selectDisplayLanguage": "તમારા ડેશબોર્ડ માટે ભાષા પસંદ કરો",
    "language": "ભાષા"
  },
  "mr": {
    "manageProfile": "तुमची बिझनेस प्रोफाईल, टॅक्स सेटिंग्ज आणि इनव्हॉइस प्राधान्ये व्यवस्थापित करा",
    "businessProfile": "बिझनेस प्रोफाईल",
    "taxSettings": "टॅक्स सेटिंग्ज",
    "bankDetails": "बँक तपशील",
    "payments": "पेमेंट्स",
    "branding": "ब्रँडिंग",
    "signatory": "स्वाक्षरीकर्ता",
    "termsAndConditions": "अटी आणि शर्ती",
    "featuresAndModules": "वैशिष्ट्ये आणि मॉड्यूल्स",
    "invoiceDesign": "इनव्हॉइस डिझाइन",
    "preferences": "प्राधान्ये",
    "accountSecurity": "खाते सुरक्षा",
    "saveAllSettings": "सर्व सेटिंग्ज सेव्ह करा",
    "selectDisplayLanguage": "तुमच्या डॅशबोर्डसाठी भाषा निवडा",
    "language": "भाषा"
  },
  "ta": {
    "manageProfile": "உங்கள் வணிக விவரம், வரி அமைப்புகள் மற்றும் விலைப்பட்டியல் விருப்பங்களை நிர்வகிக்கவும்",
    "businessProfile": "வணிக விவரம்",
    "taxSettings": "வரி அமைப்புகள்",
    "bankDetails": "வங்கி விவரங்கள்",
    "payments": "கட்டணங்கள்",
    "branding": "பிராண்டிங்",
    "signatory": "கையொப்பமிட்டவர்",
    "termsAndConditions": "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
    "featuresAndModules": "அம்சங்கள் மற்றும் தொகுதிகள்",
    "invoiceDesign": "விலைப்பட்டியல் வடிவமைப்பு",
    "preferences": "விருப்பத்தேர்வுகள்",
    "accountSecurity": "கணக்கு பாதுகாப்பு",
    "saveAllSettings": "அனைத்து அமைப்புகளையும் சேமி",
    "selectDisplayLanguage": "உங்கள் டாஷ்போர்டுக்கான மொழியைத் தேர்ந்தெடுக்கவும்",
    "language": "மொழி"
  },
  "te": {
    "manageProfile": "మీ వ్యాపార ప్రొఫైల్, పన్ను సెట్టింగ్‌లు మరియు ఇన్‌వాయిస్ ప్రాధాన్యతలను నిర్వహించండి",
    "businessProfile": "వ్యాపార ప్రొఫైల్",
    "taxSettings": "పన్ను సెట్టింగ్‌లు",
    "bankDetails": "బ్యాంక్ వివరాలు",
    "payments": "చెల్లింపులు",
    "branding": "బ్రాండింగ్",
    "signatory": "సంతకం చేసేవారు",
    "termsAndConditions": "నిబంధనలు మరియు షరతులు",
    "featuresAndModules": "ఫీచర్లు మరియు మాడ్యూల్స్",
    "invoiceDesign": "ఇన్‌వాయిస్ డిజైన్",
    "preferences": "ప్రాధాన్యతలు",
    "accountSecurity": "ఖాతా భద్రత",
    "saveAllSettings": "అన్ని సెట్టింగ్‌లను సేవ్ చేయండి",
    "selectDisplayLanguage": "మీ డాష్‌బోర్డ్ కోసం భాషను ఎంచుకోండి",
    "language": "భాష"
  },
  "bn": {
    "manageProfile": "আপনার ব্যবসার প্রোফাইল, ট্যাক্স সেটিংস এবং ইনভয়েস পছন্দগুলি পরিচালনা করুন",
    "businessProfile": "ব্যবসার প্রোফাইল",
    "taxSettings": "ট্যাক্স সেটিংস",
    "bankDetails": "ব্যাঙ্কের বিবরণ",
    "payments": "পেমেন্ট",
    "branding": "ব্র্যান্ডিং",
    "signatory": "স্বাক্ষরকারী",
    "termsAndConditions": "শর্তাবলী",
    "featuresAndModules": "বৈশিষ্ট্য এবং মডিউল",
    "invoiceDesign": "ইনভয়েস ডিজাইন",
    "preferences": "পছন্দসমূহ",
    "accountSecurity": "অ্যাকাউন্ট নিরাপত্তা",
    "saveAllSettings": "সমস্ত সেটিংস সংরক্ষণ করুন",
    "selectDisplayLanguage": "আপনার ড্যাশবোর্ডের জন্য ভাষা নির্বাচন করুন",
    "language": "ভাষা"
  },
  "kn": {
    "manageProfile": "ನಿಮ್ಮ ವ್ಯಾಪಾರ ಪ್ರೊಫೈಲ್, ತೆರಿಗೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಮತ್ತು ಇನ್‌ವಾಯ್ಸ್ ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
    "businessProfile": "ವ್ಯಾಪಾರ ಪ್ರೊಫೈಲ್",
    "taxSettings": "ತೆರಿಗೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "bankDetails": "ಬ್ಯಾಂಕ್ ವಿವರಗಳು",
    "payments": "ಪಾವತಿಗಳು",
    "branding": "ಬ್ರಾಂಡಿಂಗ್",
    "signatory": "ಸಹಿ ಮಾಡುವವರು",
    "termsAndConditions": "ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು",
    "featuresAndModules": "ವೈಶಿಷ್ಟ್ಯಗಳು ಮತ್ತು ಮಾಡ್ಯೂಲ್‌ಗಳು",
    "invoiceDesign": "ಇನ್‌ವಾಯ್ಸ್ ವಿನ್ಯಾಸ",
    "preferences": "ಆದ್ಯತೆಗಳು",
    "accountSecurity": "ಖಾತೆ ಭದ್ರತೆ",
    "saveAllSettings": "ಎಲ್ಲಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಉಳಿಸಿ",
    "selectDisplayLanguage": "ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗಾಗಿ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "language": "ಭಾಷೆ"
  },
  "ml": {
    "manageProfile": "നിങ്ങളുടെ ബിസിനസ്സ് പ്രൊഫൈൽ, ടാക്സ് ക്രമീകരണങ്ങൾ, ഇൻവോയ്സ് മുൻഗണനകൾ എന്നിവ നിയന്ത്രിക്കുക",
    "businessProfile": "ബിസിനസ്സ് പ്രൊഫൈൽ",
    "taxSettings": "ടാക്സ് ക്രമീകരണങ്ങൾ",
    "bankDetails": "ബാങ്ക് വിശദാംശങ്ങൾ",
    "payments": "പേയ്‌മെന്റുകൾ",
    "branding": "ബ്രാൻഡിംഗ്",
    "signatory": "ഒപ്പിടുന്നയാൾ",
    "termsAndConditions": "നിബന്ധനകളും വ്യവസ്ഥകളും",
    "featuresAndModules": "സവിശേഷതകളും മൊഡ്യൂളുകളും",
    "invoiceDesign": "ഇൻവോയ്സ് ഡിസൈൻ",
    "preferences": "മുൻഗണനകൾ",
    "accountSecurity": "അക്കൗണ്ട് സുരക്ഷ",
    "saveAllSettings": "എല്ലാ ക്രമീകരണങ്ങളും സംരക്ഷിക്കുക",
    "selectDisplayLanguage": "നിങ്ങളുടെ ഡാഷ്‌ബോർഡിനായി ഭാഷ തിരഞ്ഞെടുക്കുക",
    "language": "ഭാഷ"
  }
}

update_translations(new_data)
print("Updated successfully")
