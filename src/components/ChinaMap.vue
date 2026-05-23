<template>
  <div class="chart-container" ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import chinaJson from './js/china.json'

const props = defineProps({
  culturalHeritageMap: { type: Map, default: () => new Map() }
})
const emit = defineEmits(['province-click'])

const chartRef = ref(null)
let chartInstance = null
const mapName = 'china'

const getHeritageCountMap = () => {
  const countMap = new Map()
  if (props.culturalHeritageMap && props.culturalHeritageMap.size) {
    for (let [prov, list] of props.culturalHeritageMap.entries()) {
      countMap.set(prov, list.length)
    }
  }
  return countMap
}

const initChart = async () => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)
  echarts.registerMap(mapName, chinaJson)
  
  const countMap = getHeritageCountMap()
  const mapData = []
  for (let [name, cnt] of countMap.entries()) {
    mapData.push({ name, value: cnt })
  }
  
  const option = {
    title: {
      show: true,
      text: '全国古建筑遗产分布',
      left: 'center',
      top: 10,
      textStyle: { color: '#5c4328', fontSize: 16, fontWeight: 'normal', fontFamily: '宋体, SimSun, serif' }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.name) {
          const cnt = countMap.get(params.name) || 0
          return `${params.name}<br/>🏛️ 文化遗产数量: ${cnt}处`
        }
        return params.name
      },
      backgroundColor: 'rgba(60, 42, 31, 0.95)',
      borderColor: '#d4b886',
      borderWidth: 1,
      textStyle: { color: '#f8f2e4', fontFamily: '宋体, SimSun, serif' }
    },
    series: [{
      name: '文化遗产数量',
      type: 'map',
      map: mapName,
      roam: true,
      zoom: 1.2,
      center: [104.0, 35.0],
      aspectScale: 0.85,
      layoutCenter: ['50%', '52%'],
      layoutSize: '95%',
      label: {
        show: true,
        color: '#f8f2e4',
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: '宋体, SimSun, serif',
        formatter: '{b}'
      },
      emphasis: {
        label: { show: true, color: '#ffdd88' },
        itemStyle: { areaColor: '#d4a56e', borderWidth: 2 }
      },
      itemStyle: {
        normal: {
          areaColor: '#2a4a6e',
          borderColor: '#d4b886',
          borderWidth: 0.8,
          shadowBlur: 12,
          shadowColor: 'rgba(0,0,0,0.5)'
        },
        emphasis: { areaColor: '#c98a4a', shadowBlur: 20 }
      },
      data: mapData
    }],
    backgroundColor: 'transparent'
  }
  
  chartInstance.setOption(option)
  
  chartInstance.off('click')
  chartInstance.on('click', (params) => {
    if (params && params.name) {
      let clientX = null, clientY = null
      if (params.event && params.event.event) {
        clientX = params.event.event.clientX
        clientY = params.event.event.clientY
      }
      emit('province-click', params.name, clientX, clientY)
    }
  })
  
  window.addEventListener('resize', () => chartInstance && chartInstance.resize())
}

onMounted(initChart)
watch(() => props.culturalHeritageMap, () => {
  if (chartInstance) {
    const newCount = getHeritageCountMap()
    const newData = []
    for (let [name, cnt] of newCount.entries()) {
      newData.push({ name, value: cnt })
    }
    chartInstance.setOption({ series: [{ data: newData }] })
  }
}, { deep: true })
onBeforeUnmount(() => {
  if (chartInstance) { chartInstance.dispose(); chartInstance = null; }
})
</script>

<style scoped>
.chart-container { width: 100%; height: 100%; min-height: 450px; }
</style>