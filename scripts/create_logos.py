import os

os.makedirs('public/logos', exist_ok=True)

logos = {
    'excel.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <path fill="#167e43" d="M26,5H12c-1.1,0-2,0.9-2,2v34c0,1.1,0.9,2,2,2h24c1.1,0,2-0.9,2-2V17L26,5z"/>
  <path fill="#107c41" d="M26,5v12h12L26,5z" opacity="0.3"/>
  <path fill="#1f9a55" d="M10,13h16v26H10V13z" opacity="0.2"/>
  <path fill="#107c41" d="M4,13l14-2.5v27L4,35V13z"/>
  <path fill="#ffffff" d="M7.8,19.2h3.2l2.2,4.6l2.2-4.6h3.2l-3.8,6.8l4,7.2h-3.2l-2.4-4.9l-2.4,4.9H7.6l4.1-7.1L7.8,19.2z"/>
</svg>''',

    'powerbi.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <path fill="#f2c811" d="M36 10h6v28h-6zM26 16h6v22h-6zM16 24h6v14h-6zM6 30h6v8H6z" />
  <rect fill="#f2c811" x="26" y="10" width="16" height="28" rx="2" opacity="0.15" />
</svg>''',

    'googlesheets.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <path fill="#0f9d58" d="M29 4H11c-2.2 0-4 1.8-4 4v32c0 2.2 1.8 4 4 4h26c2.2 0 4-1.8 4-4V16L29 4z"/>
  <path fill="#ffffff" d="M14 20h20v4H14zm0 6h20v4H14zm0 6h20v4H14z"/>
  <path fill="#0b8043" d="M29 4v12h12L29 4z"/>
</svg>''',

    'googleappsscript.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <path fill="#4285f4" d="M14.5 12L7 24.5l7.5 12.5h6l-7.5-12.5L20.5 12z"/>
  <path fill="#ea4335" d="M33.5 12l7.5 12.5-7.5 12.5h-6l7.5-12.5L27.5 12z"/>
  <path fill="#fbbc05" d="M26 10l-6 28h4l6-28z"/>
</svg>''',

    'python.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <path fill="#3776ab" d="M23.6 4c-9.5 0-8.9 4.1-8.9 4.1l.1 4.3h9.1v1.3H11.2s-6.2-.7-6.2 8.9 5.4 9.2 5.4 9.2h3.2v-4.5s-.2-5.4 5.3-5.4h9.1s5.1.1 5.1-4.9V13S33.8 4 23.6 4zm-4.8 2.7a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z"/>
  <path fill="#ffd43b" d="M24.4 44c9.5 0 8.9-4.1 8.9-4.1l-.1-4.3h-9.1v-1.3h12.7s6.2.7 6.2-8.9-5.4-9.2-5.4-9.2h-3.2v4.5s.2 5.4-5.3 5.4h-9.1s-5.1-.1-5.1 4.9v8.1S14.2 44 24.4 44zm4.8-2.7a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8z"/>
</svg>''',

    'sql.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <path fill="#336791" d="M24 6C13 6 4 9.6 4 14v20c0 4.4 9 8 20 8s20-3.6 20-8V14c0-4.4-9-8-20-8zm0 4c9.4 0 16 3 16 4s-6.6 4-16 4-16-3-16-4 6.6-4 16-4zm0 28c-9.4 0-16-3-16-4V21.7c3.8 2.4 10 3.8 16 3.8s12.2-1.4 16-3.8V34c0 1-6.6 4-16 4z"/>
</svg>''',

    'LICENSE.txt': 'Brand SVGs (Microsoft Excel, Power BI, Google Sheets, Google Apps Script, Python, SQL) are property of their respective trademark holders, used here for personal portfolio skills representation.'
}

for name, content in logos.items():
    path = os.path.join('public/logos', name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print('Logos created successfully:', os.listdir('public/logos'))
