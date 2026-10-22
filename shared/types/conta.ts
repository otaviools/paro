import { z } from 'zod'

export const TAMANHO_DO_CODIGO = 6

export const esquemaEmail = z.object({
  email: z.email('Digite um e-mail válido').max(254),
})

export const esquemaCodigo = z.object({
  codigo: z.string().regex(/^\d{6}$/, 'O código tem 6 números'),
})

export interface ContaDoAparelho {
  disponivel: boolean
  verificado: boolean
}

export interface CodigoEnviado {
  enviado: true
  expiraEmMinutos: number
}
