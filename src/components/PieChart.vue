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
  
  const total = props.chartData.reduce((sum, item) => sum + item.value, 0)
  
  const option = {
    title: { 
      text: '《营造法式》内容构成', 
      left: 'center', 
      top: 5, 
      textStyle: { color: '#5c4328', fontSize: 15, fontWeight: 'bold', fontFamily: '宋体, SimSun, serif' } 
    },
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {d}%', 
      backgroundColor: 'rgba(60,42,31,0.95)', 
      borderColor: '#d4b886', 
      borderWidth: 1, 
      textStyle: { color: '#f8f2e4' } 
    },
    // 图例紧贴右上角
    legend: { 
      orient: 'vertical', 
      right: 5,            // 贴右上角
      top: 5,
      itemWidth: 20,
      itemHeight: 12,
      itemGap: 16,
      textStyle: { color: '#5c4328', fontSize: 13, fontFamily: '宋体, SimSun, serif' },
      formatter: (name) => { 
        const item = props.chartData.find(d => d.name === name); 
        const percent = item ? ((item.value / total) * 100).toFixed(1) : '0';
        return `${name}  ${percent}%`; 
      } 
    },
    series: [{
      type: 'pie',
      radius: ['20%', '78%'],        // 饼图放大
      center: ['48%', '56%'],        // 居中并稍微下移
      data: coloredData,
      label: { 
        show: true, 
        position: 'outside', 
        formatter: '{b}: {d}%', 
        color: '#5c4328', 
        fontWeight: 'bold', 
        fontSize: 13,                // 字号增大
        distanceToLabelLine: 8 
      },
      labelLine: { 
        length: 12, 
        length2: 12, 
        smooth: true, 
        lineStyle: { color: '#b8865b', width: 1.2 } 
      },
      itemStyle: { 
        borderRadius: 8, 
        borderColor: '#f8f2e4', 
        borderWidth: 2, 
        shadowBlur: 10, 
        shadowOffsetX: 2, 
        shadowOffsetY: 2, 
        shadowColor: 'rgba(0,0,0,0.2)' 
      },
      emphasis: { 
        scale: true, 
        label: { show: true, fontWeight: 'bold', fontSize: 14 } 
      }
    }]
  }
  chartInstance.setOption(option)
  resizeChart()
}

const observeResize = () => {
  if (!chartRef.value) return
  resizeObserver = new ResizeObserver(() => resizeChart())
  resizeObserver.observe(chartRef.value)
}

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
.chart-container { 
  width: 100%; 
  height: 100%; 
  min-height: 460px;          /* 为放大的饼图提供足够空间 */
  padding: 10px 15px 15px 10px; 
  box-sizing: border-box; 
}
</style>