import os
import urllib.request
import re

os.makedirs('src/fonts', exist_ok=True)

# User-Agent for modern browser to get woff2 links from Google Fonts
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

fonts_to_fetch = [
    {
        'url': 'https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap',
        'files': {
            'InterTight-Variable.woff2': r'url\((https://fonts.gstatic.com/s/intertight/[^\)]+\.woff2)\)'
        }
    },
    {
        'url': 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap',
        'files': {
            'InstrumentSerif-Regular.woff2': r'url\((https://fonts.gstatic.com/s/instrumentserif/[^\)]+\.woff2)\)',
            'InstrumentSerif-Italic.woff2': r'url\((https://fonts.gstatic.com/s/instrumentserif/[^\)]+\.woff2)\)'
        }
    },
    {
        'url': 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap',
        'files': {
            'JetBrainsMono-Variable.woff2': r'url\((https://fonts.gstatic.com/s/jetbrainsmono/[^\)]+\.woff2)\)'
        }
    }
]

for font in fonts_to_fetch:
    req = urllib.request.Request(font['url'], headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            css_text = resp.read().decode('utf-8')
            urls = re.findall(r'url\((https://fonts.gstatic.com/[^\)]+\.woff2)\)', css_text)
            print(f"Fetched CSS for {font['url']}, found {len(urls)} woff2 URLs")
            
            if 'InterTight-Variable.woff2' in font['files']:
                u = urls[0]
                out_path = os.path.join('src/fonts', 'InterTight-Variable.woff2')
                urllib.request.urlretrieve(u, out_path)
                print(f"Saved {out_path}")
            
            if 'InstrumentSerif-Regular.woff2' in font['files']:
                if len(urls) >= 2:
                    urllib.request.urlretrieve(urls[0], os.path.join('src/fonts', 'InstrumentSerif-Regular.woff2'))
                    urllib.request.urlretrieve(urls[1], os.path.join('src/fonts', 'InstrumentSerif-Italic.woff2'))
                    print("Saved InstrumentSerif regular & italic")
                elif len(urls) == 1:
                    urllib.request.urlretrieve(urls[0], os.path.join('src/fonts', 'InstrumentSerif-Regular.woff2'))
                    urllib.request.urlretrieve(urls[0], os.path.join('src/fonts', 'InstrumentSerif-Italic.woff2'))
                    print("Saved InstrumentSerif fallback")

            if 'JetBrainsMono-Variable.woff2' in font['files']:
                u = urls[0]
                out_path = os.path.join('src/fonts', 'JetBrainsMono-Variable.woff2')
                urllib.request.urlretrieve(u, out_path)
                print(f"Saved {out_path}")

    except Exception as e:
        print("Error fetching font:", e)

print("Font download finished. Files in src/fonts:", os.listdir('src/fonts'))
