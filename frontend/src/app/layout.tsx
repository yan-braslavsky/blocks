import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blocks MVP - Cloud Cost Optimization',
  description: 'AI-powered cloud cost visibility and optimization platform',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563EB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className='h-full'>
      <body className='h-full bg-slate-50 text-slate-900 antialiased'>
        {children}
      </body>
    </html>
  );
}