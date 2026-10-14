<script setup lang="ts">
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { BarChart, CustomChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, MarkLineComponent, PolarComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

use([SVGRenderer, BarChart, CustomChart, PieChart, GridComponent, LegendComponent, MarkLineComponent, PolarComponent, TooltipComponent])

// Sem altura, o gráfico ocupa a altura do contêiner (painéis de tela cheia).
defineProps<{ opcao: EChartsOption, altura?: number, rotulo: string }>()
</script>

<template>
  <div
    role="img"
    :aria-label="rotulo"
    class="relative w-full"
    :class="altura ? 'shrink-0' : 'h-full min-h-0 flex-1'"
    :style="altura ? { height: `${altura}px` } : undefined"
  >
    <ClientOnly>
      <VChart
        :option="opcao"
        :init-options="{ renderer: 'svg' }"
        autoresize
        class="absolute! inset-0"
      />
      <template #fallback>
        <div class="absolute inset-0 animate-pulse rounded-alerta bg-muted" />
      </template>
    </ClientOnly>
  </div>
</template>
