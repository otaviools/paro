import type { Area } from '#shared/types/area'
import { preferenciasPadrao, type Preferencias } from '#shared/types/preferencias'

export default defineNuxtPlugin(async () => {
  const areas = useState<Area[]>('areas', () => [])
  const preferencias = useState<Preferencias>('preferencias', () => preferenciasPadrao)
  if (areas.value.length) return
  const buscar = useRequestFetch()
  const [listaDeAreas, prefs] = await Promise.all([
    buscar<Area[]>('/api/areas').catch(() => []),
    buscar<Preferencias>('/api/preferencias').catch(() => preferenciasPadrao),
  ])
  areas.value = listaDeAreas
  preferencias.value = prefs
})
