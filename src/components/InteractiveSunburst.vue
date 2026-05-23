<template>
  <div class="sunburst-wrapper">
    <div class="sunburst-container" ref="chartRef"></div>
    
    <!-- 阴影绘制层（基于圆锥投影的科学阴影） -->
    <canvas ref="shadowCanvas" class="shadow-canvas"></canvas>
    
    <!-- 时辰提示标签 -->
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
let currentAngle = ref(0)   // 当前旋转角度（度）

const zodiacMap = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

const showShadow = ref(false)
const currentZodiac = ref('')
const zodiacVisible = ref(false)
let shadowTimer = null
let zodiacTimer = null
let animationFrame = null

// --- 世界级古雅配色体系（源自敦煌壁画与宋瓷釉色）---
const themeColors = [
  '#C77B5B', // 檀色
  '#6B7B6B', // 黛绿
  '#B58B5C', // 秋香
  '#A15A4A', // 朱砂
  '#8F7B5C', // 驼色
  '#C49B7A', // 蜜合
  '#7C5D4A', // 赭石
  '#5E4A3A'  // 墨褐
]

// 为各层添加渐变光泽（通过 itemStyle 的 borderRadius 和 shadow 模拟瓷釉质感）
const getNodeColor = (node, depth, index) => {
  if (depth === 0) return '#A87B52' // 中心沉稳木色
  return themeColors[index % themeColors.length]
}

const processData = (data, depth = 0, siblingIndex = 0) => {
  const item = { ...data }
  if (!item.itemStyle) item.itemStyle = {}
  const baseColor = getNodeColor(item, depth, siblingIndex)
  // 添加细微渐变，提升质感
  item.itemStyle.color = baseColor
  // 为子节点增加微光边框
  if (depth > 0) {
    item.itemStyle.borderColor = '#F5E6D3'
    item.itemStyle.borderWidth = 1.2
    item.itemStyle.shadowBlur = 6
    item.itemStyle.shadowColor = 'rgba(80, 50, 30, 0.2)'
  }
  if (item.children && item.children.length) {
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

  if (!(angle >= 90 && angle <= 270)) {
    showShadow.value = false
    return
  }

  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) * 0.42

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
  ctx.filter = 'blur(8px)'
  
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
  
  ctx.fillStyle = 'rgba(70, 45, 30, 0.35)'
  ctx.fill()
  
  ctx.filter = 'none'
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(farX, farY)
  ctx.lineTo(p2.x, p2.y)
  ctx.closePath()
  const gradient = ctx.createLinearGradient(farX, farY, cx, cy)
  gradient.addColorStop(0, 'rgba(50, 35, 20, 0.5)')
  gradient.addColorStop(1, 'rgba(50, 35, 20, 0)')
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
  
  showShadow.value = true
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
    setTimeout(() => {
      canvasEl.style.opacity = '1'
    }, 10)
    shadowTimer = setTimeout(() => {
      if (!isDaytime()) canvasEl.style.opacity = '0'
    }, 800)
  }
}

const rotateChart = (delta) => {
  currentAngle.value = (currentAngle.value + delta) % 360
  if (chartInstance) {
    chartInstance.setOption({
      series: [{ startAngle: currentAngle.value }]
    })
  }
  triggerShadowAndZodiac()
}

const initChart = () => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  
  chartInstance = echarts.init(chartRef.value)
  const coloredTreeData = processData(props.treeData, 0, 0)
  
  const option = {
    title: {
      text: '《营造法式》内容构成',
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
      backgroundColor: 'rgba(40, 28, 20, 0.95)',
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
      radius: [0, '90%'],
      center: ['50%', '50%'],
      startAngle: currentAngle.value,
      label: {
        show: true,
        rotate: 'radial',
        align: 'center',
        verticalAlign: 'middle',
        // 关键：高对比度象牙色 + 深色文字阴影，确保在任何背景下清晰
        color: '#FDF3E0',
        fontWeight: '500',
        fontSize: 13,
        fontFamily: '"Noto Serif SC", "宋体", SimSun, serif',
        textShadow: '1px 1px 3px #3A2518, 0 0 4px #2E1E12',
        hideOverlap: true,
        // 防止文字溢出容器
        overflow: 'truncate',
        ellipsis: '..'
      },
      emphasis: {
        scale: true,
        label: {
          show: true,
          fontWeight: '600',
          fontSize: 14,  // 仅微增字号，避免溢出
          color: '#FFF8EA',
          textShadow: '2px 2px 6px #2A1A0E, 0 0 8px #4A2E1A',
          hideOverlap: true,
          overflow: 'truncate',
          ellipsis: '..'
        },
        itemStyle: {
          shadowBlur: 15,
          shadowOffsetX: 3,
          shadowOffsetY: 3,
          shadowColor: 'rgba(60, 35, 20, 0.5)',
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
        shadowColor: 'rgba(50, 30, 15, 0.2)'
      },
      // 层级精细化配置 —— 世界级审美层次感
      levels: [
        {
          r0: '0%',
          r: '15%',
          itemStyle: { 
            color: '#A87B52', 
            borderRadius: 12, 
            shadowBlur: 12,
            borderColor: '#D9B382',
            borderWidth: 2
          },
          label: { show: false }
        },
        {
          r0: '15%',
          r: '45%',
          label: { 
            fontSize: 15, 
            fontWeight: '600', 
            rotate: 'radial', 
            color: '#FCF3E0',
            textShadow: '1px 1px 4px #3D281A'
          },
          itemStyle: {
            borderWidth: 1.5,
            borderColor: '#E8C9A3'
          }
        },
        {
          r0: '45%',
          r: '70%',
          label: { 
            fontSize: 13, 
            fontWeight: '500', 
            rotate: 'radial', 
            color: '#FDF0DB',
            textShadow: '1px 1px 3px #3A2518'
          },
          itemStyle: {
            borderWidth: 1.2,
            borderColor: '#DFC09E'
          }
        },
        {
          r0: '70%',
          r: '88%',
          label: { 
            fontSize: 11, 
            fontWeight: '500', 
            rotate: 'radial', 
            color: '#FCEBD6',
            textShadow: '0.5px 0.5px 2px #3A2518'
          },
          itemStyle: {
            borderWidth: 1,
            borderColor: '#D4B692'
          }
        }
      ],
      nodeClick: false,
      sort: undefined,
      downplay: { 
        scale: false,
        itemStyle: {
          opacity: 0.7
        }
      }
    }],
    // 全局背景色微调，与阴影配合
    backgroundColor: 'transparent'
  }
  
  chartInstance.setOption(option)
  resizeChart()
  triggerShadowAndZodiac()
}

const resizeChart = () => {
  if (chartInstance && chartRef.value) {
    chartInstance.resize()
  }
  refreshShadow()
}

const observeResize = () => {
  if (!chartRef.value) return
  resizeObserver = new ResizeObserver(() => resizeChart())
  resizeObserver.observe(chartRef.value)
}

defineExpose({ resize: resizeChart })

watch(() => props.treeData, () => initChart(), { deep: true })

onMounted(async () => {
  await nextTick()
  initChart()
  observeResize()
  window.addEventListener('resize', refreshShadow)
})

onUnmounted(() => {
  if (shadowTimer) clearTimeout(shadowTimer)
  if (zodiacTimer) clearTimeout(zodiacTimer)
  if (animationFrame) cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', refreshShadow)
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
  min-height: 400px;
}

.sunburst-container {
  width: 100%;
  height: 100%;
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
</style>