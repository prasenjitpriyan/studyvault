import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'StudyVault - Reimagined Knowledge & Study Companion',
    template: '%s | StudyVault',
  },
  description:
    'Organise notes with markdown editor, master flashcards using active recall & spaced repetition (SM-2), and track tasks on a sleek Kanban board.',
  keywords: [
    'StudyVault',
    'Study hub',
    'Markdown notes',
    'Obsidian alternative',
    'Spaced repetition',
    'Flashcards',
    'SM-2 algorithm',
    'Kanban board',
    'Productivity app',
    'Next.js study planner',
    'Student dashboard',
  ],
  authors: [{ name: 'StudyVault Team' }],
  creator: 'StudyVault Team',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://studyvault.vercel.app',
    title: 'StudyVault - Reimagined Knowledge & Study Companion',
    description:
      'Organise notes with markdown editor, master flashcards using active recall & spaced repetition, and track tasks on a sleek Kanban board.',
    siteName: 'StudyVault',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyVault - Reimagined Knowledge & Study Companion',
    description:
      'Organise notes with markdown editor, master flashcards using active recall & spaced repetition, and track tasks on a sleek Kanban board.',
    creator: '@studyvault',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('studyvault_theme') || 'system';
                  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
