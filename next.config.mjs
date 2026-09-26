/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações do compilador de TypeScript
  typescript: {
    // ATENÇÃO: Ignora erros de tipagem durante o comando de build (npm run build).
    // Geradores automáticos costumam ligar isso para forçar o deploy mesmo com código quebrado.
    // Enquanto estivermos ajustando o projeto, pode mantê-lo em true, mas o ideal ao final
    // é deixar como false para garantir que seu código esteja 100% tipado e seguro.
    ignoreBuildErrors: true,
  },

  // Configurações do componente de imagem (<Image /> do next/image)
  images: {
    // Desativa a otimização automática de imagens pelo servidor Node/Vercel.
    // Útil quando exporta o projeto de forma estática (SSG) ou para evitar cobranças de processamento.
    unoptimized: true,
  },
}

// Exporta as opções para o ecossistema do Next.js
export default nextConfig