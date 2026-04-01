import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Privacy Data Score™ — Discover What Your Data Is Worth',
  description: 'Find out your privacy score, the dollar value of your personal data, and which data brokers have your information.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className} style={{ background: '#0a0a0f' }}>
        {children}
      </body>
    </html>
  )
}
