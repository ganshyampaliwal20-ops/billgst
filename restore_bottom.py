import json, io

data = json.load(io.open('extracted_bottom.json', encoding='utf-8'))
css_to_insert = "\n" + data['css']
jsx_to_insert = "\n" + data['jsx'] + "</div>\n"

with io.open('app/dashboard/reports/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Insert CSS just before closing backtick of style block
style_end = text.find('` }} />')
if style_end != -1:
    text = text[:style_end] + css_to_insert + text[style_end:]

# Insert JSX just before the final </div> of content block
export_row = text.find('<div className="export-row">')
if export_row != -1:
    # We want to insert just before '</div>\n                    </div>\n                </div>\n            </div>\n        </>'
    insert_pos = text.find('</div>\n                    </div>\n                </div>\n            </div>\n        </>')
    text = text[:insert_pos] + jsx_to_insert + text[insert_pos:]
else:
    print("Export row not found")

with io.open('app/dashboard/reports/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Restored bottom section")
