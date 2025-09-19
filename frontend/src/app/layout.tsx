import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TenantProvider } from './providers/TenantProvider';
import { QueryProvider } from './providers/QueryProvider';
import AssistantWidget from '../components/assistant/Widget';

export const metadata: Metadata = {
  title: 'Blocks MVP - Cloud Cost Optimization',
  description: 'AI-powered cloud cost visibility and optimization platform',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563EB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className='h-full'>
      <body className='h-full bg-background text-foreground antialiased'>
        <QueryProvider>
          <TenantProvider>
            {children}
            <AssistantWidget />
          </TenantProvider>
        </QueryProvider>
      </body>
    </html>
  );
}