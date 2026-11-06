import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nexus-app-ashy-theta.vercel.app'),
  alternates: {
    canonical: '/',
  },
  title: { 
    default: 'Nexus — The Real-Time Community Platform for Modern Teams & Creators', 
    template: '%s | Nexus - Real-Time Communities & Voice' 
  },
  description:
    'The real-time community platform for modern teams and creators. Instant chat, WebRTC voice and video spaces, granular moderation roles, and private 1-on-1 direct messages.',
  keywords: ['community', 'real-time chat', 'webrtc voice', 'group video', 'collaboration', 'creator spaces', 'moderation'],
  authors: [{ name: 'Nexus' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nexus-app-ashy-theta.vercel.app',
    siteName: 'Nexus',
    title: 'Nexus — The Real-Time Community Platform for Modern Teams & Creators',
    description:
      'Instant chat, WebRTC voice and video spaces, granular moderation roles, and private 1-on-1 direct messages.',
  },
  twitter: { 
    card: 'summary_large_image', 
    title: 'Nexus — The Real-Time Community Platform for Modern Teams & Creators', 
    description: 'Instant chat, WebRTC voice and video spaces, granular moderation roles, and private 1-on-1 direct messages.' 
  },
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
  colorScheme: 'dark light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply theme class before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var s = localStorage.getItem('nexus-ui-store');
                var data = s ? JSON.parse(s) : null;
                var theme = data?.state?.theme ?? 'dark';
                document.documentElement.classList.toggle('dark', theme === 'dark');
                document.documentElement.classList.toggle('light', theme === 'light');
              } catch(e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        style={{ background: 'hsl(232 28% 8%)' }}
      >
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'hsl(232 24% 11%)',
                  color: 'hsl(220 18% 96%)',
                  border: '1px solid hsl(232 18% 20%)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#22c55e', secondary: 'transparent' } },
                error: { iconTheme: { primary: '#ef4444', secondary: 'transparent' } },
              }}
            />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
