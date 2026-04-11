import { useEffect, useRef } from 'react'
import { Box, Typography, Paper, Button, Stack, Divider } from '@mui/material'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { useServer } from '../../../../context/ServerContext'

export default function Logs() {
  const { state, dispatch } = useServer()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.logs])

  return (
    <Stack spacing={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6">Logs serveur</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {state.logs.length} lignes
          </Typography>
        </Box>
        <Button size="small" variant="outlined" startIcon={<DeleteSweepIcon />}
          onClick={() => dispatch({ type: 'CLEAR_LOGS' })}>
          Effacer
        </Button>
      </Stack>

      <Paper sx={{ flex: 1, p: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ flex: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7 }}>
          {state.logs.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              Aucun log — démarrez le serveur pour voir les logs.
            </Typography>
          ) : (
            state.logs.map((line, i) => (
              <Box key={i} component="div" sx={{
                color: line.includes('[ERR]') || line.includes('Error')
                  ? 'error.main'
                  : line.includes('[Manager]')
                  ? 'primary.main'
                  : 'text.secondary',
              }}>
                {line}
              </Box>
            ))
          )}
          <div ref={endRef} />
        </Box>
      </Paper>
    </Stack>
  )
}
