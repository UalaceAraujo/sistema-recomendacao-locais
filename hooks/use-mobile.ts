import * as React from 'react'

// Ponto de quebra padrão para dispositivos móveis (telas menores que 768px, correspondente ao 'md' do Tailwind)
const MOBILE_BREAKPOINT = 768

/**
 * Hook customizado para detectar se o usuário está acessando em um dispositivo móvel.
 * Retorna true para telas menores que 768px e false para telas maiores.
 */
export function useIsMobile() {
  // Inicia como undefined para evitar inconsistências de hidratação entre SSR e Client
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Cria uma consulta de mídia para monitorar alterações na largura da janela
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Função disparada sempre que a tela cruza o ponto de corte (redimensionamento ou rotação)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Registra o ouvinte de evento na media query
    mql.addEventListener('change', onChange)
    
    // Define o valor inicial assim que o componente é montado no navegador
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Remove o listener para evitar vazamentos de memória na desmontagem do componente
    return () => mql.removeEventListener('change', onChange)
  }, [])

  // Converte explicitamente para booleano puro (evita retornar undefined)
  return !!isMobile
}