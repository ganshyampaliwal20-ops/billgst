import re

with open(r'f:\bill\desian.html', 'r', encoding='utf-8') as f:
    content = f.read()

style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if style_match:
    with open(r'f:\bill\app\design.css', 'w', encoding='utf-8') as f:
        f.write(style_match.group(1))

body_match = re.search(r'<body>(.*?)<script>', content, re.DOTALL)
if body_match:
    body = body_match.group(1)
    body = body.replace('class=', 'className=')
    body = body.replace('onclick', 'onClick')
    body = body.replace('for=', 'htmlFor=')
    body = body.replace('<!--', '{/*')
    body = body.replace('-->', '*/}')
    body = re.sub(r'style=\"(.*?)\"', 'style={{}}', body)
    body = re.sub(r'(<img[^>]+)(?<!/)>', r'\1 />', body)
    body = re.sub(r'(<input[^>]+)(?<!/)>', r'\1 />', body)
    with open(r'f:\bill\app\landing_content.tsx', 'w', encoding='utf-8') as f:
        f.write(body)
