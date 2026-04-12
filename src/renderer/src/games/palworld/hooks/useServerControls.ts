import { useServer } from '../../../context/ServerContext'
import { useNotification } from '../../../context/NotificationContext'
import { serverService } from '../services/serverService'

export function useServerControls() {
  const { state, dispatch } = useServer()
  const { notify } = useNotification()

  const canStart = state.status === 'stopped' || state.status === 'crashed'
  const canStop = state.status === 'running' || state.status === 'starting'

  const start = async () => {
    dispatch({ type: 'SET_STATUS', payload: 'starting' })
    const res = await serverService.start()
    if (!res.success) {
      notify(res.error ?? 'Impossible de démarrer le serveur', 'error')
      dispatch({ type: 'SET_STATUS', payload: 'stopped' })
    }
  }

  const stop = async () => {
    dispatch({ type: 'SET_STATUS', payload: 'stopping' })
    const res = await serverService.stop()
    if (!res.success) notify(res.error ?? 'Impossible d\'arrêter le serveur', 'error')
  }

  const restart = async () => {
    dispatch({ type: 'SET_STATUS', payload: 'stopping' })
    const res = await serverService.restart()
    if (!res.success) notify(res.error ?? 'Impossible de redémarrer le serveur', 'error')
  }

  return { start, stop, restart, canStart, canStop }
}
