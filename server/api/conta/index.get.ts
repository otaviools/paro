import type { ContaDoAparelho } from '../../../shared/types/conta'

export default defineEventHandler(async (event): Promise<ContaDoAparelho> => {
  const dispositivoId = await dispositivoAtual(event)
  const pessoa = dispositivoId ? await pessoaDoDispositivo(dispositivoId) : null
  return { disponivel: verificacaoDisponivel(), verificado: pessoa !== null }
})
