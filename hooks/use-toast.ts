'use client' // Executado no cliente (Client Component) para gerenciar estado em memória e timers no navegador

import * as React from 'react'

// Tipos base importados do componente visual de toast
import type { ToastActionElement, ToastProps } from '@/components/ui/toast'

// Quantidade máxima de notificações exibidas simultaneamente na tela
const TOAST_LIMIT = 1
// Tempo de espera (em milissegundos) antes de remover o toast desmontado da memória
const TOAST_REMOVE_DELAY = 1000000

// Estrutura completa de uma notificação individual
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// Tipos de ações permitidas no redutor de estado
const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',         // Adiciona uma nova notificação
  UPDATE_TOAST: 'UPDATE_TOAST',   // Atualiza os dados de um toast já aberto
  DISMISS_TOAST: 'DISMISS_TOAST', // Inicia a animação de fechamento
  REMOVE_TOAST: 'REMOVE_TOAST',   // Remove definitivamente da memória
} as const

// Contador interno incremental para gerar identificadores únicos para cada toast
let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

// Definição das ações suportadas pelo reducer
type Action =
  | {
      type: ActionType['ADD_TOAST']
      toast: ToasterToast
    }
  | {
      type: ActionType['UPDATE_TOAST']
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType['DISMISS_TOAST']
      toastId?: ToasterToast['id']
    }
  | {
      type: ActionType['REMOVE_TOAST']
      toastId?: ToasterToast['id']
    }

// Formato do estado global dos toasts
interface State {
  toasts: ToasterToast[]
}

// Mapa para guardar os timers de remoção de cada toast e evitar chamadas duplicadas
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Enfileira a remoção definitiva do toast após o tempo definido em TOAST_REMOVE_DELAY
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * Reducer responsável por atualizar a lista de notificações com base na ação disparada
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        // Adiciona o novo toast no topo e respeita o limite máximo de exibição
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      }

    case 'DISMISS_TOAST': {
      const { toastId } = action

      // Agenda a limpeza definitiva da memória após dispensar visualmente
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      // Altera o estado open para false, ativando a animação de saída
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      }
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Lista de funções ouvintes (listeners) inscritas para receber mudanças de estado
const listeners: Array<(state: State) => void> = []

// Estado mantido fora dos componentes do React para permitir chamadas imperativas via toast(...)
let memoryState: State = { toasts: [] }

/**
 * Dispara uma alteração no estado global e avisa todos os componentes ouvintes
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, 'id'>

/**
 * Função utilitária imperativa para disparar uma notificação de qualquer lugar do código
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    })
    
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * Hook do React para ler os toasts ativos e disparar notificações dentro dos componentes
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    // Inscreve este componente para receber atualizações do estado em memória
    listeners.push(setState)
    
    // Desinscreve o componente ao desmontar
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  }
}

export { useToast, toast }