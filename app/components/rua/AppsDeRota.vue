<script setup lang="ts">
const props = defineProps<{ destino: [number, number], modo: 'carro' | 'a_pe' }>()

const links = computed(() => {
  const [lng, lat] = props.destino
  const viagem = props.modo === 'carro' ? 'driving' : 'walking'
  return [
    { nome: 'Google Maps', href: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${viagem}` },
    { nome: 'Waze', href: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes` },
    { nome: 'App de mapas do celular', href: `geo:${lat},${lng}?q=${lat},${lng}` },
  ]
})
</script>

<template>
  <section class="flex flex-col gap-3">
    <h3 class="etiqueta text-primary">
      Abrir rota com
    </h3>
    <UCard :ui="{ body: 'px-4 py-1 sm:px-4 sm:py-1' }">
      <ul class="divide-y divide-default">
        <li
          v-for="link in links"
          :key="link.nome"
        >
          <a
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 py-4 text-corpo font-bold text-highlighted outline-primary focus-visible:outline-2"
          >
            <span class="grid size-8 place-items-center rounded-badge bg-muted"><UIcon
              name="i-lucide-map"
              class="size-4"
            /></span>
            <span class="flex-1">{{ link.nome }}</span>
            <UIcon
              name="i-lucide-external-link"
              class="size-5 text-muted"
            />
            <span class="sr-only">(abre em outro app)</span>
          </a>
        </li>
      </ul>
    </UCard>
  </section>
</template>
