import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'PRD Collab - Smart PRD Collaboration Platform',
  description: 'AI-powered PRD collaboration tool for engineering teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
