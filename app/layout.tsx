import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DermaAssess AI Health Hub',
  description: 'AI-powered skin triage, prescription scanning, and health context.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
