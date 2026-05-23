<template>
  <div class="chart-container" ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartData: Object,
  title: String,
  yAxisMin: { type: Number, default: null },
  yAxisMax: { type: Number, default: null },
  yAxisInterval: { type: Number, default: 1 },
  barWidth: { type: [Number, String], default: '40%' },   // 固定柱宽（像素或百分比）
  barCategoryGap: { type: [Number, String], default: '30%' } // 柱子间隙
})

const emit = defineEmits(['bar-click'])

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)

  let yMin = props.yAxisMin !== null ? props.yAxisMin : 0
  let yMax = props.yAxisMax !== null ? props.yAxisMax : Math.max(...props.chartData.seriesData.filter(v => v !== null), 1)
  yMax = Math.ceil(yMax)

  const option = {
    title: {
      text: props.title,
      left: 'center',
      textStyle: { color: '#5c4328', fontSize: 14, fontWeight: 'normal', fontFamily: '宋体, SimSun, serif' }
    },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { containLabel: true, left: '8%', right: '5%', top: '15%', bottom: '5%' },
    xAxis: {
      type: 'category',
      data: props.chartData.xAxisData,
      axisLabel: { rotate: 35, color: '#5c4328', fontSize: 10, interval: 0, fontFamily: '宋体, SimSun, serif' },
      axisLine: { lineStyle: { color: '#b8865b' } }
    },
    yAxis: {
      type: 'value',
      name: '数量 (处)',
      nameTextStyle: { color: '#5c4328' },
      axisLabel: { 
        color: '#5c4328',
        formatter: (value) => Math.floor(value) === value ? value : ''
      },
      splitLine: { lineStyle: { color: 'rgba(139, 110, 70, 0.3)' } },
      min: yMin,
      max: yMax,
      interval: props.yAxisInterval
    },
    series: [{
      name: '数量',
      type: 'bar',
      data: props.chartData.seriesData,
      barWidth: props.barWidth,
      barCategoryGap: props.barCategoryGap,
      itemStyle: {
        color: '#d97a3c',
        borderRadius: [6, 6, 0, 0],
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowBlur: 6
      },
      label: { show: true, position: 'top', color: '#5c4328', fontWeight: 'bold' }
    }]
  }
  chartInstance.setOption(option)

  chartInstance.off('click')
  chartInstance.on('click', (params) => {
    if (params.componentType === 'series' && params.dataIndex !== undefined && params.value !== null) {
      const categoryName = props.chartData.xAxisData[params.dataIndex]
      emit('bar-click', { name: categoryName, value: params.value })
    }
  })

  window.addEventListener('resize', () => chartInstance && chartInstance.resize())
}

watch(() => props.chartData, initChart, { deep: true })
onMounted(initChart)
</script>

<style scoped>
.chart-container { width: 100%; height: 100%; min-height: 220px; }
</style>