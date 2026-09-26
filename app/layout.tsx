// Importa tipos do Next.js para tipagem estática
import type { Metadata, Viewport } from 'next'

// Importa fontes do Google Fonts otimizadas pelo Next.js
import { Inter, JetBrains_Mono } from 'next/font/google'

// Ferramenta de métricas e analytics da Vercel (importação correta para React/Next App Router)
import { Analytics } from '@vercel/analytics/react'

// Folha de estilos global do projeto
import './globals.css'

// Configurações das fontes baixadas no build
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

// Configuração de metadados da página (SEO, títulos e favicons)
export const metadata: Metadata = {
  title: 'MyVicinity - Encontre o melhor lugar para morar',
  description:
    'Analise qualquer localidade e descubra a pontuacao de qualidade de vida com base em mercados, farmacias, hospitais, escolas e mais, usando dados do OpenStreetMap.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

// Configurações da janela de visualização do navegador (viewport móvel)
export const viewport: Viewport = {
  themeColor: '#1a9a6c',
  userScalable: true,
}

// Layout Raiz: envolve todas as páginas da aplicação
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {/* Renderiza a página ativa */}
        {children}

        {/* Coleta métricas de acesso de forma anônima */}
        <Analytics />
      </body>
    </html>
  )
}