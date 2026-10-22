import { z } from 'zod'

const ESPERA_APOS_ERRO_MS = 800

const corpo = z.object({ senha: z.string().min(1, 'Digite a senha').max(200) })

export default defineEventHandler(async (event) => {
  const { senha } = await readValidatedBody(event, validarCom(corpo))
  if (!adminConfigurado()) {
    throw createError({ statusCode: 503, statusMessage: 'Área de admin desligada. Defina NUXT_ADMIN_PASSWORD no .env com 12 caracteres ou mais.' })
  }
  if (!senhaDeAdminConfere(senha)) {
    await new Promise(resolver => setTimeout(resolver, ESPERA_APOS_ERRO_MS))
    throw createError({ statusCode: 401, statusMessage: 'Senha incorreta.' })
  }
  await setUserSession(event, { secure: { admin: true } })
  return { admin: true }
})
