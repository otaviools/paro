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
  return Math.min(...trajeto.coordinates.map(vertice => distanciaEmMetros(ponto, vertice)))
}

export function verticeMaisProximo(ponto: Position, trajeto: LineString): [number, number] {
  const ordenados = [...trajeto.coordinates].sort((a, b) => distanciaEmMetros(ponto, a) - distanciaEmMetros(ponto, b))
  const [lng = 0, lat = 0] = ordenados[0] ?? []
  return [lng, lat]
}

function radianos(graus: number): number {
  return (graus * Math.PI) / 180
}
