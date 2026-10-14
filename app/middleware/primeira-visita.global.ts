export const COOKIE_DE_BOAS_VINDAS = 'paro-boas-vindas'

const rotasLivres = ['/boas-vindas', '/termos', '/catalogo']

export default defineNuxtRouteMiddleware((destino) => {
  const visitou = useCookie<string | null>(COOKIE_DE_BOAS_VINDAS)
  if (visitou.value || rotasLivres.includes(destino.path)) return
  return navigateTo({ path: '/boas-vindas', query: destino.path === '/' ? undefined : { de: destino.fullPath } })
})
