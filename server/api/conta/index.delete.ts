import { eq } from 'drizzle-orm'
import { dispositivos, pessoas } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const dispositivoId = await dispositivoAtual(event)
  if (dispositivoId) {
    const pessoa = await pessoaDoDispositivo(dispositivoId)
    await useDb().transaction(async (transacao) => {
      if (pessoa) await transacao.delete(pessoas).where(eq(pessoas.id, pessoa.id))
      await transacao.delete(dispositivos).where(eq(dispositivos.id, dispositivoId))
    })
  }
  await clearUserSession(event)
  return { apagado: true }
})
