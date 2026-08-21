import base64
with open('public/logo.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')
content = 'export const LOGO_B64 = "data:image/png;base64,' + b64 + '";\n'
with open('lib/logo-b64.js', 'w') as f:
    f.write(content)
