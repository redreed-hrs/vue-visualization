<template>
  <div class="map-3d-container" :class="{ compact: compact, expanded: expanded }">
    <div ref="chartContainer" class="chart-container"></div>

    <!-- 顶部切换器（仅放大模式显示，聚类时右移） -->
    <div v-if="expanded" class="view-switcher" :class="{ 'switcher-right': clusterMode }">
      <div class="switcher-inner">
        <button :class="['switcher-btn', { active: !clusterMode }]" @click="setViewMode('dynasty')">
          朝代视图
        </button>
        <button :class="['switcher-btn', { active: clusterMode }]" @click="setViewMode('cluster')">
          聚类视图
        </button>
        <div class="switcher-slider" :style="sliderStyle"></div>
      </div>
    </div>

    <!-- 左侧朝代按钮列 -->
    <div v-if="!clusterMode" class="period-left">
      <button v-for="(label, idx) in leftPeriodLabels" :key="idx"
        :class="['period-btn', { active: selectedCode === idx }]" @click="selectPeriod(idx)">
        {{ label }}
      </button>
    </div>

    <!-- 右侧朝代按钮列 -->
    <div v-if="!clusterMode" class="period-right">
      <button v-for="(label, idx) in rightPeriodLabels" :key="idx + 11"
        :class="['period-btn', { active: selectedCode === idx + 11 }]" @click="selectPeriod(idx + 11)">
        {{ label }}
      </button>
    </div>

    <!-- 紧凑模式下的聚类切换按钮 -->
    <button v-if="!expanded" class="cluster-mode-btn" :class="{ active: clusterMode }" @click="toggleClusterMode">
      <span class="cluster-icon">◉</span>
      <span v-if="!compact">{{ clusterMode ? '朝代视图' : '聚类视图' }}</span>
    </button>

    <!-- 重置视角按钮 -->
    <button class="reset-view-btn" @click="resetView">
      <span class="reset-icon">⟲</span>
      <span v-if="!compact">重置视角</span>
    </button>

    <!-- ========= 聚类图例 ========= -->
    <template v-if="clusterMode">
      <!-- 紧凑模式：点击整个图例框即可收起 -->
      <div v-if="compact" class="cluster-legend-compact" :class="{ folded: compactLegendFolded }">
        <transition name="legend-fold" mode="out-in">
          <div v-if="!compactLegendFolded" key="legend" class="legend-fold-content" @click="compactLegendFolded = true" title="点击收起图例">
            <div class="legend-items-grid">
              <div v-for="(color, name) in clusterColorMap" :key="name" class="legend-item">
                <span class="legend-color-box" :style="{ backgroundColor: color }"></span>
                <span class="legend-text">{{ name }}</span>
              </div>
            </div>
          </div>
          <div v-else key="icon" class="legend-fold-icon-only" @click="compactLegendFolded = false">
            <img :src="copperCoinIcon" alt="展开图例" class="coin-icon-standalone" />
          </div>
        </transition>
      </div>

      <!-- 放大模式：原样保留（含演化分析按钮） -->
      <transition name="legend-fade" v-else>
        <div v-if="!legendCollapsed" class="cluster-legend-expanded">
          <button class="legend-collapse-btn" @click="legendCollapsed = true" title="收起图例">
            <span>▲</span>
          </button>
          <div class="legend-items-row">
            <div v-for="(color, name) in clusterColorMap" :key="name" class="legend-item">
              <span class="legend-color-box" :style="{ backgroundColor: color }"></span>
              <span class="legend-text">{{ name }}</span>
            </div>
          </div>
          <div class="legend-controls-row">
            <div class="cluster-selector-inline">
              <span>当前聚类：</span>
              <select v-model="selectedEvolutionCluster" @change="onClusterChange">
                <option v-for="name in clusterNames" :key="name" :value="name">
                  {{ name === '__ALL__' ? '全部聚类' : name }}
                </option>
              </select>
            </div>
            <button class="trend-btn-expanded" @click="showEvolutionModal = true">
              <img src="./images/ico/分析.png" alt="演化分析" class="trend-icon" />
            </button>
          </div>
        </div>
        <button v-else class="legend-collapsed-btn" @click="legendCollapsed = false" title="展开图例">
          <span class="collapsed-icon">◉</span>
          <span class="collapsed-text">聚类</span>
        </button>
      </transition>
    </template>

    <!-- 演化分析模态框 -->
    <div v-if="showEvolutionModal" class="evolution-modal" @click.self="showEvolutionModal = false">
      <div class="evolution-modal-content">
        <div class="evolution-header">
          <span>时空演化分析（各聚类数量随朝代变化）</span>
          <span class="close" @click="showEvolutionModal = false">✕</span>
        </div>
        <div class="evolution-body">
          <div ref="evolutionChartRef" class="evolution-chart"></div>
          <div class="data-note">堆叠面积图 - 展示每个聚类在不同朝代的文保点数量</div>
        </div>
      </div>
    </div>

    <!-- 审图号 -->
    <div class="map-attribution">GS(2019)1822号</div>

    <!-- 省份统计浮层 -->
    <div v-if="provinceTipVisible" class="province-tip" :style="provinceTipStyle">
      <div class="tip-header">{{ provinceTipData.name }}</div>
      <div class="tip-content">
        <span class="tip-label">{{ clusterMode ? '聚类模式 - 文保总数' : currentPeriodLabel + ' - 文保数量' }}</span>
        <span class="tip-value">{{ provinceTipData.count }}</span>
      </div>
      <div class="tip-close" @click.stop="provinceTipVisible = false">✕</div>
    </div>

    <!-- 文物详情浮层 -->
    <div v-if="heritageTipVisible" class="heritage-tip" :style="heritageTipStyle">
      <div class="tip-header">{{ heritageTipData.name }}</div>
      <div class="tip-content">
        <div><span class="tip-label">朝代</span> {{ heritageTipData.period }}</div>
        <div><span class="tip-label">省份</span> {{ heritageTipData.province }}</div>
        <div v-if="clusterMode && heritageTipData.clusterName">
          <span class="tip-label">聚类</span> {{ heritageTipData.clusterName }}
        </div>
      </div>
      <div class="tip-close" @click.stop="heritageTipVisible = false">✕</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import 'echarts-gl'
import chinaJson from './js/china.json'
import buildingIcon from './images/ico/建筑.png'
import timeIcon from './images/ico/时间周期.png'
import locationIcon from './images/ico/定位.png'
import copperCoinIcon from './images/ico/古风物件，中国风，铜钱，圆形方孔钱2.png'

const props = defineProps({
  apiBaseUrl: { type: String, default: '/api' },
  compact: { type: Boolean, default: false },
  expanded: { type: Boolean, default: false }
})

const chartContainer = ref(null)
let chart = null
let isChartInitialized = false
let resizeObserver = null

const selectedCode = ref(18)
const clusterMode = ref(false)
const loading = ref(false)
let cachedClusterPoints = null
let cachedEvolutionData = null

const periodLabels = [
  '旧石器时代', '新石器时代', '夏', '商', '西周', '战国', '秦', '汉',
  '三国', '晋', '南北朝', '隋', '唐', '五代', '宋', '辽', '金', '元', '明', '清'
]
const leftPeriodLabels = periodLabels.slice(0, 11)
const rightPeriodLabels = periodLabels.slice(11)
const currentPeriodLabel = computed(() => periodLabels[selectedCode.value] || '明代')

const INIT_VIEW = { distance: 90, alpha: 30, beta: 15 }
let lastDistance = ref(INIT_VIEW.distance)

const currentPointsData = ref([])

const provinceTipVisible = ref(false)
const provinceTipData = ref({ name: '', count: 0 })
const provinceTipStyle = ref({ left: '0px', top: '0px' })
const heritageTipVisible = ref(false)
const heritageTipData = ref({ name: '', period: '', province: '', clusterName: '' })
const heritageTipStyle = ref({ left: '0px', top: '0px' })

const showEvolutionModal = ref(false)
const evolutionChartRef = ref(null)
let evolutionChart = null
const selectedEvolutionCluster = ref('__ALL__')
const clusterNames = ref([])
const clusterColorMap = ref({})
const getClusterColor = (clusterName) => clusterColorMap.value[clusterName] || '#888888'

const legendCollapsed = ref(false)
const compactLegendFolded = ref(false)

const provinceNameMap = new Map([
  ['北京市', '北京'], ['天津市', '天津'], ['上海市', '上海'], ['重庆市', '重庆'],
  ['河北省', '河北'], ['山西省', '山西'], ['辽宁省', '辽宁'], ['吉林省', '吉林'],
  ['黑龙江省', '黑龙江'], ['江苏省', '江苏'], ['浙江省', '浙江'], ['安徽省', '安徽'],
  ['福建省', '福建'], ['江西省', '江西'], ['山东省', '山东'], ['河南省', '河南'],
  ['湖北省', '湖北'], ['湖南省', '湖南'], ['广东省', '广东'], ['海南省', '海南'],
  ['四川省', '四川'], ['贵州省', '贵州'], ['云南省', '云南'], ['陕西省', '陕西'],
  ['甘肃省', '甘肃'], ['青海省', '青海'], ['台湾省', '台湾'],
  ['内蒙古自治区', '内蒙古'], ['广西壮族自治区', '广西'], ['西藏自治区', '西藏'],
  ['宁夏回族自治区', '宁夏'], ['新疆维吾尔自治区', '新疆'],
  ['香港特别行政区', '香港'], ['澳门特别行政区', '澳门']
])

if (!echarts.getMap('china')) {
  try {
    echarts.registerMap('china', chinaJson)
  } catch (err) {
    console.error('地图注册失败', err)
  }
}

const MAX_DISPLAY_POINTS = 600
const samplePoints = (points, max) => {
  if (points.length <= max) return points
  const step = points.length / max
  const sampled = []
  for (let i = 0; i < max; i++) {
    const idx = Math.floor(i * step)
    sampled.push(points[idx])
  }
  console.warn(`点数量过多 (${points.length})，已采样至 ${sampled.length} 个`)
  return sampled
}

const calcVisualByDistance = (distance) => {
  const refDistance = 90
  const baseInner = 10
  let innerSize = baseInner * (refDistance / distance)
  innerSize = Math.min(24, Math.max(6, innerSize))
  innerSize = Math.round(innerSize * 10) / 10
  const baseOuter = baseInner + 2
  let outerSize = baseOuter * (refDistance / distance)
  outerSize = Math.min(26, Math.max(8, outerSize))
  outerSize = Math.round(outerSize * 10) / 10
  return { innerSize, outerSize }
}

let updatePending = false
const updatePointVisuals = (distance) => {
  if (!chart || updatePending) return
  updatePending = true
  requestAnimationFrame(() => {
    if (!chart || chart.isDisposed?.()) { updatePending = false; return }
    const { innerSize, outerSize } = calcVisualByDistance(distance)
    if (!clusterMode.value) {
      chart.setOption({
        series: [
          { symbolSize: outerSize },
          { symbolSize: innerSize }
        ]
      })
    } else {
      chart.setOption({
        series: [{ symbolSize: innerSize }]
      })
    }
    updatePending = false
  })
}

const handleCamera = (params) => {
  if (!chart || chart.isDisposed?.()) return
  if (params && typeof params.distance === 'number') {
    lastDistance.value = params.distance
    updatePointVisuals(params.distance)
  }
}

const cleanPoint = (p) => {
  const lng = p.lng, lat = p.lat
  if (lng == null || lat == null) return null
  if (typeof lng === 'string' && lng.toLowerCase() === 'nan') return null
  if (typeof lat === 'string' && lat.toLowerCase() === 'nan') return null
  const numLng = Number(lng), numLat = Number(lat)
  if (isNaN(numLng) || isNaN(numLat)) return null
  if (numLng < 70 || numLng > 140 || numLat < 0 || numLat > 60) return null
  return { ...p, name: p.name || '未命名文物', period: p.period || '年代未知', province: p.province || '未知省份', lng: numLng, lat: numLat }
}

const updateClusterHighlight = () => {
  if (!chart || chart.isDisposed?.() || !clusterMode.value) return
  const selectedCluster = selectedEvolutionCluster.value
  if (!selectedCluster || !currentPointsData.value.length) return

  const innerData = currentPointsData.value.map(p => {
    const isAll = selectedCluster === '__ALL__'
    const opacity = isAll ? 0.8 : (p.clusterName === selectedCluster ? 1.0 : 0.25)
    return {
      name: p.name,
      period: p.period,
      province: p.province,
      value: [p.lng, p.lat, 0],
      itemStyle: {
        color: getClusterColor(p.clusterName),
        opacity,
        borderWidth: 0
      },
      clusterName: p.clusterName
    }
  })

  chart.setOption({
    series: [{ data: innerData }]
  })
}

const onClusterChange = () => {
  updateClusterHighlight()
}

const fetchAndRender = async (periodName) => {
  if (!chart || chart.isDisposed?.()) return
  loading.value = true
  const url = `${props.apiBaseUrl}/heritage/by-period?period=${encodeURIComponent(periodName)}`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    let points = await res.json()
    points = points.map(cleanPoint).filter(p => p !== null)
    points = samplePoints(points, MAX_DISPLAY_POINTS)
    currentPointsData.value = points

    const periodColorMap = {
      '旧石器时代': '#A67B5B', '新石器时代': '#B38B6B', '夏': '#C19A6B', '商': '#C99E6A',
      '西周': '#D19B64', '战国': '#D99A5C', '秦': '#C78D4A', '汉': '#B8864A',
      '三国': '#AD8048', '晋': '#A57A46', '南北朝': '#9E7544', '隋': '#966F42',
      '唐': '#E88C3A', '五代': '#D4783A', '宋': '#C96E38', '辽': '#AA6236',
      '金': '#9C5C34', '元': '#8E5632', '明': '#F28C3C', '清': '#E07A3A'
    }
    const color = periodColorMap[periodName] || '#E88C3A'

    const outerData = points.map(p => ({
      name: p.name,
      value: [p.lng, p.lat, 0],
      itemStyle: { color: '#FFFFFF', opacity: 0.9, borderWidth: 0 }
    }))

    const innerData = points.map(p => ({
      name: p.name,
      period: p.period,
      province: p.province,
      value: [p.lng, p.lat, 0],
      itemStyle: { color: color, opacity: 0.9, borderWidth: 1.2, borderColor: '#FFFFFF' }
    }))

    chart.setOption({
      series: [
        {
          type: 'scatter3D', coordinateSystem: 'geo3D', data: outerData,
          symbolSize: 20, hoverAnimation: false, tooltip: { show: false },
          itemStyle: { color: '#FFFFFF', borderWidth: 0, opacity: 1 },
          label: { show: false }, emphasis: { scale: false }, silent: true
        },
        {
          type: 'scatter3D', coordinateSystem: 'geo3D', data: innerData,
          symbolSize: 16, hoverAnimation: true, tooltip: { show: true },
          itemStyle: { borderWidth: 1.2, borderColor: '#FFFFFF' },
          label: { show: false }, emphasis: { scale: true, label: { show: false } }
        }
      ]
    }, { replaceMerge: ['series'] })
    updatePointVisuals(lastDistance.value)
  } catch (err) {
    console.error('朝代数据加载失败:', err)
    currentPointsData.value = []
    chart.setOption({ series: [] }, { replaceMerge: ['series'] })
  } finally {
    loading.value = false
  }
}

const loadEnhancedClusterData = async () => {
  if (!chart || chart.isDisposed?.()) return
  if (cachedClusterPoints) {
    renderEnhancedClusterPoints(cachedClusterPoints)
    return
  }
  loading.value = true
  const url = `${props.apiBaseUrl}/heritage/enhanced-clusters?k=5`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    let points = await res.json()
    points = points.map(cleanPoint).filter(p => p !== null)
    cachedClusterPoints = points
    renderEnhancedClusterPoints(points)
    computeEvolutionData(points)
  } catch (err) {
    console.error('增强聚类数据加载失败:', err)
    currentPointsData.value = []
    chart.setOption({ series: [] }, { replaceMerge: ['series'] })
  } finally {
    loading.value = false
  }
}

const renderEnhancedClusterPoints = (points) => {
  if (!chart || chart.isDisposed?.()) return
  const sampled = samplePoints(points, MAX_DISPLAY_POINTS)
  currentPointsData.value = sampled
  const uniqueClusters = [...new Set(points.map(p => p.clusterName).filter(Boolean))]
  const palette = ['#F28C3C', '#4A90E2', '#50B85A', '#9B59B6', '#E74C3C', '#F1C40F', '#1ABC9C', '#E67E22']
  uniqueClusters.forEach((name, idx) => {
    clusterColorMap.value[name] = palette[idx % palette.length]
  })

  const innerData = sampled.map(p => ({
    name: p.name, period: p.period, province: p.province,
    value: [p.lng, p.lat, 0],
    itemStyle: { color: getClusterColor(p.clusterName), opacity: 0.8, borderWidth: 0 },
    clusterName: p.clusterName
  }))

  chart.setOption({
    series: [{
      type: 'scatter3D', coordinateSystem: 'geo3D', data: innerData,
      symbolSize: 16, hoverAnimation: true, tooltip: { show: true },
      itemStyle: { borderWidth: 0 }, label: { show: false }, emphasis: { scale: true }
    }]
  }, { replaceMerge: ['series'] })
  updatePointVisuals(lastDistance.value)
}

const computeEvolutionData = (points) => {
  const dynasties = [...periodLabels]
  const clusterSet = new Set(points.map(p => p.clusterName).filter(Boolean))
  const evolution = {}
  for (const cn of clusterSet) {
    evolution[cn] = {}
    for (const d of dynasties) evolution[cn][d] = 0
  }
  for (const p of points) {
    const cn = p.clusterName
    if (!cn) continue
    let dynasty = p.period
    for (const d of dynasties) {
      if (dynasty.includes(d)) { dynasty = d; break }
    }
    if (evolution[cn][dynasty] !== undefined) evolution[cn][dynasty]++
  }
  cachedEvolutionData = evolution
  clusterNames.value = ['__ALL__', ...Array.from(clusterSet).sort()]
  if (clusterNames.value.length && !selectedEvolutionCluster.value) {
    selectedEvolutionCluster.value = '__ALL__'
  }
}

const drawEvolutionChart = () => {
  if (!evolutionChartRef.value) return
  if (evolutionChart) evolutionChart.dispose()
  evolutionChart = echarts.init(evolutionChartRef.value)
  const dynasties = [...periodLabels]
  const series = []
  for (const cn of clusterNames.value) {
    if (cn === '__ALL__') continue
    const data = dynasties.map(d => cachedEvolutionData?.[cn]?.[d] || 0)
    series.push({ name: cn, type: 'line', stack: 'total', areaStyle: {}, data })
  }
  evolutionChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: clusterNames.value.filter(cn => cn !== '__ALL__'), top: 0, type: 'scroll' },
    xAxis: { type: 'category', data: dynasties, axisLabel: { rotate: 45, interval: 0 } },
    yAxis: { type: 'value', name: '文保点数量' },
    series
  })
}

watch(showEvolutionModal, async (val) => {
  if (val && cachedEvolutionData) {
    await nextTick()
    drawEvolutionChart()
  } else {
    if (evolutionChart) evolutionChart.dispose()
    evolutionChart = null
  }
})

const setViewMode = async (mode) => {
  const enableCluster = mode === 'cluster'
  if (clusterMode.value === enableCluster) return
  clusterMode.value = enableCluster
  legendCollapsed.value = false
  compactLegendFolded.value = false
  if (enableCluster) {
    await loadEnhancedClusterData()
    await nextTick()
    updateClusterHighlight()
  } else {
    await fetchAndRender(periodLabels[selectedCode.value])
  }
}
const toggleClusterMode = () => setViewMode(clusterMode.value ? 'dynasty' : 'cluster')

const selectPeriod = async (index) => {
  if (clusterMode.value) clusterMode.value = false
  selectedCode.value = index
  await fetchAndRender(periodLabels[index])
}

const resetView = () => {
  if (!chart || chart.isDisposed?.()) return
  chart.setOption({
    geo3D: {
      viewControl: { distance: INIT_VIEW.distance, alpha: INIT_VIEW.alpha, beta: INIT_VIEW.beta }
    }
  })
  if (clusterMode.value) {
    selectedEvolutionCluster.value = '__ALL__'
    updateClusterHighlight()
  }
}

const findNearestPoint = (clickPos) => {
  if (!chart || chart.isDisposed?.() || !currentPointsData.value.length) return null
  let clickX = clickPos.offsetX, clickY = clickPos.offsetY
  if (clickX === undefined || clickY === undefined) {
    const rect = chartContainer.value?.getBoundingClientRect()
    if (rect) { clickX = clickPos.clientX - rect.left; clickY = clickPos.clientY - rect.top }
  }
  if (clickX === undefined || clickY === undefined) return null
  const PICK_THRESHOLD = 40
  let minDist = Infinity, nearestPoint = null
  const targetSeriesIndex = clusterMode.value ? 0 : 1
  for (const point of currentPointsData.value) {
    const screenCoord = chart.convertToPixel({ seriesIndex: targetSeriesIndex }, [point.lng, point.lat, 0])
    if (!screenCoord) continue
    const dx = screenCoord[0] - clickX, dy = screenCoord[1] - clickY
    const dist = Math.sqrt(dx*dx + dy*dy)
    if (dist < minDist) { minDist = dist; nearestPoint = point }
  }
  return minDist <= PICK_THRESHOLD ? nearestPoint : null
}

const showHeritageTip = (data, eventPos) => {
  heritageTipData.value = {
    name: data.name || '未命名文物',
    period: data.period || '年代未知',
    province: data.province || '未知省份',
    clusterName: data.clusterName || ''
  }
  if (eventPos && (eventPos.clientX || eventPos.clientY)) {
    heritageTipStyle.value = { left: (eventPos.clientX + 15) + 'px', top: (eventPos.clientY - 40) + 'px' }
  } else {
    heritageTipStyle.value = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  }
  heritageTipVisible.value = true
  setTimeout(() => heritageTipVisible.value = false, 5000)
}

const handleProvinceClick = (provinceName, eventPos) => {
  let count = 0
  if (clusterMode.value) {
    count = currentPointsData.value.filter(p => p.province && p.province.includes(provinceName)).length
  } else {
    count = currentPointsData.value.filter(p => p.province && (p.province.includes(provinceName) || provinceName.includes(p.province))).length
  }
  provinceTipData.value = { name: provinceName, count }
  if (eventPos && (eventPos.clientX || eventPos.clientY)) {
    provinceTipStyle.value = { left: (eventPos.clientX + 15) + 'px', top: (eventPos.clientY - 40) + 'px' }
  } else {
    provinceTipStyle.value = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  }
  provinceTipVisible.value = true
  setTimeout(() => provinceTipVisible.value = false, 5000)
}

const initChart = () => {
  if (!chartContainer.value || isChartInitialized) return
  if (chartContainer.value.clientWidth === 0 || chartContainer.value.clientHeight === 0) {
    setTimeout(initChart, 100)
    return
  }
  if (chart && !chart.isDisposed?.()) {
    chart.off('camera', handleCamera)
    chart.off('click')
    chart.dispose()
  }
  chart = echarts.init(chartContainer.value)

  const baseOption = {
    title: { text: '', left: 'center', top: 8, textStyle: { color: '#5C3E2B', fontSize: 14, fontFamily: '宋体', fontWeight: 'bold' } },
    tooltip: {
      trigger: 'item', triggerOn: 'mousemove',
      formatter: (params) => {
        if (params.seriesType === 'scatter3D' && params.data) {
          const data = params.data
          let extraHtml = ''
          if (clusterMode.value && data.clusterName) extraHtml = `<div><span style="color:#E0D0B0;">聚类</span> ${data.clusterName}</div>`
          return `<div style="font-family:宋体; border-left:3px solid #E88C3A; padding-left:8px;">
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;"><img src="${buildingIcon}" style="width:16px;height:16px;" /><b>${data.name}</b></div>
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;"><img src="${timeIcon}" style="width:16px;height:16px;" />${data.period}</div>
            <div style="display:flex;align-items:center;gap:4px;"><img src="${locationIcon}" style="width:16px;height:16px;" />${data.province}</div>${extraHtml}</div>`
        }
        return null
      },
      backgroundColor: 'rgba(40,28,20,0.92)', borderColor: '#D4B886', borderWidth: 1,
      textStyle: { color: '#F8F2E4', fontSize: 12 }, borderRadius: 6, extraCssText: 'pointer-events: auto;'
    },
    geo3D: {
      map: 'china', shading: 'lambert', realisticMaterial: { roughness: 0.6, metalness: 0.1 },
      label: { show: true, color: '#4A3520', fontSize: 10, fontFamily: '宋体', distance: 12, formatter: (p) => p.name.length > 6 ? p.name.slice(0,5)+'-' : p.name },
      itemStyle: { areaColor: '#DCC8A8', borderColor: '#B89A6E', borderWidth: 0.8, opacity: 0.95 },
      emphasis: { label: { show: true, color: '#FFF2CC' }, itemStyle: { areaColor: '#D19B64' } },
      light: { main: { intensity: 1.2, shadow: false }, ambient: { intensity: 0.7 } },
      viewControl: {
        distance: INIT_VIEW.distance, alpha: INIT_VIEW.alpha, beta: INIT_VIEW.beta,
        minDistance: 40, maxDistance: 200, animation: false, rotateSensitivity: 0.5, zoomSensitivity: 0.6, panSensitivity: 0.4
      },
      postEffect: { enable: false }, temporalSuperSampling: { enable: false }
    },
    backgroundColor: '#F8F2E4',
    series: [{
      type: 'scatter3D', coordinateSystem: 'geo3D', data: [],
      symbolSize: 16, hoverAnimation: true, tooltip: { show: true },
      itemStyle: { borderWidth: 0 }, label: { show: false }, emphasis: { scale: true }
    }]
  }

  chart.setOption(baseOption)
  chart.on('camera', handleCamera)
  setTimeout(() => { if (chart && !chart.isDisposed?.()) updatePointVisuals(INIT_VIEW.distance) }, 50)

  chart.on('click', (params) => {
    if (params.seriesType === 'scatter3D' && params.data) {
      showHeritageTip(params.data, params.event?.event)
      return
    }
    if (params.event && (params.event.offsetX !== undefined || params.event.clientX)) {
      let clientX = params.event.clientX || (params.event.touches && params.event.touches[0]?.clientX)
      let clientY = params.event.clientY || (params.event.touches && params.event.touches[0]?.clientY)
      if (clientX && clientY) {
        const nearest = findNearestPoint({ clientX, clientY })
        if (nearest) { showHeritageTip(nearest, { clientX, clientY }); return }
      }
    }
    if (params.componentType === 'geo3D' && params.region) {
      const rawName = params.region
      const provinceName = provinceNameMap.get(rawName) || rawName.replace(/省|市|自治区|特别行政区|壮族|回族|维吾尔|自治区/g, '')
      handleProvinceClick(provinceName, params.event?.event)
    }
  })

  isChartInitialized = true
}

let resizeTimer = null
const setupResizeObserver = () => {
  if (!chartContainer.value) return
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => { if (chart && !chart.isDisposed?.()) chart.resize() })
    resizeObserver.observe(chartContainer.value)
  } else {
    window.addEventListener('resize', () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => { if (chart && !chart.isDisposed?.()) chart.resize() }, 150)
    })
  }
}

onMounted(() => {
  initChart()
  fetchAndRender(periodLabels[selectedCode.value])
  setupResizeObserver()
})

onBeforeUnmount(() => {
  if (resizeTimer) clearTimeout(resizeTimer)
  if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
  if (chart && !chart.isDisposed?.()) {
    chart.off('camera', handleCamera)
    chart.off('click')
    chart.clear()
    chart.dispose()
    chart = null
  }
  isChartInitialized = false
})

const sliderStyle = computed(() => {
  if (!props.expanded) return {}
  const activeIndex = clusterMode.value ? 1 : 0
  return { transform: `translateX(${activeIndex * 100}%)` }
})
</script>

<style scoped>
/* 基础容器 */
.map-3d-container { width: 100%; height: 100%; position: relative; background: #F8F2E4; border-radius: 8px; overflow: hidden; }
.chart-container { width: 100%; height: 100%; background: #F8F2E4; }

/* 顶部切换器 */
.view-switcher { position: absolute; top: 12px; left: 0; right: 0; display: flex; justify-content: center; z-index: 35; pointer-events: none; transition: justify-content 0.2s ease; }
.view-switcher.switcher-right { justify-content: flex-end; padding-right: 20px; }
.switcher-inner { position: relative; background: rgba(40,28,20,0.75); backdrop-filter: blur(12px); border-radius: 48px; padding: 4px; display: flex; gap: 4px; border: 1px solid rgba(212,184,134,0.6); box-shadow: 0 2px 10px rgba(0,0,0,0.2); pointer-events: auto; }
.switcher-btn { background: transparent; border: none; padding: 6px 24px; border-radius: 40px; font-size: 14px; font-family: '宋体', SimSun, serif; color: #F8EAD5; cursor: pointer; transition: all 0.2s ease; position: relative; z-index: 2; letter-spacing: 2px; }
.switcher-btn.active { color: #2C1E14; font-weight: bold; }
.switcher-slider { position: absolute; top: 4px; bottom: 4px; width: calc(50% - 4px); background: #E88C3A; border-radius: 40px; transition: transform 0.3s cubic-bezier(0.2,0.9,0.4,1.1); z-index: 1; }

/* 朝代按钮列 */
.period-left, .period-right { position: absolute; top: 70px; display: flex; flex-direction: column; gap: 6px; z-index: 30; pointer-events: none; }
.period-left { left: 10px; width: 90px; }
.period-right { right: 10px; width: 100px; }
.period-left button, .period-right button { pointer-events: auto; }
.period-btn { background: rgba(92,62,43,0.75); backdrop-filter: blur(4px); border: none; color: #F8EAD5; font-size: 12px; font-family: '宋体', SimSun, serif; padding: 6px 4px; border-radius: 20px; cursor: pointer; text-align: center; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.2); width: 100%; }
.period-btn:hover { background: rgba(122,90,66,0.9); }
.period-btn.active { background: #E88C3A; color: #2C1E14; font-weight: bold; }

/* 聚类切换按钮 */
.cluster-mode-btn { position: absolute; bottom: 45px; right: 12px; background: rgba(92,62,43,0.85); backdrop-filter: blur(4px); border: none; color: #F8EAD5; padding: 6px 10px; border-radius: 24px; font-size: 10px; font-family: '宋体', SimSun, serif; cursor: pointer; display: flex; align-items: center; gap: 4px; z-index: 30; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
.cluster-mode-btn.active { background: #E88C3A; color: #2C1E14; font-weight: bold; }

/* 重置视角按钮 */
.reset-view-btn { position: absolute; bottom: 20px; right: 20px; background: rgba(166,124,82,0.8); backdrop-filter: blur(4px); border: none; color: #f8f2e4; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-family: '宋体', SimSun, serif; cursor: pointer; display: flex; align-items: center; gap: 6px; z-index: 30; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.reset-view-btn:hover { background: rgba(139,110,70,0.9); }

/* ========= 紧凑模式图例（点击整体收起） ========= */
.compact .cluster-legend-compact {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 40;
  pointer-events: auto;
  max-width: calc(100% - 16px);
}
.compact .legend-fold-content {
  display: flex;
  align-items: flex-start;
  background: rgba(30, 22, 16, 0.65);
  backdrop-filter: blur(4px);
  border-radius: 24px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.2s;
}
.compact .legend-fold-content:hover {
  background: rgba(40, 30, 22, 0.75);
}
.compact .legend-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 6px 12px;
  flex: 1;
}
.compact .legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-family: '宋体', SimSun, serif;
  color: #FDF0DC;
  white-space: nowrap;
}
.compact .legend-color-box {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 1px rgba(0,0,0,0.2);
}
/* 铜钱单独图标 */
.compact .legend-fold-icon-only {
  background: rgba(30, 22, 16, 0.65);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.compact .legend-fold-icon-only:hover {
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 4px 14px rgba(0,0,0,0.4);
}
.compact .coin-icon-standalone {
  width: 28px;
  height: 28px;
  display: block;
  transition: transform 0.25s ease;
}
.compact .legend-fold-icon-only:active .coin-icon-standalone {
  transform: scale(0.9);
}
/* 紧凑折叠动画 */
.compact .legend-fold-enter-active,
.compact .legend-fold-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.compact .legend-fold-enter-from {
  opacity: 0;
  transform: scale(0.9);
}
.compact .legend-fold-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* ========= 放大模式图例（保持不变） ========= */
.cluster-legend-expanded {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(35, 25, 18, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 40;
  border: 1px solid rgba(212,184,134,0.5);
  pointer-events: auto;
  min-width: 220px;
  max-width: 360px;
}
.legend-collapse-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(212,184,134,0.4);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E0D0B0;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
  padding: 0;
}
.legend-collapse-btn:hover {
  background: rgba(255,255,255,0.2);
}
.legend-items-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
}
.legend-items-row .legend-item {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #FDF0DC;
  font-family: '宋体', SimSun, serif;
}
.legend-items-row .legend-color-box {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 1px rgba(0,0,0,0.2);
}
.legend-controls-row {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  border-top: 1px solid rgba(212,184,134,0.4);
  padding-top: 8px;
  margin-top: 2px;
}
.cluster-selector-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #FDF0DC;
  background: rgba(0,0,0,0.3);
  padding: 4px 12px;
  border-radius: 24px;
  flex: 1;
  justify-content: space-between;
}
.cluster-selector-inline select {
  background: #2E241E;
  color: #FDF0DC;
  border: 1px solid #B89A6E;
  border-radius: 20px;
  padding: 4px 8px;
  font-size: 12px;
  font-family: monospace;
  cursor: pointer;
}
.trend-btn-expanded {
  background: #A67C52;
  border: none;
  border-radius: 24px;
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.trend-btn-expanded:hover {
  background: #C48A5C;
}
.legend-collapsed-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(35, 25, 18, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(212,184,134,0.5);
  border-radius: 48px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #FDF0DC;
  font-family: '宋体', SimSun, serif;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 40;
  pointer-events: auto;
}
.legend-collapsed-btn:hover {
  background: rgba(60, 40, 28, 0.9);
}
.collapsed-icon { font-size: 18px; }
.collapsed-text { letter-spacing: 2px; }
.trend-icon { width: 18px; height: 18px; display: block; }

/* 演化分析模态框 */
.evolution-modal {
  position: fixed; top:0; left:0; width:100%; height:100%;
  background: rgba(0,0,0,0.6); z-index: 2000;
  display: flex; align-items: center; justify-content: center;
}
.evolution-modal-content {
  background: #FEF8EF; border-radius: 16px; width: 80%; height: 70%;
  display: flex; flex-direction: column; border: 1px solid #C8AA7A;
}
.evolution-header {
  background: #8B6E46; padding: 12px 20px; border-radius: 16px 16px 0 0;
  display: flex; justify-content: space-between; color: white; font-weight: bold;
}
.evolution-header .close { font-size: 24px; cursor: pointer; line-height: 1; }
.evolution-body { flex:1; padding: 16px; display: flex; flex-direction: column; overflow: auto; }
.evolution-chart { flex:1; min-height: 0; width: 100%; }
.data-note { margin-top: 12px; text-align: center; font-size: 12px; color: #8B6E46; }

/* 浮层 */
.province-tip, .heritage-tip {
  position: fixed;
  background: rgba(40,28,20,0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #D4B886;
  border-radius: 16px;
  padding: 12px 20px;
  color: #F8F2E4;
  font-family: '宋体', SimSun, serif;
  z-index: 100;
  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
  pointer-events: auto;
  min-width: 180px;
}
.tip-header { font-size: 16px; font-weight: bold; color: #FFE6B3; margin-bottom: 8px; border-bottom: 1px solid #A67C52; padding-bottom: 6px; }
.tip-content { display: flex; flex-direction: column; gap: 6px; }
.tip-content > div { display: flex; justify-content: space-between; }
.tip-label { font-size: 12px; color: #E0D0B0; margin-right: 12px; }
.tip-value { font-size: 24px; font-weight: bold; color: #F28C3C; }
.tip-close { position: absolute; top: 6px; right: 10px; font-size: 16px; cursor: pointer; color: #C4A56C; }

/* 审图号 */
.map-attribution { position: absolute; bottom: 6px; left: 10px; background: rgba(0,0,0,0.35); padding: 2px 6px; border-radius: 10px; font-size: 8px; color: #E0D0B0; z-index: 20; backdrop-filter: blur(3px); pointer-events: none; }

/* 过渡动画 */
.legend-fade-enter-active, .legend-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.legend-fade-enter-from, .legend-fade-leave-to { opacity: 0; transform: translateX(-6px); }

/* 紧凑微调 */
.compact .period-left, .compact .period-right { top: 60px; }
.compact .period-left { width: 60px; }
.compact .period-right { width: 85px; }
.compact .period-btn { font-size: 9px; padding: 4px 2px; }
.compact .reset-view-btn { padding: 6px 10px; font-size: 10px; bottom: 10px; right: 10px; }

/* 移动端响应式 */
@media (max-width: 768px) {
  .period-left, .period-right { width: 70px; }
  .period-btn { font-size: 10px; }
  .compact .period-left, .compact .period-right { width: 60px; }
  .compact .period-btn { font-size: 8px; }
  .evolution-modal-content { width: 95%; height: 80%; }
  .compact .cluster-legend-compact { max-width: calc(100% - 20px); }
  .compact .legend-items-grid { gap: 4px 8px; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); }
  .compact .legend-item { font-size: 9px; }
  .cluster-legend-expanded { max-width: 280px; }
  .cluster-selector-inline span { display: none; }
}
</style>