import type { PainelDaVaga } from '../../../shared/types/vaga'

export default defineEventHandler(async (event): Promise<PainelDaVaga> => {
  const dispositivoId = await dispositivoAtual(event)
  if (!dispositivoId) return { atual: null, rotina: { chegada: null, saida: null, diasPorSemana: 0 } }
  const [[atual], rotina] = await Promise.all([listarVagas(dispositivoId, 'ativa'), rotinaNaRegiao(dispositivoId)])
  return { atual: atual ?? null, rotina }
})
