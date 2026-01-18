import './globals.css'
import { Suspense } from 'react'
import { Inter } from 'next/font/google'
import { NavigationLoaderProvider } from '@/components/NavigationLoaderProvider'
import { SidebarProvider } from '@/components/SidebarProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Digicode Immo - Dashboard',
  description: 'Plateforme de gestion immobilière pour logements et chambres au Sénégal',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} page-transition`}>
        <Suspense fallback={null}>
          <NavigationLoaderProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </NavigationLoaderProvider>
        </Suspense>
      </body>
    </html>
  )
}

