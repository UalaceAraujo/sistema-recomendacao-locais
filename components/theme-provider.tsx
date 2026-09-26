'use client' // Executado no cliente (Client Component) para manipular classes no DOM e ler preferências do sistema/localStorage

import * as React from 'react'
// Importa o provedor de temas da biblioteca 'next-themes'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

/**
 * Provedor de Tema da Aplicação:
 * Envolve os componentes da árvore (geralmente no RootLayout) para gerenciar
 * alternância entre tema claro ('light'), escuro ('dark') e automático ('system').
 *
 * Ele injeta automaticamente a classe 'dark' no elemento <html> quando necessário.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}