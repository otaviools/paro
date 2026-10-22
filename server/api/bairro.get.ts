import { z } from 'zod'
import type { BairroDaPosicao } from '../../shared/types/area'

const ENDERECO_DO_NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'
const CASAS_DECIMAIS = 3
const UM_DIA_EM_SEGUNDOS = 60 * 60 * 24

const consulta = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
})

interface RespostaDoNominatim {
  address?: Record<string, string | undefined>
}

const buscarBairro = defineCachedFunction(async (lat: number, lng: number): Promise<BairroDaPosicao | null> => {
  const resposta = await $fetch<RespostaDoNominatim>(ENDERECO_DO_NOMINATIM, {
    query: { 'format': 'jsonv2', lat, 'lon': lng, 'zoom': 16, 'addressdetails': 1, 'accept-language': 'pt-BR' },
    headers: { 'User-Agent': 'Paro/1.0 (prototipo academico ESAMC Uberlandia)' },
    timeout: 8000,
  })
  const endereco = resposta.address
  const bairro = endereco?.suburb ?? endereco?.neighbourhood ?? endereco?.quarter ?? endereco?.city_district
  const cidade = endereco?.city ?? endereco?.town ?? endereco?.municipality ?? endereco?.village
  return bairro && cidade ? { bairro, cidade } : null
}, { maxAge: UM_DIA_EM_SEGUNDOS, name: 'bairro', getKey: (lat: number, lng: number) => `${lat}:${lng}` })

export default defineEventHandler(async (event): Promise<BairroDaPosicao | null> => {
  const { lat, lng } = await getValidatedQuery(event, validarCom(consulta))
  return buscarBairro(Number(lat.toFixed(CASAS_DECIMAIS)), Number(lng.toFixed(CASAS_DECIMAIS))).catch(() => null)
})
