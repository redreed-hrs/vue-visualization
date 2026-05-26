```vue
<template>
  <div class="sunburst-wrapper">
    <div class="sunburst-container" ref="chartRef"></div>
    <canvas ref="shadowCanvas" class="shadow-canvas"></canvas>
    <div class="zodiac-tag" v-if="currentZodiac" :class="{ show: zodiacVisible }">
      {{ currentZodiac }} 时
    </div>
    <div class="rotation-buttons">
      <button class="rotate-btn" @click="rotateChart(-30)" title="逆时针旋转（上一时辰）">↺</button>
      <button class="rotate-btn" @click="rotateChart(30)" title="顺时针旋转（下一时辰）">↻</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  treeData: {
    type: Object,
    default: () => ({ name: '根节点', children: [] })
  }
})

const chartRef = ref(null)
const shadowCanvas = ref(null)
let chartInstance = null
let resizeObserver = null
let currentAngle = ref(0)

const zodiacMap = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const showShadow = ref(false)
const currentZodiac = ref('')
const zodiacVisible = ref(false)
let shadowTimer = null
let zodiacTimer = null
let animationFrame = null

// 配色（敦煌 + 宋瓷）
const themeColors = [
  '#C77B5B', '#6B7B6B', '#B58B5C', '#A15A4A',
  '#8F7B5C', '#C49B7A', '#7C5D4A', '#5E4A3A'
]

const getNodeColor = (node, depth, index) => depth === 0 ? '#A87B52' : themeColors[index % themeColors.length]

const processData = (data, depth = 0, siblingIndex = 0) => {
  const item = { ...data }
  if (!item.itemStyle) item.itemStyle = {}
  item.itemStyle.color = getNodeColor(item, depth, siblingIndex)
  if (depth > 0) {
    item.itemStyle.borderColor = '#F5E6D3'
    item.itemStyle.borderWidth = 1.2
    item.itemStyle.shadowBlur = 6
    item.itemStyle.shadowColor = 'rgba(80,50,30,0.2)'
  }
  if (item.children?.length) {
    item.children = item.children.map((child, idx) => processData(child, depth + 1, idx))
  }
  return item
}

const getZodiacByAngle = (angle) => {
  let norm = ((angle % 360) + 360) % 360
  let idx = Math.floor(norm / 30) % 12
  return zodiacMap[idx]
}

const isDaytime = () => {
  const angle = ((currentAngle.value % 360) + 360) % 360
  return angle >= 90 && angle <= 270
}

// 增强版阴影绘制（中心与图表同步下移，半径与旭日图等比例）
const drawShadow = () => {
  const canvas = shadowCanvas.value
  const container = canvas?.parentElement
  if (!canvas || !container) return

  const rect = container.getBoundingClientRect()
  const width = rect.width
  const height = rect.height
  if (width === 0 || height === 0) return

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)

  const rawAngle = currentAngle.value
  const angle = ((rawAngle % 360) + 360) % 360

  // 仅当光线角度在 90°~270° 之间才绘制阴影
  if (!(angle >= 90 && angle <= 270)) {
    showShadow.value = false
    canvas.style.opacity = '0'
    return
  }

  showShadow.value = true
  canvas.style.opacity = '1'

  // 图表中心默认是 (50%, 50%)，但我们向下微调至 52% 以避免阴影拥挤
  // 因此阴影中心也应同步下移 2% 高度
  const centerYOffset = height * 0.02   // 对应图表中心 y 从 50% -> 52%
  const cx = width / 2
  const cy = height / 2 + centerYOffset

  // 修改半径与旭日图 95% 半径一致（原为 0.42，现改为 0.475）
  const r = Math.min(width, height) * 0.475

  const azimuthRad = ((angle - 90) * Math.PI) / 180
  let altitude
  if (angle <= 180) {
    altitude = 5 + (angle - 90) * (70 / 90)
  } else {
    altitude = 75 - (angle - 180) * (70 / 90)
  }
  const sunDirX = Math.cos(azimuthRad)
  const sunDirY = Math.sin(azimuthRad)

  const lenFactor = 0.4 + (75 - altitude) * (2.4 / 70)
  const shadowLength = r * lenFactor

  const perpX = -sunDirY
  const perpY = sunDirX
  const dx1 = perpX * r
  const dy1 = perpY * r
  const dx2 = -perpX * r
  const dy2 = -perpY * r

  const p1 = { x: cx + dx1, y: cy + dy1 }
  const p2 = { x: cx + dx2, y: cy + dy2 }
  const farX = cx - sunDirX * shadowLength
  const farY = cy - sunDirY * shadowLength

  ctx.save()
  // 增大模糊半径，让阴影更柔和
  ctx.filter = 'blur(12px)'
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(farX, farY)
  ctx.lineTo(p2.x, p2.y)
  const angleP2 = Math.atan2(p2.y - cy, p2.x - cx)
  const angleP1 = Math.atan2(p1.y - cy, p1.x - cx)
  let startAngle = angleP2
  let endAngle = angleP1
  if (startAngle > endAngle) endAngle += Math.PI * 2
  ctx.arc(cx, cy, r, startAngle, endAngle)
  ctx.closePath()
  // 增强阴影浓度
  ctx.fillStyle = 'rgba(80, 55, 40, 0.45)'
  ctx.fill()

  ctx.filter = 'none'
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(farX, farY)
  ctx.lineTo(p2.x, p2.y)
  ctx.closePath()
  const gradient = ctx.createLinearGradient(farX, farY, cx, cy)
  gradient.addColorStop(0, 'rgba(60, 40, 25, 0.6)')
  gradient.addColorStop(1, 'rgba(60, 40, 25, 0)')
  ctx.fillStyle = gradient
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(cx, cy, r + 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()
}

const refreshShadow = () => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  animationFrame = requestAnimationFrame(() => {
    drawShadow()
    animationFrame = null
  })
}

const triggerShadowAndZodiac = () => {
  if (zodiacTimer) clearTimeout(zodiacTimer)
  currentZodiac.value = getZodiacByAngle(currentAngle.value)
  zodiacVisible.value = true
  zodiacTimer = setTimeout(() => {
    zodiacVisible.value = false
  }, 1200)
  refreshShadow()
  if (shadowTimer) clearTimeout(shadowTimer)
  const canvasEl = shadowCanvas.value
  if (canvasEl) {
    canvasEl.style.opacity = '0'
    setTimeout(() => { canvasEl.style.opacity = '1' }, 10)
    shadowTimer = setTimeout(() => {
      if (!isDaytime()) canvasEl.style.opacity = '0'
    }, 800)
  }
}

const rotateChart = (delta) => {
  currentAngle.value = (currentAngle.value + delta) % 360
  if (chartInstance) {
    chartInstance.setOption({ series: [{ startAngle: currentAngle.value }] })
  }
  triggerShadowAndZodiac()
}

// 安全初始化图表
const safeInitChart = (retryCount = 0) => {
  if (!chartRef.value) return
  const container = chartRef.value
  const width = container.clientWidth
  const height = container.clientHeight
  if (width < 10 || height < 10) {
    if (retryCount < 20) {
      setTimeout(() => safeInitChart(retryCount + 1), 100)
    }
    return
  }
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(container)
  const coloredTreeData = processData(props.treeData, 0, 0)
  const option = {
    title: {
      text: '',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#5C3F2A',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: '"Noto Serif SC", "宋体", SimSun, serif',
        textShadow: '1px 1px 2px rgba(220, 180, 140, 0.5)',
        letterSpacing: 2
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(40,28,20,0.95)',
      borderColor: '#D4AF7A',
      borderWidth: 1.5,
      textStyle: { color: '#F3E9D2', fontSize: 13 },
      formatter: (params) => {
        if (params.treePathInfo) {
          const path = params.treePathInfo.map(item => item.name).join(' → ')
          const value = params.value || ''
          return `<strong>${path}</strong><br/>占比: ${value}%`
        }
        return params.name
      }
    },
    series: [{
      type: 'sunburst',
      data: [coloredTreeData],
      radius: [0, '95%'],
      center: ['50%', '52%'],      // 向下微调 2%，避免阴影拥挤
      startAngle: currentAngle.value,
      label: {
        show: true,
        rotate: 'radial',
        align: 'center',
        verticalAlign: 'middle',
        color: '#FFE9C7',
        fontWeight: 'bold',
        fontSize: 13,
        fontFamily: '"Noto Serif SC", "宋体", SimSun, serif',
        textShadow: '1px 1px 0px #3A2518, 2px 2px 3px #1A0E06',
        hideOverlap: true,
        overflow: 'truncate',
        ellipsis: '..'
      },
      emphasis: {
        scale: true,
        label: {
          show: true,
          fontWeight: 'bold',
          fontSize: 15,
          color: '#FFF2CF',
          textShadow: '2px 2px 0px #3A2518, 3px 3px 5px #1A0E06'
        },
        itemStyle: {
          shadowBlur: 15,
          shadowOffsetX: 3,
          shadowOffsetY: 3,
          shadowColor: 'rgba(60,35,20,0.5)',
          borderColor: '#F7D9A4',
          borderWidth: 2
        }
      },
      itemStyle: {
        borderRadius: 8,
        borderColor: '#EDD5B0',
        borderWidth: 1.2,
        shadowBlur: 6,
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        shadowColor: 'rgba(50,30,15,0.2)'
      },
      levels: [
        { r0: '0%', r: '15%', itemStyle: { color: '#A87B52', borderRadius: 12, shadowBlur: 12, borderColor: '#D9B382', borderWidth: 2 }, label: { show: false } },
        { r0: '15%', r: '42%', label: { fontSize: 14, fontWeight: 'bold', rotate: 'radial', color: '#FFE9C7', textShadow: '1px 1px 0px #3A2518' }, itemStyle: { borderWidth: 1.5, borderColor: '#E8C9A3' } },
        { r0: '42%', r: '70%', label: { fontSize: 12, fontWeight: 'bold', rotate: 'radial', color: '#FFE9C7', textShadow: '1px 1px 0px #3A2518' }, itemStyle: { borderWidth: 1.2, borderColor: '#DFC09E' } },
        { r0: '70%', r: '95%', label: { fontSize: 11, fontWeight: 'bold', rotate: 'radial', color: '#FFE9C7', textShadow: '1px 1px 0px #3A2518' }, itemStyle: { borderWidth: 1, borderColor: '#D4B692' } }
      ],
      nodeClick: false,
      sort: undefined,
      downplay: { scale: false, itemStyle: { opacity: 0.7 } }
    }],
    backgroundColor: 'transparent'
  }
  chartInstance.setOption(option)
  resizeChart()
  triggerShadowAndZodiac()
}

const initChart = () => safeInitChart(0)

const resizeChart = () => {
  if (chartInstance && chartRef.value) {
    chartInstance.resize()
  }
  refreshShadow()
}

const observeResize = () => {
  if (!chartRef.value) return
  if (resizeObserver) resizeObserver.disconnect()
  resizeObserver = new ResizeObserver(() => resizeChart())
  resizeObserver.observe(chartRef.value)
}

defineExpose({ resize: resizeChart })

watch(() => props.treeData, () => {
  initChart()
}, { deep: true })

onMounted(async () => {
  await nextTick()
  setTimeout(() => {
    initChart()
    observeResize()
  }, 150)
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  if (shadowTimer) clearTimeout(shadowTimer)
  if (zodiacTimer) clearTimeout(zodiacTimer)
  if (animationFrame) cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', resizeChart)
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
.sunburst-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sunburst-container {
  flex: 1;
  width: 100%;
  min-height: 480px;
  padding: 5px;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.shadow-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  transition: opacity 0.3s ease;
  opacity: 1;
}

.zodiac-tag {
  position: absolute;
  bottom: 70px;
  right: 20px;
  background: rgba(50, 35, 25, 0.85);
  backdrop-filter: blur(12px);
  border: 1.5px solid #E6C89A;
  border-radius: 40px;
  padding: 8px 22px;
  font-size: 22px;
  font-weight: 600;
  color: #F9E5C1;
  font-family: 'Noto Serif SC', '宋体', SimSun, serif;
  letter-spacing: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(230, 200, 150, 0.4);
  opacity: 0;
  transform: translateX(30px) scale(0.9);
  transition: all 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.2);
  pointer-events: none;
  z-index: 20;
  white-space: nowrap;
  text-shadow: 0 2px 4px #1E130C;
}

.zodiac-tag.show {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.rotation-buttons {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 14px;
  z-index: 15;
}

.rotate-btn {
  background: rgba(70, 50, 35, 0.8);
  border: 1.5px solid #D4AF7A;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 28px;
  font-weight: bold;
  color: #F3DCB2;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(212, 175, 122, 0.5);
}

.rotate-btn:hover {
  background: #B58A54;
  transform: scale(1.08);
  border-color: #F7E5B5;
  color: #FFF8EE;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
}

@media (max-width: 768px) {
  .sunburst-wrapper {
    min-height: 400px;
  }
  .sunburst-container {
    min-height: 380px;
  }
  .zodiac-tag {
    bottom: 50px;
    right: 12px;
    font-size: 18px;
    padding: 6px 16px;
  }
  .rotation-buttons {
    bottom: 8px;
    right: 8px;
    gap: 10px;
  }
  .rotate-btn {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }
}
</style>
