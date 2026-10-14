<script setup lang="ts">
const props = withDefaults(defineProps<{ titulo: string, voltarPara?: string, discreto?: boolean }>(), { voltarPara: '/', discreto: false })
const router = useRouter()

function voltar() {
  if (window.history.state?.back) router.back()
  else navigateTo(props.voltarPara)
}
</script>

<template>
  <header class="flex items-center gap-3">
    <UButton
      icon="i-lucide-chevron-left"
      aria-label="Voltar"
      color="neutral"
      variant="outline"
      class="size-10 justify-center"
      @click="voltar"
    />
    <h1
      class="text-titulo font-bold"
      :class="discreto ? 'text-muted' : 'text-highlighted'"
    >
      {{ titulo }}
    </h1>
    <div class="ml-auto">
      <slot />
    </div>
  </header>
</template>
