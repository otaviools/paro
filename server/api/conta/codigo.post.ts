import { codigosDeVerificacao } from '../../db/schema'
import { esquemaEmail, type CodigoEnviado } from '../../../shared/types/conta'

export default defineEventHandler(async (event): Promise<CodigoEnviado> => {
  exigirVerificacaoDisponivel()
  const { email } = await readValidatedBody(event, validarCom(esquemaEmail))
  const dispositivoId = await exigirDispositivo(event)
  const emailHash = hashDoEmail(email)
  const codigo = gerarCodigo()
  const id = crypto.randomUUID()
  await useDb().insert(codigosDeVerificacao).values({
    id,
    dispositivoId,
    emailHash,
    codigoHash: hashDoCodigo(id, codigo),
    expiraEm: new Date(Date.now() + MINUTOS_DE_VALIDADE_DO_CODIGO * 60 * 1000),
  })
  await enviarCodigoPorEmail(normalizarEmail(email), codigo, MINUTOS_DE_VALIDADE_DO_CODIGO)
  setResponseStatus(event, 202)
  return { enviado: true, expiraEmMinutos: MINUTOS_DE_VALIDADE_DO_CODIGO }
})
