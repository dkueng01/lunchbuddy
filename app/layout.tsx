import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LunchBuddy',
  description: 'Simplify your team’s daily lunch plans with LunchBuddy. Vote on lunch options, volunteer to organize, and manage group orders—all in one easy, collaborative platform.'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
