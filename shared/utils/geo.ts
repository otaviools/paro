import type { LineString, Position } from 'geojson'

const RAIO_DA_TERRA_M = 6371000

export function distanciaEmMetros(a: Position, b: Position): number {
  const [lngA = 0, latA = 0] = a
  const [lngB = 0, latB = 0] = b
  const dLat = radianos(latB - latA)
  const dLng = radianos(lngB - lngA)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radianos(latA)) * Math.cos(radianos(latB)) * Math.sin(dLng / 2) ** 2
  return 2 * RAIO_DA_TERRA_M * Math.asin(Math.sqrt(h))
}

export function pontoMedio(trajeto: LineString): [number, number] {
  const [lng = 0, lat = 0] = trajeto.coordinates[Math.floor(trajeto.coordinates.length / 2)] ?? []
  return [lng, lat]
}

export function distanciaAteTrajeto(ponto: Position, trajeto: LineString): number {
  const vertices = trajeto.coordinates
  if (vertices.length < 2) return Math.min(...vertices.map(vertice => distanciaEmMetros(ponto, vertice)))
  return Math.min(...vertices.slice(1).map((fim, indice) => distanciaAteSegmento(ponto, vertices[indice]!, fim)))
}

export function distanciaAteSegmento(ponto: Position, inicio: Position, fim: Position): number {
  const [lng = 0, lat = 0] = ponto
  const escalaX = Math.cos(radianos(lat))
  const ax = ((inicio[0] ?? 0) - lng) * escalaX
  const ay = (inicio[1] ?? 0) - lat
  const bx = ((fim[0] ?? 0) - lng) * escalaX
  const by = (fim[1] ?? 0) - lat
  const comprimento = (bx - ax) ** 2 + (by - ay) ** 2
  const t = comprimento === 0 ? 0 : Math.min(1, Math.max(0, -(ax * (bx - ax) + ay * (by - ay)) / comprimento))
  const maisProximo: Position = [lng + (ax + t * (bx - ax)) / escalaX, lat + ay + t * (by - ay)]
  return distanciaEmMetros(ponto, maisProximo)
}

export function verticeMaisProximo(ponto: Position, trajeto: LineString): [number, number] {
  const ordenados = [...trajeto.coordinates].sort((a, b) => distanciaEmMetros(ponto, a) - distanciaEmMetros(ponto, b))
  const [lng = 0, lat = 0] = ordenados[0] ?? []
  return [lng, lat]
}

function radianos(graus: number): number {
  return (graus * Math.PI) / 180
}
