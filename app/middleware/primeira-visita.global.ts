export const COOKIE_DE_BOAS_VINDAS = 'paro-boas-vindas'

const BOAS_VINDAS = '/boas-vindas'
const rotasLivres = ['/termos', '/catalogo']

// O app começa nas boas-vindas. Com a verificação de e-mail ligada no servidor, entrar exige
// o e-mail verificado neste aparelho; quem já verificou segue direto para onde ia (a home, por
// padrão). Sem a verificação ligada, vale o fluxo antigo: basta ter passado pelas boas-vindas.
export default defineNuxtRouteMiddleware(async (destino) => {
  if (rotasLivres.includes(destino.path) || destino.path.startsWith('/admin')) return

  const conta = await buscarContaDoAparelho()
  const liberado = conta.disponivel ? conta.verificado : Boolean(useCookie(COOKIE_DE_BOAS_VINDAS).value)

  if (destino.path === BOAS_VINDAS) {
    if (liberado) return navigateTo(destinoSeguro(destino.query.de))
    return
  }
  if (!liberado) return navigateTo({ path: BOAS_VINDAS, query: destino.path === '/' ? undefined : { de: destino.fullPath } })
})

function destinoSeguro(de: unknown): string {
  return typeof de === 'string' && de.startsWith('/') && !de.startsWith('//') ? de : '/'
}
