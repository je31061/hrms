import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { HelpWorkflow } from '@/components/layout/help-workflow';
import { ThemeProvider } from 'next-themes';
import { DisplaySettingsApplier } from '@/components/layout/display-settings-applier';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HRMS - 인사관리시스템',
  description: '한국형 인사관리시스템',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <DisplaySettingsApplier />
            <Sidebar />
            <Header />
            <main className="ml-60 mt-14 min-h-[calc(100vh-3.5rem)] p-6">
              {children}
            </main>
            <Toaster position="top-right" />
            <HelpWorkflow />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
