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
  title: { default: 'Nexus', template: '%s · Nexus' },
  description:
    'The next-generation community, collaboration, and communication platform. AI-powered, beautifully designed, built for everyone.',
  keywords: ['community', 'chat', 'collaboration', 'gaming', 'education', 'creator'],
  authors: [{ name: 'Nexus Team' }],
  openGraph: {
    type: 'website',
    title: 'Nexus — Community Reimagined',
    description: 'The next-generation community platform with AI copilot, real-time collaboration, and beautiful design.',
    siteName: 'Nexus',
  },
  twitter: { card: 'summary_large_image', title: 'Nexus', description: 'Community reimagined.' },
  icons: { icon: '/favicon.svg' },
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
