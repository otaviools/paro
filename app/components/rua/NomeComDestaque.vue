<script setup lang="ts">
const props = defineProps<{ nome: string, termo: string }>()

const partes = computed(() => {
  const termo = props.termo.trim()
  const indice = termo ? props.nome.toLowerCase().indexOf(termo.toLowerCase()) : -1
  if (indice < 0) return { antes: props.nome, achado: '', depois: '' }
  return {
    antes: props.nome.slice(0, indice),
    achado: props.nome.slice(indice, indice + termo.length),
    depois: props.nome.slice(indice + termo.length),
  }
})
</script>

<template>
  <span>{{ partes.antes }}<mark class="bg-transparent text-primary">{{ partes.achado }}</mark>{{ partes.depois }}</span>
</template>
