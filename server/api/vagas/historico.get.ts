export default defineEventHandler(async (event) => {
  const dispositivoId = await dispositivoAtual(event)
  if (!dispositivoId) return []
  return listarVagas(dispositivoId, 'encerradas')
})
