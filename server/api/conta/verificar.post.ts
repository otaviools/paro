import { esquemaCodigo, type ContaDoAparelho } from '../../../shared/types/conta'

export default defineEventHandler(async (event): Promise<ContaDoAparelho> => {
  exigirVerificacaoDisponivel()
  const { codigo } = await readValidatedBody(event, validarCom(esquemaCodigo))
  const dispositivoId = await exigirDispositivo(event)
  const valido = await codigoQueConfere(dispositivoId, codigo)
  if (!valido) throw createError({ statusCode: 400, statusMessage: 'Código incorreto ou vencido. Confira o último e-mail ou peça outro código.' })
  await ligarPessoaAoDispositivo(valido.emailHash, dispositivoId)
  return { disponivel: true, verificado: true }
})
