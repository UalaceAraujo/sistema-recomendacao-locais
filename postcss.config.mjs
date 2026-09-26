/** @type {import('postcss-load-config').Config} */
const config = {
  // Lista de plugins do pipeline do PostCSS
  plugins: {
    // Plugin oficial do Tailwind CSS v4 que compila as diretivas (@import 'tailwindcss', @theme, etc.)
    // O motor Oxide interno do Tailwind v4 já inclui prefixação automática de navegadores (Autoprefixer integrado)
    '@tailwindcss/postcss': {},
  },
}

// Exporta as configurações de processamento de estilos para o Next.js
export default config