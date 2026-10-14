<script setup lang="ts">
withDefaults(defineProps<{ zoom?: boolean, bussola?: boolean, localizar?: boolean }>(), { zoom: true, bussola: true, localizar: true })

const emit = defineEmits<{ localizar: [] }>()
const mapa = inject(chaveDoMapa)

const classeDoBotao = 'size-10 justify-center rounded-botao bg-(--paro-mapa-controle) backdrop-blur ring-1 ring-default text-highlighted'
</script>

<template>
  <div class="absolute top-1/2 right-3 z-10 flex -translate-y-1/2 flex-col gap-3">
    <div
      v-if="zoom"
      class="flex flex-col overflow-hidden rounded-botao ring-1 ring-default"
    >
      <UButton
        icon="i-lucide-plus"
        aria-label="Aproximar"
        color="neutral"
        variant="ghost"
        :class="classeDoBotao"
        class="rounded-none ring-0"
        @click="mapa?.zoomIn()"
      />
      <UButton
        icon="i-lucide-minus"
        aria-label="Afastar"
        color="neutral"
        variant="ghost"
        :class="classeDoBotao"
        class="rounded-none ring-0 border-t border-default"
        @click="mapa?.zoomOut()"
      />
    </div>
    <UButton
      v-if="bussola"
      icon="i-lucide-compass"
      aria-label="Apontar para o norte"
      color="neutral"
      variant="ghost"
      :class="classeDoBotao"
      @click="mapa?.resetNorthPitch()"
    />
    <UButton
      v-if="localizar"
      icon="i-lucide-locate-fixed"
      aria-label="Mostrar minha posição"
      color="neutral"
      variant="ghost"
      :class="classeDoBotao"
      @click="emit('localizar')"
    />
  </div>
</template>
