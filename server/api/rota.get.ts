import { z } from 'zod'
import type { ModoDaRota, RotaPelasRuas } from '../../shared/types/rota'

// OSRM dos servidores do OpenStreetMap Alemanha (FOSSGIS): sem chave, com perfil de carro e a pé.
// Uso limitado e sem garantia: serve para o protótipo, não para produção.
const SERVIDOR_POR_MODO: Record<ModoDaRota, string> = {
  carro: 'https://routing.openstreetmap.de/routed-car/route/v1/driving',
  a_pe: 'https://routing.openstreetmap.de/routed-foot/route/v1/foot',
}
// A origem pode ser a posição da pessoa: vai arredondada a 3 casas (~100 m) e sem nenhum
// identificador. O destino é sempre um ponto de rua (nunca o ponto exato da vaga).
const CASAS_DECIMAIS_DA_ORIGEM = 3
const CASAS_DECIMAIS_DO_DESTINO = 5
const DEZ_MINUTOS_EM_SEGUNDOS = 60 * 10

const coordenada = z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, 'Use lng,lat').transform((texto) => {
  const [lng = 0, lat = 0] = texto.split(',').map(Number)
  return [lng, lat] as [number, number]
}).refine(([lng, lat]) => Math.abs(lng) <= 180 && Math.abs(lat) <= 90, 'Coordenada fora do mapa')

const consulta = z.object({
  origem: coordenada,
  destino: coordenada,
  modo: z.enum(['carro', 'a_pe']).default('carro'),
})

interface RespostaDoOsrm {
  code: string
  routes?: { distance: number, duration: number, geometry: { coordinates: [number, number][] } }[]
}

const arredondar = ([lng, lat]: [number, number], casas: number) => `${lng.toFixed(casas)},${lat.toFixed(casas)}`

const buscarRota = defineCachedFunction(async (origem: string, destino: string, modo: ModoDaRota): Promise<RotaPelasRuas | null> => {
  const resposta = await $fetch<RespostaDoOsrm>(`${SERVIDOR_POR_MODO[modo]}/${origem};${destino}`, {
    query: { overview: 'full', geometries: 'geojson' },
    headers: { 'User-Agent': 'Paro/1.0 (prototipo academico ESAMC Uberlandia)' },
    timeout: 8000,
  })
  const rota = resposta.code === 'Ok' ? resposta.routes?.[0] : undefined
  if (!rota || rota.geometry.coordinates.length < 2) return null
  return {
    pontos: rota.geometry.coordinates,
    distanciaM: Math.round(rota.distance),
    duracaoMin: Math.max(1, Math.round(rota.duration / 60)),
  }
}, { maxAge: DEZ_MINUTOS_EM_SEGUNDOS, name: 'rota', getKey: (origem: string, destino: string, modo: ModoDaRota) => `${modo}:${origem}:${destino}` })

export default defineEventHandler(async (event): Promise<RotaPelasRuas | null> => {
  const { origem, destino, modo } = await getValidatedQuery(event, validarCom(consulta))
  return buscarRota(arredondar(origem, CASAS_DECIMAIS_DA_ORIGEM), arredondar(destino, CASAS_DECIMAIS_DO_DESTINO), modo).catch(() => null)
})
