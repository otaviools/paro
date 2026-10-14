import type { z } from 'zod'

export function validarCom<Esquema extends z.ZodType>(esquema: Esquema) {
  return (dados: unknown): z.infer<Esquema> => {
    const resultado = esquema.safeParse(dados)
    if (resultado.success) return resultado.data
    const [primeiro] = resultado.error.issues
    const campo = primeiro?.path.join('.')
    throw createError({
      statusCode: 400,
      statusMessage: 'Dados inválidos',
      message: campo ? `${campo}: ${primeiro?.message}` : (primeiro?.message ?? 'Confira os dados enviados.'),
    })
  }
}
