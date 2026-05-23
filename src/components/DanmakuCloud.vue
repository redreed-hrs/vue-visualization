<!-- DanmakuCloud.vue · 营造法式 · 木览青数 典藏词云（隐喻升级版） -->
<template>
  <div class="wordcloud-pavilion" :style="{ height: containerHeight + 'px' }">
    <div class="vertical-inscription">
      <span>营造法式 · 木览青数</span>
    </div>
    <div ref="chartRef" class="chart-stage"></div>
    <!-- 隐喻水印：枓栱铺作侧样线描（隐约可见） -->
    <div class="metaphor-watermark"></div>
    <div class="signature-corner">
      <div
        class="seal-square"
        :class="{
          'seal-hidden': isSealHidden,
          'seal-stamp': isStamping,
          'seal-ink': isInking
        }"
        :style="{ transform: sealTransform }"
        @click="handleSealClick"
        title="点击换韵 · 重绘云图"
      >
        <div class="seal-content">
          <span>营</span><span>造</span><span>法</span><span>式</span>
        </div>
        <div class="seal-texture"></div>
        <div class="seal-border-texture"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, shallowRef } from 'vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

const CHINESE_PALETTE = [
  '#9F4B3C', '#50616D', '#6A4C3A', '#9E7B5E', '#B4866F', '#A1665A',
  '#7C5E4B', '#4E4036', '#8B5A3C', '#5D6B63', '#B78A5E', '#9F6E4F',
  '#A2573C', '#3F5154', '#8A6E4D', '#6F4F37', '#A87B5D', '#B38B6D', '#CD9A5B'
]

const DEFAULT_TERM_FREQUENCIES = {
  "材": 182, "栱": 267, "枓": 231, "柱": 345, "梁": 278, "椽": 195,
  "铺作": 128, "举折": 56, "华文": 143, "制度": 215, "法式": 89,
  "李诫": 32, "宋代": 27, "殿阁": 96, "厅堂": 78, "亭榭": 45,
  "鸱尾": 23, "瓦": 176, "砖": 112, "石": 98, "墙": 84, "门": 132,
  "窗": 67, "勾阑": 39, "藻井": 31, "平棊": 28, "帐": 103,
  "经藏": 42, "雕": 88, "彩画": 71, "大木作": 34, "小木作": 29,
  "斗栱": 124, "榫卯": 18, "飞檐": 22, "梭柱": 9, "月梁": 14,
  "材分": 64, "模数": 21, "宋徽宗": 8, "将作监": 16, "壕寨": 19,
  "取正": 11, "定平": 13, "立基": 9, "筑基": 7, "城": 61,
  "露篱": 8, "井": 35, "须弥坐": 12, "卷輂": 9, "流盃渠": 5,
  "碑": 15, "笏头碣": 6, "赑屃": 7, "角梁": 41, "阳马": 16,
  "侏儒柱": 11, "斜柱": 13, "叉手": 24, "托脚": 18, "襻间": 15,
  "普拍方": 19, "阑额": 37, "地栿": 28, "驼峰": 17, "绰幕": 12,
  "替木": 22, "搏风版": 16, "垂鱼": 9, "惹草": 9, "版门": 21,
  "乌头门": 11, "软门": 10, "格子门": 23, "破子棂窗": 8,
  "睒电窗": 5, "版棂窗": 7, "截间版帐": 6, "照壁屏风": 7,
  "胡梯": 6, "地棚": 5, "佛道帐": 18, "牙脚帐": 9, "九脊小帐": 7,
  "壁帐": 8, "转轮经藏": 11, "壁藏": 10, "雕木作": 13,
  "旋作": 9, "锯作": 7, "竹作": 12, "瓦作": 15, "泥作": 10,
  "砖作": 11, "窑作": 9, "彩画作": 14
}

const props = defineProps({
  sourceText: { type: String, default: '' },
  count: { type: Number, default: 68 },
  containerHeight: { type: Number, default: 480 }
})

const chartRef = ref(null)
const chartInstance = shallowRef(null)
let resizeObserver = null
const isSealHidden = ref(false)
const isStamping = ref(false)
const isInking = ref(false)
const sealTransform = ref('rotate(-3deg)')

const randomSealTransform = () => {
  const rot = (Math.random() * 12 - 6).toFixed(1)
  const skewX = (Math.random() * 4 - 2).toFixed(1)
  const skewY = (Math.random() * 4 - 2).toFixed(1)
  return `rotate(${rot}deg) skew(${skewX}deg, ${skewY}deg)`
}

const handleSealClick = () => {
  if (isSealHidden.value) return
  isSealHidden.value = true
  setTimeout(() => {
    regenerateCloud()
    setTimeout(() => {
      sealTransform.value = randomSealTransform()
      isSealHidden.value = false
      isStamping.value = true
      isInking.value = true
      setTimeout(() => isInking.value = false, 150)
      setTimeout(() => isStamping.value = false, 200)
    }, 60)
  }, 220)
}

const getColorForWord = (word) => {
  let hash = 0
  for (let i = 0; i < word.length; i++) {
    hash = ((hash << 5) - hash) + word.charCodeAt(i)
    hash |= 0
  }
  return CHINESE_PALETTE[Math.abs(hash) % CHINESE_PALETTE.length]
}

const computeFrequencies = (text) => {
  if (!text || text.trim().length === 0) return DEFAULT_TERM_FREQUENCIES
  const cleaned = text.replace(/[^\u4e00-\u9fa5]/g, '')
  const freqMap = {}
  for (let len = 2; len <= 4; len++) {
    for (let i = 0; i <= cleaned.length - len; i++) {
      const term = cleaned.slice(i, i + len)
      if (/^[\u4e00-\u9fa5]+$/.test(term) && term.length >= 2) {
        freqMap[term] = (freqMap[term] || 0) + 1
      }
    }
  }
  return Object.fromEntries(Object.entries(freqMap).filter(([_, v]) => v >= 3))
}

const generateData = () => {
  const frequencies = props.sourceText ? computeFrequencies(props.sourceText) : DEFAULT_TERM_FREQUENCIES
  let items = Object.entries(frequencies)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
  if (items.length > props.count) items = items.slice(0, props.count)
  return items.map(item => ({
    ...item,
    textStyle: {
      color: getColorForWord(item.name),
      fontFamily: '"华文楷体", "KaiTi", "华文隶书", "LiSu", "Noto Serif SC", serif',
      fontWeight: 'normal',
      textShadow: '1px 1px 3px rgba(60,40,20,0.15)'
    }
  }))
}

const renderChart = () => {
  const container = chartRef.value
  if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) return
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(container)
    if (!resizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        if (chartInstance.value && !chartInstance.value.isDisposed?.()) chartInstance.value.resize()
      })
      resizeObserver.observe(container)
    }
  }
  if (chartInstance.value.isDisposed?.()) chartInstance.value = echarts.init(container)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: (params) => `
        <div style="font-family: '华文楷体','KaiTi'; padding:4px 6px;">
          <span style="font-size:16px; color:#d4b896;">「${params.name}」</span><br>
          <span style="color:#efe0cd;">频率 · ${params.value}  &nbsp; 法式典藏</span>
        </div>
      `,
      backgroundColor: 'rgba(28, 20, 15, 0.92)',
      borderColor: '#b89a7a',
      borderWidth: 1.5,
      borderRadius: 12,
      padding: [8, 14],
      textStyle: { color: '#f3ebdd', fontSize: 13 },
      extraCssText: 'box-shadow: 0 6px 18px rgba(0,0,0,0.4); backdrop-filter: blur(2px);'
    },
    series: [{
      type: 'wordCloud',
      // 隐喻：斗八藻井的八角形，用star调整边数实现八边形感
      shape: 'star',
      shapeSize: 6,  // 
      // 在ECharts wordcloud中，shape可选'circle','cardioid','diamond','triangle-forward','triangle','pentagon','star'
      // 我们使用'pentagon'五边形（五行），搭配rotationRange产生旋转，视觉丰富。
      shape: 'pentagon',
      gridSize: 14,
      sizeRange: [16, 58],
      rotationRange: [-12, 12],
      rotationStep: 3,
      drawOutOfBound: false,
      shrinkToFit: true,
      layoutAnimation: true,
      textStyle: {
        fontFamily: '"华文楷体", "KaiTi", "华文隶书", serif',
        fontWeight: 'normal'
      },
      emphasis: {
        scale: true,
        focus: 'self',
        textStyle: {
          fontWeight: 'bold',
          textShadow: '0 4px 12px rgba(30,15,5,0.5)'
        },
        itemStyle: {
          shadowBlur: 12,
          shadowColor: 'rgba(120,70,30,0.4)'
        }
      },
      data: generateData()
    }]
  }
  chartInstance.value.setOption(option, { notMerge: false })
}

const regenerateCloud = () => {
  if (chartInstance.value && !chartInstance.value.isDisposed?.()) renderChart()
}

const disposeChart = () => {
  if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
  if (chartInstance.value) { chartInstance.value.dispose(); chartInstance.value = null }
}

watch(() => [props.sourceText, props.count], () => {
  if (chartInstance.value && !chartInstance.value.isDisposed?.()) renderChart()
}, { deep: true })

watch(() => props.containerHeight, () => {
  nextTick(() => {
    if (chartInstance.value && !chartInstance.value.isDisposed?.()) chartInstance.value.resize()
    else renderChart()
  })
})

onMounted(() => {
  sealTransform.value = randomSealTransform()
  nextTick(renderChart)
})
onUnmounted(disposeChart)

defineExpose({ regenerate: regenerateCloud })
</script>

<style scoped>
.wordcloud-pavilion {
  position: relative;
  width: 100%;
  background: rgba(235, 215, 185, 0.18);
  border-radius: 40px 12px 40px 12px;
  backdrop-filter: blur(3px);
  box-shadow: inset 0 0 40px rgba(140, 100, 60, 0.1), 0 8px 18px -6px rgba(40, 20, 5, 0.2);
  border-left: 3px solid #b38b65;
  border-bottom: 2px solid rgba(170, 130, 90, 0.2);
  padding: 10px 0 10px 48px;
  box-sizing: border-box;
  text-align: center;
}
.vertical-inscription {
  position: absolute;
  left: 8px;
  top: 30px;
  bottom: 30px;
  width: 28px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: '华文楷体', 'KaiTi', serif;
  font-size: 17px;
  font-weight: bold;
  color: #35271c;
  letter-spacing: 6px;
  opacity: 0.75;
  border-right: 2px dashed #b38b65;
  padding-right: 8px;
  text-shadow: 1px 1px 2px rgba(200,170,130,0.3);
  pointer-events: none;
  z-index: 3;
}
.vertical-inscription span { display: inline-block; transform: translateY(-4px); }
.chart-stage { width: 100%; height: 100%; min-height: 300px; position: relative; z-index: 2; }

/* 隐喻水印：枓栱铺作侧样（隐约可见） */
.metaphor-watermark {
  position: absolute;
  top: 15%;
  left: 15%;
  right: 15%;
  bottom: 15%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" opacity="0.06"><path fill="none" stroke="%238b5a3c" stroke-width="1.2" d="M30,100 L40,60 L50,70 L70,40 L90,50 L110,30 L130,40 L150,20 L170,30 L190,15 M40,60 L50,90 M70,40 L80,80 M110,30 L120,70 M150,20 L160,50 M25,95 L30,85 M175,25 L185,15 M35,105 L45,95 M75,85 L85,75 M115,65 L125,55 M155,45 L165,35"/><circle cx="100" cy="60" r="8" fill="none" stroke="%238b5a3c" stroke-width="1"/><path fill="none" stroke="%238b5a3c" stroke-width="1" d="M90,50 L110,50 M100,40 L100,60"/></svg>') no-repeat center;
  background-size: contain;
  pointer-events: none;
  z-index: 1;
  opacity: 0.2;
}
.watermark-brush {
  position: absolute;
  bottom: 10px;
  left: 60px;
  font-size: 80px;
  font-family: '华文楷体', 'KaiTi', serif;
  color: rgba(160, 120, 80, 0.06);
  pointer-events: none;
  z-index: 1;
  white-space: nowrap;
  transform: rotate(-5deg);
  font-weight: bold;
}
.signature-corner {
  position: absolute;
  bottom: 18px;
  right: 28px;
  display: flex;
  align-items: center;
  gap: 16px;
  opacity: 0.9;
  pointer-events: none;
  z-index: 4;
}
.seal-square {
  pointer-events: auto;
  cursor: pointer;
  position: relative;
  width: 60px;
  height: 60px;
  background: transparent;
  border: 2.8px solid #b93a2b;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(180, 60, 40, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.22s cubic-bezier(0.33, 1, 0.68, 1), transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.15s ease;
  filter: drop-shadow(0 1px 1px rgba(150, 40, 20, 0.3));
  will-change: transform, opacity, filter;
}
.seal-square.seal-hidden {
  opacity: 0;
  transform: translateY(-6px) scale(0.92) !important;
  pointer-events: none;
  transition-duration: 0.22s;
}
.seal-square.seal-stamp {
  transform: scale(0.9) !important;
  transition: transform 0.12s cubic-bezier(0.2, 0.9, 0.4, 1);
}
.seal-square.seal-ink {
  filter: drop-shadow(0 1px 1px rgba(150, 40, 20, 0.5)) blur(0.6px);
  transition: filter 0.12s ease;
}
.seal-square:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(200, 80, 50, 0.3);
}
.seal-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px 0;
  width: 44px;
  height: 44px;
  font-family: '华文楷体', 'KaiTi', '华文隶书', serif;
  font-size: 22px;
  font-weight: 900;
  color: #b3321e;
  text-shadow: 1px 1px 1px rgba(140, 30, 10, 0.4), 0 0 3px rgba(180, 50, 30, 0.3), 0 0 6px rgba(200, 70, 40, 0.1);
  line-height: 1;
  text-align: center;
  letter-spacing: 1px;
  z-index: 2;
}
.seal-content span {
  display: flex;
  align-items: center;
  justify-content: center;
}
.seal-texture {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
  opacity: 0.55;
  mix-blend-mode: multiply;
  background: 
    radial-gradient(circle at 20% 30%, rgba(180, 60, 40, 0.4) 2%, transparent 25%),
    radial-gradient(circle at 80% 70%, rgba(160, 40, 20, 0.35) 3%, transparent 30%),
    radial-gradient(circle at 40% 80%, rgba(200, 70, 50, 0.3) 2%, transparent 20%),
    radial-gradient(circle at 70% 20%, rgba(170, 50, 30, 0.45) 1.5%, transparent 25%),
    radial-gradient(circle at 10% 50%, rgba(150, 30, 20, 0.3) 3%, transparent 35%),
    radial-gradient(circle at 90% 45%, rgba(190, 60, 40, 0.4) 2%, transparent 30%),
    repeating-radial-gradient(circle at 30% 60%, rgba(200, 70, 40, 0.15) 0%, transparent 8%);
  border-radius: 2px;
}
.seal-border-texture {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  pointer-events: none;
  z-index: 1;
  border-radius: 4px;
  opacity: 0.5;
  mix-blend-mode: multiply;
  background: 
    radial-gradient(circle at 0% 0%, rgba(160, 50, 30, 0.5) 0%, transparent 40%),
    radial-gradient(circle at 100% 100%, rgba(150, 40, 20, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 50% 0%, rgba(180, 60, 40, 0.3) 0%, transparent 60%),
    radial-gradient(circle at 0% 100%, rgba(170, 50, 30, 0.45) 0%, transparent 50%);
}
@media (max-width: 700px) {
  .wordcloud-pavilion { padding-left: 38px; }
  .vertical-inscription { left: 4px; font-size: 14px; width: 24px; }
  .signature-corner { right: 14px; bottom: 10px; gap: 8px; }
  .seal-square { width: 50px; height: 50px; }
  .seal-content { width: 36px; height: 36px; font-size: 18px; }
}
</style>