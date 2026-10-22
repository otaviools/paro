import type { LineString, Position } from 'geojson'
import type { MapaDaArea } from '#shared/types/previsao'
import type { PainelDaVaga } from '#shared/types/vaga'
import { detectarEstacionamento, JANELA_DE_MOVIMENTO_MS, type EstacionamentoDetectado, type LeituraDeGps, type RuaParaDeteccao } from '#shared/utils/estacionamento'

const DISTANCIA_PARA_NOVA_PARADA_M = 200
const ROTA_DE_REGISTRO = '/vaga/registrar'

interface Entorno {
  areaId: string
  ruas: RuaParaDeteccao[]
  referencia: Position
}

interface Contexto {
  leituras: LeituraDeGps[]
  vigia: number | null
  ultimaParada: [number, number] | null
  entorno: Entorno | null
  areaId: Ref<string | undefined>
  pergunta: Ref<EstacionamentoDetectado | null>
  rotaAtual: () => string
}

export default defineNuxtPlugin(() => {
  const { preferencias } = usePreferencias()
  const { areaId } = useAreaAtual()
  const { pergunta } = useDeteccaoDeVaga()
  const roteador = useRouter()
  const contexto: Contexto = { leituras: [], vigia: null, ultimaParada: null, entorno: null, areaId, pergunta, rotaAtual: () => roteador.currentRoute.value.path }
  watch(() => preferencias.value.localizacaoContinua, ligado => (ligado ? iniciar(contexto) : parar(contexto)), { immediate: true })
})

function iniciar(contexto: Contexto) {
  if (contexto.vigia !== null || !window.isSecureContext || !navigator.geolocation) return
  contexto.vigia = navigator.geolocation.watchPosition(posicao => registrarLeitura(contexto, posicao), () => undefined, { enableHighAccuracy: true, maximumAge: 5000 })
}

function parar(contexto: Contexto) {
  if (contexto.vigia !== null) navigator.geolocation.clearWatch(contexto.vigia)
  contexto.vigia = null
  contexto.leituras.length = 0
}

function registrarLeitura(contexto: Contexto, { coords, timestamp }: GeolocationPosition) {
  const posicao: [number, number] = [coords.longitude, coords.latitude]
  contexto.leituras.push({ posicao, tempo: timestamp })
  while (contexto.leituras.length && contexto.leituras[0]!.tempo < timestamp - JANELA_DE_MOVIMENTO_MS * 2) contexto.leituras.shift()
  if (contexto.ultimaParada && distanciaEmMetros(contexto.ultimaParada, posicao) >= DISTANCIA_PARA_NOVA_PARADA_M) contexto.ultimaParada = null
  void avaliar(contexto)
}

async function avaliar(contexto: Contexto) {
  const entorno = await carregarEntorno(contexto)
  if (!entorno) return
  const detectado = detectarEstacionamento(contexto.leituras, entorno.ruas, entorno.referencia)
  if (!detectado || mesmaParada(contexto, detectado)) return
  contexto.ultimaParada = detectado.ponto
  if (!(await podePerguntar(contexto))) return
  contexto.pergunta.value = detectado
  if (document.hidden) {
    await mostrarNotificacao('Estacionou?', { body: `Toque para confirmar a vaga na ${detectado.nome}.`, tag: 'paro-estacionou', url: '/' })
  }
}

async function carregarEntorno(contexto: Contexto): Promise<Entorno | null> {
  const areaId = contexto.areaId.value
  if (!areaId || contexto.entorno?.areaId === areaId) return contexto.entorno
  const mapa = await $fetch<MapaDaArea>('/api/mapa', { query: { area: areaId } }).catch(() => null)
  if (!mapa) return null
  const ruas = mapa.ruas.features.map(feature => ({ ruaId: feature.properties.ruaId, nome: feature.properties.nome, trajeto: feature.geometry as LineString }))
  contexto.entorno = { areaId, ruas, referencia: mapa.referencia.coordinates }
  return contexto.entorno
}

function mesmaParada(contexto: Contexto, detectado: EstacionamentoDetectado): boolean {
  return contexto.ultimaParada !== null && distanciaEmMetros(contexto.ultimaParada, detectado.ponto) < DISTANCIA_PARA_NOVA_PARADA_M
}

async function podePerguntar(contexto: Contexto): Promise<boolean> {
  if (contexto.pergunta.value || silenciado() || contexto.rotaAtual() === ROTA_DE_REGISTRO) return false
  const painel = await $fetch<PainelDaVaga>('/api/vagas/atual').catch(() => null)
  return !painel?.atual
}
