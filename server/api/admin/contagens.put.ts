import { esquemaContagensDoDia } from '../../../shared/types/admin'

export default defineEventHandler(async (event) => {
  await exigirAdmin(event)
  const dados = await readValidatedBody(event, validarCom(esquemaContagensDoDia))
  await buscarRua(dados.ruaId)
  exigirDataPassada(dados.data)
  exigirFaixasUnicas(dados.contagens)
  const gravadas = await substituirContagensDoDia(dados)
  return { gravadas }
})
