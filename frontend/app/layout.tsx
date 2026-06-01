import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'LevelFit',
  description: 'Coach and client fitness platform',
  themeColor: '#05060a',
  colorScheme: 'dark light',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
