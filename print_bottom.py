import io
with open('temp_old_page.tsx', 'r', encoding='utf-16', errors='ignore') as f:
    text = f.read()

start = text.find('<div className="bottom-grid">')
with open('bottom.txt', 'w', encoding='utf-8') as out:
    out.write(text[start:start+3000])
