import re

with open(r'f:\bill\desian.html', 'r', encoding='utf-8') as f:
    content = f.read()

# CSS
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if style_match:
    with open(r'f:\bill\app\design.css', 'w', encoding='utf-8') as f:
        f.write(style_match.group(1).strip())

# Content
body_match = re.search(r'<body>(.*?)</body>', content, re.DOTALL)
if body_match:
    body = body_match.group(1)
    # Remove script
    body = re.sub(r'<script(.*?)</script>', '', body, flags=re.DOTALL)
    
    # Simple React conversions
    body = body.replace('class=', 'className=')
    body = body.replace('onclick', 'onClick')
    body = body.replace('for=', 'htmlFor=')
    body = body.replace('<!--', '{/*')
    body = body.replace('-->', '*/}')
    
    # Handle style attribute manually: style="display:flex;gap:10px" -> style={{ display: 'flex', gap: '10px' }}
    def style_repl(m):
        style_str = m.group(1)
        styles = []
        for p in style_str.split(';'):
            if ':' in p:
                k, v = p.split(':', 1)
                k = k.strip()
                v = v.strip()
                # camelCase keys
                parts = k.split('-')
                k = parts[0] + ''.join(x.capitalize() for x in parts[1:])
                styles.append(f"'{k}': '{v}'")
        return 'style={{' + ', '.join(styles) + '}}'

    body = re.sub(r'style=\"(.*?)\"', style_repl, body)
    
    # Self-closing tags
    body = re.sub(r'(<img[^>]+?)(?<!/)>', r'\1 />', body)
    body = re.sub(r'(<input[^>]+?)(?<!/)>', r'\1 />', body)
    body = re.sub(r'(<br[^>]*?)(?<!/)>', r'\1 />', body)
    
    with open(r'f:\bill\app\landing_content.tsx', 'w', encoding='utf-8') as f:
        f.write(body.strip())
    print("DONE conversion")
