import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video Generator Agent',
  description: 'Genera videos a partir de imágenes con IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
