import { useServer } from '../../../context/ServerContext'
import { serverService } from '../services/serverService'

export function useServerControls() {
  const { state, dispatch } = useServer()

  const canStart = state.status === 'stopped' || state.status === 'crashed'
  const canStop = state.status === 'running' || state.status === 'starting'

  const start = async () => {
    dispatch({ type: 'SET_STATUS', payload: 'starting' })
    const res = await serverService.start()
    if (!res.success) {
      alert(`Erreur: ${res.error}`)
      dispatch({ type: 'SET_STATUS', payload: 'stopped' })
    }
  }

  const stop = async () => {
    dispatch({ type: 'SET_STATUS', payload: 'stopping' })
    await serverService.stop()
  }

  const restart = async () => {
    dispatch({ type: 'SET_STATUS', payload: 'stopping' })
    await serverService.restart()
  }

  return { start, stop, restart, canStart, canStop }
}
