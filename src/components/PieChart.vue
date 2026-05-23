<template>
  <div class="chart-container" ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({ chartData: { type: Array, default: () => [] } })
const chartRef = ref(null)
let chartInstance = null
let resizeObserver = null

const getLegendColor = (index) => {
  const colors = ['#d97a3c', '#6f8c5a', '#b58b4f', '#a55c3a', '#8f6e4b', '#c49a6c', '#7c5d3e', '#5e3a2b']
  return colors[index % colors.length]
}

const resizeChart = () => {
  if (chartInstance && chartRef.value) {
    chartInstance.resize()
  }
}

const initChart = () => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)
  const coloredData = props.chartData.map((item, idx) => ({ ...item, itemStyle: { color: getLegendColor(idx) } }))
  const option = {
    title: { text: '《营造法式》内容构成', left: 'center', top: 5, textStyle: { color: '#5c4328', fontSize: 15, fontWeight: 'bold', fontFamily: '宋体, SimSun, serif' } },
    tooltip: { trigger: 'item', formatter: '{b}: {d}%', backgroundColor: 'rgba(60,42,31,0.95)', borderColor: '#d4b886', borderWidth: 1, textStyle: { color: '#f8f2e4' } },
    legend: { orient: 'horizontal', left: 'center', bottom: 5, itemWidth: 25, itemHeight: 14, itemGap: 20, textStyle: { color: '#5c4328', fontSize: 11 }, formatter: (name) => { const item = props.chartData.find(d => d.name === name); return item ? `${name}  ${item.value}%` : name; } },
    series: [{
      type: 'pie', radius: ['30%', '52%'], center: ['50%', '40%'], data: coloredData,
      label: { show: true, position: 'outside', formatter: '{b}: {d}%', color: '#5c4328', fontWeight: 'bold', fontSize: 11, distanceToLabelLine: 4 },
      labelLine: { length: 8, length2: 8, smooth: true, lineStyle: { color: '#b8865b', width: 1 } },
      itemStyle: { borderRadius: 8, borderColor: '#f8f2e4', borderWidth: 2, shadowBlur: 8, shadowOffsetX: 2, shadowOffsetY: 2, shadowColor: 'rgba(0,0,0,0.2)' },
      emphasis: { scale: true, label: { show: true, fontWeight: 'bold', fontSize: 12 } }
    }]
  }
  chartInstance.setOption(option)
  resizeChart()
}

// 使用 ResizeObserver 监听容器尺寸变化
const observeResize = () => {
  if (!chartRef.value) return
  resizeObserver = new ResizeObserver(() => resizeChart())
  resizeObserver.observe(chartRef.value)
}

// 暴露 resize 方法供父组件调用
defineExpose({ resize: resizeChart })

watch(() => props.chartData, () => {
  initChart()
}, { deep: true })

onMounted(async () => {
  await nextTick()
  initChart()
  observeResize()
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.chart-container { width: 100%; height: 100%; min-height: 280px; padding: 5px 5px 15px 5px; box-sizing: border-box; }
</style>