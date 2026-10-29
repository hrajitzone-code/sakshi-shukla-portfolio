import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { SmoothScrollProvider } from '@/lib/scroll';
import { PROFILE } from '@/lib/data';

const interTight = localFont({
  src: '../fonts/InterTight-Variable.woff2',
  variable: '--font-inter-tight',
  display: 'swap',
});

const instrumentSerif = localFont({
  src: [
    {
      path: '../fonts/InstrumentSerif-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/InstrumentSerif-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const jetbrainsMono = localFont({
  src: '../fonts/JetBrainsMono-Variable.woff2',
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://example.com/demo');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${PROFILE.name} — ${PROFILE.shortRole}`,
  description: PROFILE.resumeSummary,
  keywords: [
    'Business Systems',
    'MIS Reporting',
    'Workflow Automation',
    'Data Analyst',
    'Power BI',
    'Google Sheets Automation',
    'KPI Dashboards',
  ],
  authors: [{ name: PROFILE.name }],
  openGraph: {
    title: `${PROFILE.name} — ${PROFILE.shortRole}`,
    description: PROFILE.resumeSummary,
    url: siteUrl,
    siteName: `${PROFILE.name} Portfolio`,
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: `${PROFILE.name} Portfolio`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PROFILE.name} — ${PROFILE.shortRole}`,
    description: PROFILE.resumeSummary,
    images: ['/og.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#f4f2ee',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased selection:bg-[#0d0d0d] selection:text-[#f4f2ee]">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
