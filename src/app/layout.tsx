import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Photomark — Signez vos photos de produits',
  description:
    'Ajoutez automatiquement votre logo et numéro de téléphone sur vos photos de produits. Tout se passe dans votre navigateur, aucune photo n\'est envoyée sur un serveur.',
  keywords: ['photo', 'logo', 'watermark', 'produit', 'whatsapp', 'instagram', 'commerçant'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
