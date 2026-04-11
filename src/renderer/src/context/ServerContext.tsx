import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import type { ServerStatus, SystemStats } from '../types'
import { configService } from '../games/palworld/services/configService'
import { monitorService } from '../services/monitorService'
import { serverService } from '../games/palworld/services/serverService'

interface ServerState {
  status: ServerStatus
  serverPath: string
  stats: SystemStats | null
  logs: string[]
}

type Action =
  | { type: 'SET_STATUS'; payload: ServerStatus }
  | { type: 'SET_SERVER_PATH'; payload: string }
  | { type: 'SET_STATS'; payload: SystemStats }
  | { type: 'ADD_LOG'; payload: string }
  | { type: 'CLEAR_LOGS' }

const initialState: ServerState = {
  status: 'stopped',
  serverPath: '',
  stats: null,
  logs: [],
}

function reducer(state: ServerState, action: Action): ServerState {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload }
    case 'SET_SERVER_PATH':
      return { ...state, serverPath: action.payload }
    case 'SET_STATS':
      return { ...state, stats: action.payload }
    case 'ADD_LOG':
      return { ...state, logs: [...state.logs.slice(-499), action.payload] }
    case 'CLEAR_LOGS':
      return { ...state, logs: [] }
    default:
      return state
  }
}

const ServerContext = createContext<{
  state: ServerState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function ServerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    configService.getServerPath().then((path) => {
      if (path) dispatch({ type: 'SET_SERVER_PATH', payload: path })
    })

    monitorService.startPolling()
    const stopMonitor = monitorService.onStats((stats) => {
      dispatch({ type: 'SET_STATS', payload: stats })
    })

    const stopLogs = serverService.onLog((line) => {
      dispatch({ type: 'ADD_LOG', payload: line })
    })

    const statusInterval = setInterval(async () => {
      const status = await serverService.getStatus()
      dispatch({ type: 'SET_STATUS', payload: status })
    }, 3000)

    return () => {
      stopMonitor()
      stopLogs()
      clearInterval(statusInterval)
      monitorService.stopPolling()
    }
  }, [])

  return <ServerContext.Provider value={{ state, dispatch }}>{children}</ServerContext.Provider>
}

export function useServer() {
  const ctx = useContext(ServerContext)
  if (!ctx) throw new Error('useServer must be used within ServerProvider')
  return ctx
}
