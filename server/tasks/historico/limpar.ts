import { lt } from 'drizzle-orm'
import { vagas } from '../../db/schema'

const DIAS_DE_RETENCAO = 90
const UM_DIA_EM_MS = 24 * 60 * 60 * 1000

export default defineTask({
  meta: {
    name: 'historico:limpar',
    description: 'Apaga vagas registradas há mais de 90 dias',
  },
  async run() {
    const limite = new Date(Date.now() - DIAS_DE_RETENCAO * UM_DIA_EM_MS)
    const apagadas = await useDb()
      .delete(vagas)
      .where(lt(vagas.chegada, limite))
      .returning({ id: vagas.id })
    return { result: apagadas.length }
  },
})
