import { createTransport, type Transporter } from 'nodemailer'

const VALOR_DE_EXEMPLO = 'SUA_SENHA_AQUI'
const PORTA_COM_TLS = 465
const CID_DA_LOGO = 'logo-paro'
const CID_DA_LOGO_ESCURA = 'logo-paro-escuro'

let transporte: Transporter | null = null

export function envioDeEmailConfigurado(): boolean {
  const { smtpHost, smtpUser, smtpPassword, emailRemetente } = useRuntimeConfig()
  return Boolean(smtpHost && smtpUser && smtpPassword && smtpPassword !== VALOR_DE_EXEMPLO && emailRemetente)
}

export async function enviarCodigoPorEmail(email: string, codigo: string, minutos: number): Promise<void> {
  if (!envioDeEmailConfigurado()) {
    console.info(`[parô] código de verificação para ${mascararEmail(email)}: ${codigo} (envio de e-mail desligado, defina NUXT_SMTP_HOST, NUXT_SMTP_USER, NUXT_SMTP_PASSWORD e NUXT_EMAIL_REMETENTE)`)
    return
  }
  const html = await renderEmailComponent('CodigoDeVerificacao', { codigo, minutos })
  // Logo padrão num selo creme (legível também quando o Gmail inverte as cores) e versão para
  // clientes que aplicam o tema escuro do próprio e-mail. Ver app/emails/CodigoDeVerificacao.vue.
  const [logo, logoEscura] = await Promise.all([
    useStorage('assets:server').getItemRaw<Buffer>('email/logo-selo-creme.png'),
    useStorage('assets:marca-logo').getItemRaw<Buffer>('logo-paro-fundo-escuro.png'),
  ])
  const anexos = [
    { arquivo: logo, cid: CID_DA_LOGO },
    { arquivo: logoEscura, cid: CID_DA_LOGO_ESCURA },
  ].flatMap(({ arquivo, cid }) => (arquivo ? [{ filename: `${cid}.png`, content: Buffer.from(arquivo), cid, contentDisposition: 'inline' as const }] : []))
  await abrirTransporte().sendMail({
    from: useRuntimeConfig().emailRemetente,
    to: email,
    subject: `Seu código do Parô: ${codigo}`,
    html: typeof html === 'string' ? html : html.html,
    text: `Seu código do Parô é ${codigo}. Ele vale por ${minutos} minutos.`,
    attachments: anexos,
  }).catch((erro: Error) => {
    console.error(`[parô] falha ao enviar e-mail para ${mascararEmail(email)}: ${erro.message}`)
    throw createError({ statusCode: 502, statusMessage: 'Não foi possível enviar o e-mail agora. Tente de novo em alguns minutos.' })
  })
}

function abrirTransporte(): Transporter {
  if (transporte) return transporte
  const { smtpHost, smtpPort, smtpUser, smtpPassword } = useRuntimeConfig()
  const porta = Number(smtpPort) || PORTA_COM_TLS
  transporte = createTransport({
    host: smtpHost,
    port: porta,
    secure: porta === PORTA_COM_TLS,
    auth: { user: smtpUser, pass: smtpPassword },
  })
  return transporte
}
