# Sakshi Shukla — Personal Portfolio & Interactive Experience

A clean, light, smooth, and premium personal portfolio website for **Sakshi Shukla** (Data Analyst | Business Analyst | BI & Reporting | Process Automation).

Designed in monochrome (white, black, gray) with quiet luxury aesthetics inspired by Awwwards Site of the Day standards.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 📋 Sections Overview

| Section | Component | Description |
| :--- | :--- | :--- |
| **01 — Hero** | `src/components/hero/Hero.tsx` | Seamless looping intro video (`hero.mp4` / `hero.webm`), audio toggle button, outlined ghost typography, and direct CTAs. |
| **02 — About** | `src/components/sections/About.tsx` | Verbatim résumé summary, quick facts, and interactive 3D hanging lanyard ID card with pendulum physics. |
| **03 — Skills** | `src/components/sections/Skills.tsx` | Periodic table grid of stack skills, family filters, and sticky inspector panel with official brand SVGs and line icons. |
| **04 — Work** | `src/components/sections/Work.tsx` | Expanding accordion gallery with 4 featured software analytics systems and illustrative UI mockups. |
| **05 — Experience** | `src/components/sections/Experience.tsx` | Vertical career & education timeline with scroll-progress drawing spine. |
| **06 — Achievements** | `src/components/sections/Achievements.tsx` | Pinned horizontal scroll section with count-up metric cards. |
| **07 — Contact** | `src/components/sections/Contact.tsx` | Interactive letter-hopping heading, email copy button, phone & LinkedIn links, and spinning text badge. |

---

## 🎥 Rebuilding Hero Video Assets

The hero video pipeline is fully automated by `scripts/build-hero-assets.py`.

To rebuild `hero.mp4`, `hero.webm`, `portrait-bust.webp`, and `og.jpg`:
```bash
python scripts/build-hero-assets.py
```

### What the script does:
1. Crops the input video (`intro.mp4`) tightly around the subject (864x1080 at x=548, scaled to 768x960).
2. Whitens the background via FFmpeg `colorlevels` filter for seamless page integration.
3. Creates a sample-accurate 0.5 s audio & video cross-fade in NumPy & FFmpeg `xfade` for continuous looping without audio clicks or visual jumps.
4. Exports `public/hero/hero.mp4` and `public/hero/hero.webm`.
5. Generates `public/portrait-bust.webp` (480x600) and `public/og.jpg` (1200x630).

---

## 📜 Credits & Brand Logo Licenses

- **Microsoft Excel** SVG Logo — Property of Microsoft Corporation (`public/logos/excel.svg`)
- **Microsoft Power BI** SVG Logo — Property of Microsoft Corporation (`public/logos/powerbi.svg`)
- **Google Sheets** SVG Logo — Property of Google LLC (`public/logos/googlesheets.svg`)
- **Google Apps Script** SVG Logo — Property of Google LLC (`public/logos/googleappsscript.svg`)
- **Python** SVG Logo — Python Software Foundation (`public/logos/python.svg`)
- **SQL** SVG Logo — PostgreSQL / Generic SQL Standard (`public/logos/sql.svg`)

License disclosures and usage notes are maintained in `public/logos/LICENSE.txt`.

---

## 🎨 Design System

- **Background (`--paper`)**: `#f4f2ee` (Warm off-white)
- **Cards (`--card`)**: `#ffffff` (Pure white, hairline 1px border)
- **Ink (`--ink`)**: `#0d0d0d` (Deep black text & primary pills)
- **Mute (`--mute`)**: `#77756f` (Secondary text & Instrument Serif accents)
- **Typography**:
  - `Inter Tight` (Display & Body)
  - `Instrument Serif` (Italic accent words)
  - `JetBrains Mono` (Indices, tags, numbers)
