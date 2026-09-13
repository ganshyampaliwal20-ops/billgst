import json
import io

with io.open('app/dashboard/reports/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bottom_grid_css = text[text.find('.bottom-grid {'):text.find('` }} />')]
bottom_grid_jsx = text[text.find('<div className="bottom-grid">'):text.find('</div>\n\n                </div>\n            </div>\n        </>')]

# print it out to a temporary file
with io.open('extracted_bottom.json', 'w', encoding='utf-8') as f:
    json.dump({'css': bottom_grid_css, 'jsx': bottom_grid_jsx}, f)
