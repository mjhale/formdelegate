'use client';

import Error from 'next/error';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <Error statusCode={404} />
        <SpeedInsights />
      </body>
    </html>
  );
}
