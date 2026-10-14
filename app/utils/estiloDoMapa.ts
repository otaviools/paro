import type { InjectionKey, ShallowRef } from 'vue'
import type { LayerSpecification, Map as MapaLibre, StyleSpecification } from 'maplibre-gl'

export const chaveDoMapa: InjectionKey<ShallowRef<MapaLibre | undefined>> = Symbol('mapa')

export const ESTILO_BASE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

export interface CoresDoMapa {
  fundo: string
  quadra: string
  parque: string
  via: string
  meioFio: string
  agua: string
  texto: string
  traco: string
  fundoDoPadrao: string
  acao: string
}

export function lerCoresDoMapa(): CoresDoMapa {
  const estilo = getComputedStyle(document.documentElement)
  const ler = (nome: string) => estilo.getPropertyValue(nome).trim()
  return {
    fundo: ler('--paro-mapa-fundo'),
    quadra: ler('--paro-mapa-quadra'),
    parque: ler('--paro-mapa-parque'),
    via: ler('--paro-mapa-via'),
    meioFio: ler('--paro-mapa-meio-fio'),
    agua: ler('--paro-superficie-ativa'),
    texto: ler('--paro-texto-terciario'),
    traco: ler('--paro-padrao-traco'),
    fundoDoPadrao: ler('--paro-padrao-fundo'),
    acao: ler('--paro-acao'),
  }
}

export async function carregarEstilo(cores: CoresDoMapa): Promise<StyleSpecification> {
  try {
    const estilo = await $fetch<StyleSpecification>(ESTILO_BASE)
    return { ...estilo, layers: estilo.layers.flatMap(camada => recolorir(camada, cores)) }
  }
  catch {
    return estiloSemInternet(cores)
  }
}

function estiloSemInternet(cores: CoresDoMapa): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [{ id: 'background', type: 'background', paint: { 'background-color': cores.fundo } }],
  }
}

function recolorir(camada: LayerSpecification, cores: CoresDoMapa): LayerSpecification[] {
  const id = camada.id
  if (/boundary|poi|housenumber|aeroway|place_(country|state)/.test(id)) return []
  if (camada.type === 'background') return [{ ...camada, paint: { 'background-color': cores.fundo } }]
  if (camada.type === 'fill') return [{ ...camada, paint: { ...camada.paint, 'fill-color': corDoPreenchimento(id, cores), 'fill-outline-color': corDoPreenchimento(id, cores) } }]
  if (camada.type === 'line') return [{ ...camada, paint: { ...camada.paint, 'line-color': corDaLinha(id, cores) } }]
  if (camada.type === 'symbol') return [{ ...camada, paint: { ...camada.paint, 'text-color': cores.texto, 'text-halo-color': cores.fundo } }]
  return [camada]
}

function corDoPreenchimento(id: string, cores: CoresDoMapa): string {
  if (id.includes('water')) return cores.agua
  if (/park|landcover|wood|grass|cemetery/.test(id)) return cores.parque
  if (id.includes('building')) return cores.quadra
  return cores.fundo
}

function corDaLinha(id: string, cores: CoresDoMapa): string {
  if (id.includes('water')) return cores.agua
  if (/case|casing|rail/.test(id)) return cores.meioFio
  return cores.via
}

export function adicionarPadroes(mapa: MapaLibre, cores: CoresDoMapa) {
  mapa.addImage('padrao-apertado', desenharHachura(5, cores), { pixelRatio: 2 })
  mapa.addImage('padrao-lotado', desenharHachura(2.8, cores), { pixelRatio: 2 })
}

function desenharHachura(passo: number, cores: CoresDoMapa): ImageData {
  const repeticoes = passo === 5 ? 2 : 5
  const lado = Math.round(passo * repeticoes * 2)
  const canvas = document.createElement('canvas')
  canvas.width = lado
  canvas.height = lado
  const contexto = canvas.getContext('2d')
  if (!contexto) return new ImageData(lado, lado)
  contexto.fillStyle = cores.fundoDoPadrao
  contexto.fillRect(0, 0, lado, lado)
  contexto.strokeStyle = cores.traco
  contexto.lineWidth = 2.4
  for (let deslocamento = -lado; deslocamento <= lado * 2; deslocamento += passo * 2) {
    contexto.beginPath()
    contexto.moveTo(deslocamento, lado)
    contexto.lineTo(deslocamento + lado, 0)
    contexto.stroke()
  }
  return contexto.getImageData(0, 0, lado, lado)
}

export function limitesDosPontos(pontos: [number, number][]): [[number, number], [number, number]] {
  const lngs = pontos.map(([lng]) => lng)
  const lats = pontos.map(([, lat]) => lat)
  return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]]
}
