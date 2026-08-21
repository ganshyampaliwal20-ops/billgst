with open('lib/pdf-generator.core.js', 'r', encoding='utf-8') as f:
    content = f.read()

import_line = "import { DOC_LABELS, DOC_TYPES } from './constants';"
content = content.replace(import_line, import_line + '\nimport { LOGO_B64 } from "./logo-b64";')

old_func = '''let cachedBillGstLogo = null;
export const getBillGstLogo = async () => {
    if (cachedBillGstLogo !== null) return cachedBillGstLogo;
    try {
        const response = await fetch('/logo.png');
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => { cachedBillGstLogo = reader.result; resolve(cachedBillGstLogo); };
            reader.onerror = () => { cachedBillGstLogo = false; resolve(false); };
            reader.readAsDataURL(blob);
        });
    } catch(e) { cachedBillGstLogo = false; return false; }
};'''

new_func = '''export const getBillGstLogo = async () => {
    return LOGO_B64;
};'''

content = content.replace(old_func, new_func)

with open('lib/pdf-generator.core.js', 'w', encoding='utf-8') as f:
    f.write(content)
