<template>
  <div class="chart-container" ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartData: { type: Object, default: () => ({ xAxisData: [], seriesData: [] }) },
  expanded: { type: Boolean, default: false }
})

const emit = defineEmits(['yearClick'])

const chartRef = ref(null)
let chartInstance = null
let resizeHandler = null

const formatNumber = (value) => value.toLocaleString()

// 动态旋转函数：放大模式全水平，卡片内仅第一项水平
const getLabelRotate = (params) => {
  if (props.expanded) return 0
  return params.dataIndex === 0 ? 0 : -20
}

const initChart = () => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)

  const labelFontSize = props.expanded ? 14 : 10
  const labelDistance = props.expanded ? 12 : 5
  const gridTop = props.expanded ? '22%' : '22%'

  const option = {
    title: {
      text: '',
      left: 'center',
      textStyle: { color: '#5c4328', fontSize: 14, fontWeight: 'normal', fontFamily: '宋体, SimSun, serif' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value) => formatNumber(value) + ' 万元'
    },
    grid: {
      containLabel: true,
      left: '8%',
      right: '5%',
      top: '12%',
      bottom: '5%'
    },
    xAxis: {
      type: 'category',
      data: props.chartData.xAxisData,
      axisLabel: { color: '#5c4328', fontWeight: 'bold', fontFamily: '宋体, SimSun, serif' },
      axisLine: { lineStyle: { color: '#b8865b' } }
    },
    yAxis: {
      type: 'value',
      name: '投入金额 (万元)',
      nameTextStyle: { color: '#5c4328' },
      axisLabel: {
        color: '#5c4328',
        fontSize: 11,
        formatter: (value) => formatNumber(value)
      },
      splitLine: { lineStyle: { color: 'rgba(139, 110, 70, 0.3)' } }
    },
    series: [{
      name: '财政投入',
      type: 'line',
      data: props.chartData.seriesData,
      smooth: true,
      itemStyle: { color: '#d97a3c' },
      lineStyle: { width: 3, color: '#d97a3c' },
      symbol: 'circle',
      symbolSize: props.expanded ? 10 : 8,
      areaStyle: { opacity: 0.1, color: '#d97a3c' },
      label: {
        show: true,
        position: 'top',
        distance: labelDistance,
        color: '#5c4328',
        fontSize: labelFontSize,
        rotate: getLabelRotate,                     // 动态旋转
        formatter: (params) => formatNumber(params.value),
        ...(props.expanded ? { labelLayout: { hideOverlap: true } } : {})
      }
    }]
  }

  chartInstance.setOption(option)

  chartInstance.off('click')
  chartInstance.getZr().off('click')
  chartInstance.getZr().on('click', (params) => {
    const pointInPixel = [params.offsetX, params.offsetY]
    const pointInGrid = chartInstance.convertFromPixel({ seriesIndex: 0 }, pointInPixel)
    if (pointInGrid && pointInGrid[0] !== undefined) {
      const xIndex = Math.round(pointInGrid[0])
      if (xIndex >= 0 && xIndex < props.chartData.xAxisData.length) {
        const year = props.chartData.xAxisData[xIndex]
        emit('yearClick', year)
      }
    }
  })

  resizeHandler = () => chartInstance && chartInstance.resize()
  window.addEventListener('resize', resizeHandler)
}

watch(() => props.chartData, initChart, { deep: true })
watch(() => props.expanded, initChart)

onMounted(initChart)

onUnmounted(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 250px;
}
</style>