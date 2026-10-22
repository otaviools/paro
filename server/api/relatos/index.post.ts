import { esquemaRelato, type RelatoRegistrado } from '../../../shared/types/relato'

export default defineEventHandler(async (event): Promise<RelatoRegistrado> => {
  const dados = await readValidatedBody(event, validarCom(esquemaRelato))
  const rua = await buscarRua(dados.ruaId)
  const dispositivoId = await exigirDispositivo(event)
  const registrado = await registrarRelato({ ...dados, trajeto: rua.trajeto, dispositivoId })
  setResponseStatus(event, 201)
  return registrado
})
