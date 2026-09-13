import io
with io.open('app/dashboard/reports/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

rupee_svg = '<path d="M6 3h12"/><path d="M6 8h12"/><path d="M6 13h8.5l-6 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/>'

dollar_svg_1 = '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'
dollar_svg_2 = '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7"/>'

text = text.replace(dollar_svg_1, rupee_svg)
text = text.replace(dollar_svg_2, rupee_svg)

with io.open('app/dashboard/reports/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Replaced icons")
