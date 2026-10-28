import type { Metadata, Viewport } from 'next';

import localFont from 'next/font/local';

import './globals.css';

const lato = localFont({
  src: [
    { path: './fonts/lato/Lato-Bold.ttf', weight: '700', style: 'normal' },
    {
      path: './fonts/lato/Lato-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
    { path: './fonts/lato/Lato-Black.ttf', weight: '900', style: 'normal' },
    {
      path: './fonts/lato/Lato-BlackItalic.ttf',
      weight: '900',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-lato',
});

export const metadata: Metadata = {
  applicationName: 'Form Delegate',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#b83f38',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${lato.variable} bg-[#fbf6ea] selection:bg-[#f2c7c2] selection:text-[#431715]`}
    >
      <body className="group/app min-w-[320px] antialiased max-lg:data-[menu-open=true]:overflow-hidden">
        {children}
      </body>
    </html>
  );
}
