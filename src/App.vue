<template>
  <div class="app-container">
    <!-- 背景纹理层（带蒙版，降低清晰度） -->
    <div class="bg-texture-layer" v-if="!showBuildingMethod && !showSplash">
      <img :src="bgTexture" alt="" class="bg-texture-image" />
      <div class="bg-texture-overlay"></div>
    </div>
    <!-- 启动动画 -->
    <HelloWorld v-if="showSplash" @close="showSplash = false" />

    <!-- 营造法式详情页 -->
    <BuildingMethod v-else-if="showBuildingMethod" @close="showBuildingMethod = false" />

    <!-- 主平台 -->
    <div v-else class="dashboard">
      <div class="header-bar">
        <div class="header-left" @click="showBuildingMethod = true">
          <img src="./components/images/s5beb9247da49c.png" alt="logo" class="logo" />
          <span class="school-name">木览青数</span>
        </div>
        <div class="header-title">中国古建筑保护单位大数据可视化分析平台</div>
        <div class="header-right">
          <span class="time">{{ currentTime }}</span>
        </div>
      </div>

      <div class="grid-container">
        <!-- 第一行 -->
        <div class="card card-left-top">
          <div class="card-header">
            <span class="card-title">文化遗产保护财政投入</span>
            <span class="card-expand" @click="openExpand('finance')">⤢</span>
          </div>
          <div class="chart-wrapper">
            <LineChart :chart-data="financeData" @year-click="handleYearClick" />
          </div>
        </div>

        <!-- 高德地图3D组件 -->
        <div class="card card-center-top">
          <div class="card-header">
            <span class="card-title">中国古建筑保护单位分布图</span>
            <span class="card-expand" @click="openExpand('map')">⤢</span>
          </div>
          <div class="map-wrapper">
            <Amap3DMap :api-base-url="apiBaseUrl" :compact="true" />
          </div>
        </div>

        <div class="card card-right-top">
          <div class="card-header">
            <span class="card-title">《营造法式》内容构成</span>
            <span class="card-expand" @click="openExpand('pie')">⤢</span>
          </div>
          <div class="chart-wrapper">
            <PieChart :chart-data="optimizedBuildingMethodData" />
          </div>
        </div>

        <!-- 第二行 -->
        <div class="card card-left-bottom">
          <div class="card-header">
            <span class="card-title">各省古建筑保护单位数量排名</span>
            <span class="card-expand" @click="openExpand('rankBar')">⤢</span>
          </div>
          <div class="chart-wrapper">
            <BarChart :chart-data="pagedRankBarData" title="" :y-axis-min="0"
              :y-axis-max="rankMaxValue" :y-axis-interval="rankInterval" :bar-width="'40%'" :bar-category-gap="'30%'"
              @bar-click="handleProvinceBarClick" />
          </div>
          <div class="pagination-controls" v-if="totalPages > 1">
            <button class="page-btn" @click="prevPage" :disabled="totalPages <= 1">◀</button>
            <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
            <button class="page-btn" @click="nextPage" :disabled="totalPages <= 1">▶</button>
          </div>
        </div>

        <div class="card card-center-bottom">
          <div class="card-header">
            <span class="card-title">各朝代古建筑保护单位分布</span>
            <span class="card-expand" @click="openExpand('dynastyTimeline')">⤢</span>
          </div>
          <div class="chart-wrapper">
            <BarChart :chart-data="dynastyBarData" title="" :y-axis-min="0" :y-axis-max="dynastyMaxValue"
              :y-axis-interval="dynastyInterval" @bar-click="handleDynastyBarClick" />
          </div>
        </div>

        <div class="card card-right-bottom">
          <div class="card-header">
            <span class="card-title">匠心传承</span>
            <span class="card-expand" @click="openExpand('carousel')">⤢</span>
          </div>
          <div class="carousel-container">
            <img :src="currentImage" class="carousel-image" alt="榫卯结构" />
            <div class="carousel-controls">
              <button class="carousel-btn" @click="prevImage">上一张</button>
              <div class="carousel-dots">
                <span v-for="(img, idx) in images" :key="idx" :class="['dot', { active: currentIndex === idx }]"
                  @click="currentIndex = idx"></span>
              </div>
              <button class="carousel-btn" @click="nextImage">下一张</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 放大模态框 -->
    <div v-if="expandVisible" class="expand-modal" @click.self="closeExpand">
      <div class="expand-content">
        <div class="expand-header">
          <span class="expand-title">{{ expandTitle }}</span>
          <span class="expand-close" @click="closeExpand">✕</span>
        </div>
        <div class="expand-body">
          <div v-if="expandType === 'finance'" class="expand-chart">
            <LineChart :chart-data="financeData" :expanded="true" @year-click="handleYearClick" />
            <div class="data-source">数据来源：财政部/国家文物局2020-2025年文化遗产保护资金统计（公开数据）</div>
          </div>

<div v-else-if="expandType === 'map'" class="expand-map">
  <Amap3DMap :api-base-url="apiBaseUrl" :expanded="true" />
</div>

          <div v-else-if="expandType === 'pie'" class="expand-pie-switchable">
            <div class="pie-switch-header">
              <span class="pie-mode-label">{{ pieDisplayMode === 'normal' ? '饼图' : '旭日图' }}</span>
              <div class="pie-switch-buttons">
                <button :class="['pie-switch-btn', { active: pieDisplayMode === 'normal' }]"
                  @click="pieDisplayMode = 'normal'">普通</button>
                <button :class="['pie-switch-btn', { active: pieDisplayMode === 'sunburst' }]"
                  @click="pieDisplayMode = 'sunburst'">分层</button>
              </div>
            </div>
            <div class="pie-chart-wrapper">
              <PieChart v-if="pieDisplayMode === 'normal'" :chart-data="optimizedBuildingMethodData" />
              <InteractiveSunburst v-else :tree-data="sunburstTreeData" />
            </div>
          </div>

          <div v-else-if="expandType === 'rankBar'" class="expand-chart">
            <BarChart :chart-data="rankBarData" title="" :y-axis-min="0"
              :y-axis-max="rankMaxValue" :y-axis-interval="rankInterval" :bar-width="'40%'" :bar-category-gap="'30%'"
              @bar-click="handleProvinceBarClick" />
          </div>

          <div v-else-if="expandType === 'dynastyTimeline'" class="expand-dynasty-rotator">
            <div class="rotator-content-wrapper">
              <button class="nav-arrow nav-arrow-left" @click="manualSwitchView('prev')">◀</button>

              <div v-show="dynaViewMode === 'bar'" class="dynasty-bar-container">
                <BarChart :chart-data="dynastyBarData" title="" :y-axis-min="0" :y-axis-max="dynastyMaxValue"
                  :y-axis-interval="dynastyInterval" />
              </div>

              <div v-show="dynaViewMode === 'timeline'" class="dynasty-timeline-container">
                <div class="timeline-scroll-wrapper">
                  <div class="timeline-full-line"></div>
                  <div class="timeline-full-nodes-scroll">
                    <div v-for="(node, idx) in optimizedTimelineNodes" :key="idx" class="timeline-full-node"
                      :class="{ highlight: node.highlight }">
                      <div class="full-node-dot"></div>
                      <div class="full-node-content">
                        <div class="full-node-dynasty">{{ node.dynasty }}</div>
                        <div class="full-node-event">{{ node.event }}</div>
                      </div>
                    </div>
                  </div>
                  <p class="timeline-footnote">* 本脉络重点展示《营造法式》成书（北宋）前后的技艺传承与制度演化</p>
                </div>
              </div>

              <button class="nav-arrow nav-arrow-right" @click="manualSwitchView('next')">▶</button>
            </div>
          </div>

          <div v-else-if="expandType === 'carousel'" class="expand-carousel">
            <img :src="currentImage" class="expand-carousel-image" alt="榫卯结构" />
            <div class="carousel-controls">
              <button class="carousel-btn" @click="prevImage">上一张</button>
              <div class="carousel-dots">
                <span v-for="(img, idx) in images" :key="idx" :class="['dot', { active: currentIndex === idx }]"
                  @click="currentIndex = idx"></span>
              </div>
              <button class="carousel-btn" @click="nextImage">下一张</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预算表模态框 -->
    <div v-if="budgetModalVisible" class="budget-modal" @click.self="budgetModalVisible = false">
      <div class="budget-modal-content">
        <div class="budget-modal-header">
          <span class="budget-modal-title">{{ budgetYear }}年国家文物保护资金分省预算表</span>
          <span class="budget-modal-close" @click="budgetModalVisible = false">✕</span>
        </div>
        <div class="budget-modal-body">
          <div class="budget-table-wrapper">
            <table class="budget-table">
              <thead>
                <tr>
                  <th>省份</th>
                  <th>预算数（万元）</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in budgetData" :key="row.province">
                  <td>{{ row.province }}</td>
                  <td class="budget-number">{{ row.amount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="budget-source">
            数据来源：财政部/国家文物局《{{ budgetYear }}年国家文物保护资金预算表》
            <span v-if="budgetYear === 2021">（注：原始文件未列出的省份按未拨款 0 万元计）</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 省份文保单位详情模态框（增强版：搜索 + 页码跳转） -->
    <div v-if="provinceModalVisible" class="budget-modal" @click.self="provinceModalVisible = false">
      <div class="budget-modal-content" style="width: 90vw; max-width: 1400px;">
        <div class="budget-modal-header">
          <span class="budget-modal-title">
            {{ currentProvince }} 古建筑保护单位列表（共 {{ filteredProvinceList.length }} 处）
          </span>
          <div class="header-right-part">
            <div class="search-box">
              <input v-model="searchKeyword" placeholder="搜索名称/时代/地址等" class="search-input" />
              <button v-if="searchKeyword" class="clear-search" @click="searchKeyword = ''">✕</button>
            </div>
            <span class="budget-modal-close" @click="provinceModalVisible = false">✕</span>
          </div>
        </div>
        <div class="budget-modal-body">
          <!-- 加载状态 -->
          <div v-if="provinceLoading" class="province-loading">
            <div class="loading-spinner"></div>
            <span>正在加载 {{ currentProvince }} 的数据...</span>
          </div>
          <!-- 数据表格 -->
          <template v-else>
            <div class="budget-table-wrapper">
              <table class="budget-table">
                <thead>
                  <tr>
                    <th style="width: 60px;">序号</th>
                    <th>单位名称</th>
                    <th>时代</th>
                    <th>地址</th>
                    <th>类型</th>
                    <th>批次</th>
                    <th>市级政区</th>
                    <th>县级政区</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in paginatedProvinceList" :key="idx">
                    <td style="text-align: center;">{{ (provinceCurrentPage * provincePageSize) + idx + 1 }}</td>
                    <td>{{ item.name || '-' }}</td>
                    <td>{{ item.period || '-' }}</td>
                    <td>{{ item.address || '-' }}</td>
                    <td>{{ item.type || '-' }}</td>
                    <td>{{ item.batch || '-' }}</td>
                    <td>{{ item.city || '-' }}</td>
                    <td>{{ item.county || '-' }}</td>
                  </tr>
                  <tr v-if="filteredProvinceList.length === 0 && !provinceLoading">
                    <td colspan="8" style="text-align: center;">{{ searchKeyword ? '未找到匹配的古建筑保护单位' : '该省份暂无古建筑保护单位数据'
                      }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- 分页控件（包含页码跳转） -->
            <div class="pagination-controls" v-if="provinceTotalPages > 1">
              <button class="page-btn" @click="provincePrevPage" :disabled="provinceCurrentPage <= 0">◀</button>
              <span class="page-info">{{ provinceCurrentPage + 1 }} / {{ provinceTotalPages }}</span>
              <button class="page-btn" @click="provinceNextPage"
                :disabled="provinceCurrentPage >= provinceTotalPages - 1">▶</button>
              <div class="jump-to-page">
                <span>前往</span>
                <input v-model.number="jumpPageInput" type="number" min="1" :max="provinceTotalPages" class="jump-input"
                  @keyup.enter="jumpToPage" />
                <span>页</span>
                <button class="page-btn jump-btn" @click="jumpToPage">跳转</button>
              </div>
            </div>
            <div class="data-source">数据来源：全球变化科学研究数据出版系统 | 按年代先后排序</div>
          </template>
        </div>
      </div>
    </div>

    <!-- 原本的四个装饰条，分别加上 v-if -->
    <div class="ancient-decoration left-decoration" v-if="!showBuildingMethod && !showSplash"></div>
    <div class="ancient-decoration right-decoration" v-if="!showBuildingMethod && !showSplash"></div>
    <div class="ancient-decoration top-decoration" v-if="!showBuildingMethod && !showSplash"></div>
    <div class="ancient-decoration bottom-decoration" v-if="!showBuildingMethod && !showSplash"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'
import LineChart from './components/LineChart.vue'
import BarChart from './components/BarChart.vue'
import PieChart from './components/PieChart.vue'
import Amap3DMap from './components/Amap3DMap.vue'
import HelloWorld from './components/HelloWorld.vue'
import BuildingMethod from './components/BuildingMethod.vue'
import InteractiveSunburst from './components/InteractiveSunburst.vue'
// 🆕 背景纹理图（仅使用相对路径，无 @ 别名）
import bgTexture from './components/images/5e8d81ef47cbfc954a3304f4e2604073.png'
import officialHeritageCounts from './components/js/officialHeritageCounts.json'

import dynastyCountMap from './components/js/dynastyData.json'
import yearlyBudgetData from './components/js/yearlyBudgetData.json'
import allBudgetProvinces from './components/js/allBudgetProvinces.json'

const apiBaseUrl = 'http://localhost:8081/api'

// 简称到全称的映射表（包含所有省、自治区、直辖市、特别行政区）
const provinceFullNameMap = {
  '北京': '北京市',
  '天津': '天津市',
  '上海': '上海市',
  '重庆': '重庆市',
  '河北': '河北省',
  '山西': '山西省',
  '内蒙古': '内蒙古自治区',
  '辽宁': '辽宁省',
  '吉林': '吉林省',
  '黑龙江': '黑龙江省',
  '江苏': '江苏省',
  '浙江': '浙江省',
  '安徽': '安徽省',
  '福建': '福建省',
  '江西': '江西省',
  '山东': '山东省',
  '河南': '河南省',
  '湖北': '湖北省',
  '湖南': '湖南省',
  '广东': '广东省',
  '广西': '广西壮族自治区',
  '海南': '海南省',
  '四川': '四川省',
  '贵州': '贵州省',
  '云南': '云南省',
  '西藏': '西藏自治区',
  '陕西': '陕西省',
  '甘肃': '甘肃省',
  '青海': '青海省',
  '宁夏': '宁夏回族自治区',
  '新疆': '新疆维吾尔自治区',
  '台湾': '台湾省',
  '香港': '香港特别行政区',
  '澳门': '澳门特别行政区'
}

const allProvinces = Object.keys(officialHeritageCounts)



const dynastyOrder = [
  '旧石器时代', '新石器时代', '夏', '商', '西周春秋', '战国', '秦', '汉',
  '三国', '晋', '南北朝', '隋', '唐', '五代', '宋', '辽', '金', '元', '明', '清'
]

const dynastyBarData = computed(() => ({
  xAxisData: dynastyOrder,
  seriesData: dynastyOrder.map(d => dynastyCountMap[d] || 0)
}))

const dynastyMaxValue = computed(() => {
  const max = Math.max(...dynastyBarData.value.seriesData)
  return Math.ceil(max / 100) * 100
})

const dynastyInterval = computed(() => {
  const max = dynastyMaxValue.value
  if (max <= 200) return 50
  if (max <= 500) return 100
  return 200
})

const rankBarData = computed(() => {
  const arr = []
  for (const [province, count] of Object.entries(officialHeritageCounts)) {
    arr.push({ name: province, value: count })
  }
  arr.sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value
    return a.name.localeCompare(b.name)
  })
  return {
    xAxisData: arr.map(i => i.name),
    seriesData: arr.map(i => i.value)
  }
})

const pageSize = 5
const currentPage = ref(0)
const totalItems = computed(() => rankBarData.value.xAxisData.length)
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize))

const pagedRankBarData = computed(() => {
  const start = currentPage.value * pageSize
  const end = start + pageSize
  const slicedX = rankBarData.value.xAxisData.slice(start, end)
  const slicedY = rankBarData.value.seriesData.slice(start, end)
  const fullX = [...slicedX]
  const fullY = [...slicedY]
  while (fullX.length < pageSize) {
    fullX.push('')
    fullY.push(null)
  }
  return { xAxisData: fullX, seriesData: fullY }
})

const rankMaxValue = computed(() => {
  const values = rankBarData.value.seriesData.filter(v => v !== null && v !== undefined)
  if (values.length === 0) return 100
  const maxVal = Math.max(...values)
  return Math.ceil(maxVal / 50) * 50
})

const rankInterval = computed(() => {
  const maxVal = rankMaxValue.value
  if (maxVal <= 100) return 20
  if (maxVal <= 200) return 50
  return 100
})

const prevPage = () => { resetAutoTimer(); currentPage.value = (currentPage.value - 1 + totalPages.value) % totalPages.value }
const nextPage = () => { resetAutoTimer(); currentPage.value = (currentPage.value + 1) % totalPages.value }

const optimizedTimelineNodes = [
  { dynasty: '先秦', event: '茅茨土阶·中轴对称雏形', highlight: false },
  { dynasty: '秦汉', event: '高台建筑·大木作初成', highlight: false },
  { dynasty: '魏晋南北朝', event: '佛教建筑·石窟寺发展', highlight: false },
  { dynasty: '隋唐', event: '雄健豪放·斗拱成熟', highlight: false },
  { dynasty: '北宋', event: '《营造法式》成书', highlight: true },
  { dynasty: '金元', event: '减柱造法·用料科学', highlight: false },
  { dynasty: '明代', event: '官式严谨·故宫营建', highlight: false },
  { dynasty: '清代', event: '做法则例·高度规范', highlight: false }
]

const handleDynastyBarClick = (params) => { }


const financeData = {
  xAxisData: ['2020', '2021', '2022', '2023', '2024', '2025'],
  seriesData: [589966, 633299, 638333, 638333, 638333, 638333]
}

const optimizedBuildingMethodData = [
  { value: 25, name: '大木作制度' },
  { value: 19, name: '其他工种' },
  { value: 16, name: '小木作制度' },
  { value: 12, name: '石作·砖作' },
  { value: 9, name: '瓦作·泥作' },
  { value: 8, name: '壕寨·制度' },
  { value: 7, name: '彩画作·刷饰' },
  { value: 4, name: '材份·斗栱' }
]

const sunburstTreeData = {
  name: '营造法式',
  children: [
    {
      name: '大木作制度', value: 25, children: [
        { name: '材分制度', value: 8 }, { name: '栱', value: 6 }, { name: '飞昂', value: 5 }, { name: '爵头', value: 3 }, { name: '枓', value: 3 }
      ]
    },
    {
      name: '小木作制度', value: 16, children: [
        { name: '版门', value: 3 }, { name: '乌头门', value: 2 }, { name: '格子门', value: 3 }, { name: '平棊藻井', value: 4 }, { name: '勾阑', value: 2 }, { name: '佛道帐', value: 2 }
      ]
    },
    {
      name: '石作·砖作', value: 12, children: [
        { name: '石作制度', value: 6 }, { name: '砖作制度', value: 6 }
      ]
    },
    {
      name: '瓦作·泥作', value: 9, children: [
        { name: '瓦作制度', value: 5 }, { name: '泥作制度', value: 4 }
      ]
    },
    {
      name: '壕寨·制度', value: 8, children: [
        { name: '壕寨制度', value: 4 }, { name: '取正定平', value: 2 }, { name: '筑基筑墙', value: 2 }
      ]
    },
    {
      name: '彩画作·刷饰', value: 7, children: [
        { name: '五彩遍装', value: 3 }, { name: '碾玉装', value: 2 }, { name: '解绿装', value: 2 }
      ]
    },
    {
      name: '其他工种', value: 19, children: [
        { name: '雕作制度', value: 5 }, { name: '旋作制度', value: 4 }, { name: '锯作制度', value: 4 }, { name: '竹作制度', value: 6 }
      ]
    },
    {
      name: '材份·斗栱', value: 4, children: [
        { name: '八等材', value: 2 }, { name: '铺作次序', value: 2 }
      ]
    }
  ]
}

const pieDisplayMode = ref('normal')

let activeTooltip = null
const showProvinceTooltip = (provinceName, clientX, clientY) => {
  // 保留原有逻辑（未使用）
}
const handleProvinceClick = (provinceName, clientX, clientY) => { showProvinceTooltip(provinceName, clientX, clientY) }
const handleProvinceClickExpand = (provinceName, clientX, clientY) => { showProvinceTooltip(provinceName, clientX, clientY) }

const expandVisible = ref(false)
const expandType = ref('')
const expandTitle = ref('')
const openExpand = (type) => {
  expandType.value = type
  const titles = {
    finance: '文化遗产保护财政投入',
    map: '中国古建筑保护单位分布图',
    pie: '《营造法式》内容构成',
    rankBar: '各省古建筑保护单位数量排名',
    dynastyTimeline: '各朝代古建筑保护单位分布 · 文化传承脉络',
    carousel: '匠心传承'
  }
  expandTitle.value = titles[type] || ''
  expandVisible.value = true
  if (type === 'pie') pieDisplayMode.value = 'normal'
  if (type === 'dynastyTimeline') {
    stopDynastyRotateTimer()
    dynaViewMode.value = 'bar'
    startDynastyRotateTimer()
  }
}
const closeExpand = () => {
  expandVisible.value = false
  stopDynastyRotateTimer()
}

const dynaViewMode = ref('bar')
let dynastyRotateTimer = null
const startDynastyRotateTimer = () => {
  if (dynastyRotateTimer) clearInterval(dynastyRotateTimer)
  dynastyRotateTimer = setInterval(() => {
    dynaViewMode.value = dynaViewMode.value === 'bar' ? 'timeline' : 'bar'
  }, 5000)
}
const stopDynastyRotateTimer = () => {
  if (dynastyRotateTimer) clearInterval(dynastyRotateTimer)
  dynastyRotateTimer = null
}
const manualSwitchView = (direction) => {
  dynaViewMode.value = dynaViewMode.value === 'bar' ? 'timeline' : 'bar'
  stopDynastyRotateTimer()
  startDynastyRotateTimer()
}

const images = ref([
  new URL('./components/images/0c1996e9dbfa9ea3715d6ce26d4c74ed.png', import.meta.url).href,
  new URL('./components/images/001.png', import.meta.url).href,
  new URL('./components/images/002.png', import.meta.url).href,
  new URL('./components/images/003.png', import.meta.url).href,
  new URL('./components/images/71957c021cafea3e311d38af8cb82c9c.png', import.meta.url).href,

  new URL('./components/images/e4922908e1b3186b40fbadc789e8c5bc.png', import.meta.url).href,

  new URL('./components/images/ea5e284a85aa4c3c881749abb848c48d.png', import.meta.url).href
])
const currentIndex = ref(0)
const currentImage = computed(() => images.value[currentIndex.value])
const nextImage = () => { currentIndex.value = (currentIndex.value + 1) % images.value.length }
const prevImage = () => { currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length }

const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
updateTime()
let timeTimer = setInterval(updateTime, 1000)

let autoTimer = null
const startAutoTimer = () => {
  if (autoTimer) clearInterval(autoTimer)
  autoTimer = setInterval(() => {
    if (totalPages.value > 1) currentPage.value = (currentPage.value + 1) % totalPages.value
  }, 5000)
}
const resetAutoTimer = () => {
  if (autoTimer) { clearInterval(autoTimer); startAutoTimer() }
}

const showSplash = ref(true)
const showBuildingMethod = ref(false)

const budgetModalVisible = ref(false)
const budgetYear = ref(null)
const budgetData = ref([])
const handleYearClick = (year) => {
  const yearNum = parseInt(year)
  budgetYear.value = yearNum
  const yearData = yearlyBudgetData[yearNum]
  if (!yearData) { alert(`未找到 ${yearNum} 年的预算数据`); return }
  budgetData.value = allBudgetProvinces.map(province => ({ province, amount: yearData[province] || 0 }))
  budgetModalVisible.value = true
}

// ========== 省份详情 ==========
const provinceModalVisible = ref(false)
const currentProvince = ref('')
const sortedProvinceHeritageList = ref([])
const provinceLoading = ref(false)
const provincePageSize = 10
const provinceCurrentPage = ref(0)
const searchKeyword = ref('')
const jumpPageInput = ref('')

// 基于原始排序列表 + 关键词过滤
const filteredProvinceList = computed(() => {
  const list = sortedProvinceHeritageList.value
  if (!searchKeyword.value.trim()) return list
  const keyword = searchKeyword.value.trim().toLowerCase()
  return list.filter(item =>
    Object.values(item).some(val => String(val).toLowerCase().includes(keyword))
  )
})

// 分页总数基于过滤后列表
const provinceTotalPages = computed(() =>
  Math.ceil(filteredProvinceList.value.length / provincePageSize)
)

// 当前页数据切片
const paginatedProvinceList = computed(() => {
  const start = provinceCurrentPage.value * provincePageSize
  return filteredProvinceList.value.slice(start, start + provincePageSize)
})

// 页码跳转方法
const jumpToPage = () => {
  let page = parseInt(jumpPageInput.value, 10)
  if (isNaN(page) || page < 1) page = 1
  if (page > provinceTotalPages.value) page = provinceTotalPages.value
  provinceCurrentPage.value = page - 1
  jumpPageInput.value = ''
}

// 搜索时重置页码
watch(searchKeyword, () => {
  provinceCurrentPage.value = 0
})

const getPeriodWeight = (periodStr) => {
  if (!periodStr) return 999
  let mainPeriod = periodStr.split(/[、,，至\-～]/)[0].trim()
  for (let i = 0; i < dynastyOrder.length; i++) {
    if (mainPeriod.includes(dynastyOrder[i]) || dynastyOrder[i].includes(mainPeriod)) return i
  }
  const map = { '西周': '西周春秋', '春秋': '西周春秋', '殷': '商', '元明': '元', '明清': '明', '清民': '清' }
  if (map[mainPeriod]) {
    const idx = dynastyOrder.indexOf(map[mainPeriod])
    if (idx !== -1) return idx
  }
  return 999
}
const sortByPeriod = (a, b) => getPeriodWeight(a.period) - getPeriodWeight(b.period)

const provincePrevPage = () => { if (provinceCurrentPage.value > 0) provinceCurrentPage.value-- }
const provinceNextPage = () => { if (provinceCurrentPage.value < provinceTotalPages.value - 1) provinceCurrentPage.value++ }

const handleProvinceBarClick = async (params) => {
  const shortName = params.name
  if (!shortName) return

  const fullName = provinceFullNameMap[shortName] || shortName

  provinceModalVisible.value = true
  currentProvince.value = fullName
  sortedProvinceHeritageList.value = []
  provinceCurrentPage.value = 0
  provinceLoading.value = true
  searchKeyword.value = ''
  jumpPageInput.value = ''

  try {
    const res = await axios.get(`${apiBaseUrl}/heritage/detail/by-province`, {
      params: { province: fullName },
      timeout: 10000  // 增加超时
    })
    console.log('省份详情返回数据:', res.data)
    const rawData = res.data || []
    if (rawData.length === 0) {
      console.warn(`${fullName} 暂无数据`)
    }
    const sorted = [...rawData].sort(sortByPeriod)
    sortedProvinceHeritageList.value = sorted
  } catch (error) {
    console.error('获取省份文保详情失败', error)
    alert(`获取 ${fullName} 数据失败，请稍后重试\n${error.message}`)
    sortedProvinceHeritageList.value = []
  } finally {
    provinceLoading.value = false
  }
}
onMounted(() => {
  const timer = setInterval(nextImage, 5000)
  startAutoTimer()
  onUnmounted(() => {
    clearInterval(timer)
    clearInterval(timeTimer)
    if (autoTimer) clearInterval(autoTimer)
    stopDynastyRotateTimer()
  })
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ========== 容器与背景 ========== */
.app-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f0e1;
  overflow: hidden;
  font-family: '宋体', 'SimSun', 'Microsoft YaHei', serif;
  position: relative;
}

/* ========== 四角装饰（纯色+边框） ========== */
.ancient-decoration {
  position: fixed;
  z-index: 1;
  opacity: 0.35;
  pointer-events: none;
}

.left-decoration {
  left: 0;
  top: 0;
  width: 60px;
  height: 100vh;
  background-color: #c8aa7a;
  border-right: 1px solid #8b6e46;
}

.right-decoration {
  right: 0;
  top: 0;
  width: 60px;
  height: 100vh;
  background-color: #c8aa7a;
  border-left: 1px solid #8b6e46;
}

.top-decoration {
  top: 0;
  left: 60px;
  right: 60px;
  height: 36px;
  background-color: #bfa07a;
  border-bottom: 1px solid #8b6e46;
}

.bottom-decoration {
  bottom: 0;
  left: 60px;
  right: 60px;
  height: 36px;
  background-color: #bfa07a;
  border-top: 1px solid #8b6e46;
}

/* ========== 顶部导航栏 ========== */
.header-bar {
  width: 100%;
  height: 60px;
  background-color: #8b6e46;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #6b4f2e;
  position: relative;
  z-index: 2;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #f5e7d3;
}

.school-name {
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
}

.header-title {
  color: #ffffff;
  font-size: 18px;
  letter-spacing: 2px;
}

.header-right .time {
  color: #ffffff;
  font-size: 14px;
}

/* ========== 主面板与网格 ========== */
.dashboard {
  width: 100%;
  height: calc(100vh - 60px);
  padding: 15px;
  position: relative;
  z-index: 2;
}

.grid-container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 0.9fr 1.8fr 1.1fr;
  grid-template-rows: 1.0fr 0.6fr;
  gap: 15px;
}

/* ========== 卡片（纯白+窄边框） ========== */
.card {
  background-color: #ffffff;
  border: 1px solid #8b6e46;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: '宋体', 'SimSun', serif;
}

.card-header {
  height: 40px;
  background-color: #ede0cc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  border-bottom: 1px solid #c8aa7a;
}

.card-title {
  color: #4a3520;
  font-size: 16px;
  font-weight: bold;
}

.card-expand {
  color: #8b6e46;
  font-size: 16px;
  cursor: pointer;
}

.chart-wrapper {
  flex: 1;
  min-height: 0;
  padding: 5px;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.map-wrapper {
  flex: 1;
  min-height: 0;
  padding: 10px;
}

/* 网格区域分配 */
.card-left-top {
  grid-column: 1;
  grid-row: 1;
}

.card-center-top {
  grid-column: 2;
  grid-row: 1;
}

.card-right-top {
  grid-column: 3;
  grid-row: 1;
}

.card-left-bottom {
  grid-column: 1;
  grid-row: 2;
}

.card-center-bottom {
  grid-column: 2;
  grid-row: 2;
}

.card-right-bottom {
  grid-column: 3;
  grid-row: 2;
}

/* ========== 轮播图 ========== */
.carousel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  padding-top: 8px;
  box-sizing: border-box;
}

.carousel-image {
  width: 100%;
  max-height: 180px;
  object-fit: contain;
  border-radius: 4px;
  margin-top: 4px;
  margin-bottom: 4px;
}

.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 40px;
}

.carousel-btn {
  background-color: #a67c52;
  color: #ffffff;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.carousel-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #c8aa7a;
  cursor: pointer;
}

.dot.active {
  background-color: #8b6e46;
}

/* ========== 分页控件（卡片内使用） ========== */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid #ddd0b8;
  flex-shrink: 0;
}

.page-btn {
  background-color: #a67c52;
  border: none;
  color: #ffffff;
  font-size: 16px;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:hover:not(:disabled) {
  background-color: #8b6e46;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  color: #4a3520;
  font-size: 14px;
  font-weight: bold;
  background-color: #f5f0e1;
  padding: 4px 12px;
  border-radius: 4px;
}

/* ========== 放大模态框 ========== */
.expand-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-content {
  width: 85vw;
  height: 85vh;
  background-color: #ffffff;
  border: 1px solid #8b6e46;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.expand-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #8b6e46;
  color: #ffffff;
}

.expand-title {
  font-size: 20px;
  font-weight: bold;
}

.expand-close {
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
}

.expand-body {
  flex: 1;
  padding: 20px;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* 切片内部的完整占比 */
.expand-body>.expand-chart,
.expand-body>.expand-map,
.expand-body>.expand-dynasty-rotator,
.expand-body>.expand-carousel {
  flex: 1;
  min-height: 0;
}

.expand-dynasty-rotator {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 饼图切换区域（纯色按钮） */
.expand-pie-switchable {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.pie-switch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 12px 0;
  border-bottom: 1px solid #c8aa7a;
  margin-bottom: 12px;
}

.pie-mode-label {
  font-size: 14px;
  color: #4a3520;
  font-weight: bold;
}

.pie-switch-buttons {
  display: flex;
  gap: 10px;
}

.pie-switch-btn {
  background-color: #ede0cc;
  border: 1px solid #8b6e46;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #4a3520;
  cursor: pointer;
}

.pie-switch-btn.active {
  background-color: #8b6e46;
  color: #ffffff;
}

.pie-chart-wrapper {
  flex: 1;
  min-height: 0;
  width: 100%;
}

/* 朝代柱状图/时间线切换容器 */
.rotator-content-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
  gap: 15px;
}

.dynasty-bar-container {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.dynasty-bar-container :deep(.bar-chart-container),
.dynasty-bar-container :deep(>div) {
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
}

.dynasty-bar-container :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}

.dynasty-timeline-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

.timeline-scroll-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  text-align: center;
}

.timeline-full-line {
  height: 3px;
  background-color: #b89a7a;
  /* 纯色替代渐变 */
  margin: 0 20px;
}

.timeline-full-nodes-scroll {
  display: inline-flex;
  gap: 24px;
  padding: 20px 10px;
  margin: 0 auto;
}

.timeline-full-node {
  flex: 0 0 auto;
  min-width: 130px;
  text-align: center;
  background-color: #f5f0e1;
  border: 1px solid #c8aa7a;
  padding: 10px 8px;
}

.timeline-full-node.highlight {
  background-color: #fae5d3;
  border-color: #d97a3c;
}

.full-node-dot {
  width: 12px;
  height: 12px;
  background-color: #d97a3c;
  border-radius: 50%;
  margin: 0 auto 8px;
}

.timeline-full-node.highlight .full-node-dot {
  width: 18px;
  height: 18px;
  background-color: #c98a4a;
}

.full-node-dynasty {
  font-weight: bold;
  font-size: 15px;
  color: #4a3520;
  white-space: nowrap;
}

.full-node-event {
  font-size: 12px;
  color: #8b6e46;
  white-space: nowrap;
  margin-top: 6px;
}

.timeline-footnote {
  margin-top: 20px;
  font-size: 11px;
  color: #8b6e46;
  text-align: center;
}

.nav-arrow {
  background-color: #a67c52;
  border: none;
  font-size: 28px;
  width: 48px;
  border-radius: 4px;
  cursor: pointer;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  height: 80px;
}

.nav-arrow:hover {
  background-color: #8b6e46;
}

.rotator-indicator {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 15px;
  padding: 8px 0;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #c8aa7a;
  cursor: pointer;
}

.indicator-dot.active {
  width: 24px;
  border-radius: 5px;
  background-color: #d97a3c;
}

/* 放大轮播 */
.expand-carousel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.expand-carousel-image {
  max-width: 90%;
  max-height: 85%;
  object-fit: contain;
  border-radius: 4px;
}

/* ========== 预算表模态框（含省份详情） ========== */
.budget-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.budget-modal-content {
  width: 80vw;
  max-width: 1000px;
  height: 80vh;
  background-color: #ffffff;
  border: 1px solid #8b6e46;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.budget-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #8b6e46;
  color: #ffffff;
  flex-shrink: 0;
}

.budget-modal-title {
  font-size: 20px;
  font-weight: bold;
}

.budget-modal-close {
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
}

.budget-modal-body {
  flex: 1;
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.budget-table-wrapper {
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  overflow-y: auto;
  margin-bottom: 0;
}

.budget-table {
  width: 100%;
  border-collapse: collapse;
  font-family: '宋体', 'SimSun', serif;
  font-size: 14px;
}

.budget-table th,
.budget-table td {
  border: 1px solid #c8aa7a;
  padding: 8px 12px;
  text-align: center;
  color: #4a3520;
}

.budget-table th {
  background-color: #ede0cc;
  font-weight: bold;
}

.budget-table td {
  background-color: #ffffff;
}

.budget-number {
  text-align: right;
  font-family: monospace;
}

.budget-source {
  flex-shrink: 0;
  margin-top: 16px;
  font-size: 12px;
  color: #8b6e46;
  text-align: right;
  border-top: 1px solid #ddd0b8;
  padding-top: 8px;
}

/* 数据来源脚注（省份列表底部） */
.data-source {
  flex-shrink: 0;
  text-align: right;
  font-size: 12px;
  color: #8b6e46;
  margin-top: 12px;
  padding-right: 10px;
  border-top: 1px solid #ddd0b8;
  padding-top: 8px;
}

/* 省份详情加载与工具 */
.province-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
  color: #4a3520;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #c8aa7a;
  border-top-color: #8b6e46;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.header-right-part {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #fdf8ee;
  border: 1px solid #c8aa7a;
  border-radius: 4px;
  padding: 2px 8px;
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  padding: 6px 4px;
  width: 220px;
  color: #4a3520;
  font-size: 14px;
}

.search-input::placeholder {
  color: #b8865b;
}

.clear-search {
  background: none;
  border: none;
  color: #8b6e46;
  font-size: 16px;
  cursor: pointer;
}

.jump-to-page {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 16px;
  font-size: 14px;
  color: #4a3520;
}

.jump-input {
  width: 60px;
  padding: 4px 6px;
  border: 1px solid #c8aa7a;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
  color: #4a3520;
  background-color: #ffffff;
  outline: none;
}

.jump-btn {
  width: auto;
  padding: 4px 12px;
  font-size: 14px;
  background-color: #a67c52;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.jump-btn:hover {
  background-color: #8b6e46;
}

/* 全局自定义 tooltip（如果使用） */
:global(.custom-tooltip) {
  position: fixed;
  background-color: #ffffff;
  border: 1px solid #8b6e46;
  padding: 12px 18px;
  color: #4a3520;
  max-width: 300px;
  z-index: 9999;
  pointer-events: none;
}

:global(.custom-tooltip strong) {
  color: #8b6e46;
}

/* ========== 响应式微调 ========== */
@media (max-width: 768px) {
  .nav-arrow {
    width: 36px;
    font-size: 20px;
    height: 60px;
  }

  .pie-switch-btn {
    padding: 2px 8px;
    font-size: 10px;
  }

  .search-input {
    width: 140px;
  }

  .jump-to-page {
    margin-left: 8px;
  }
}

/* ========== 背景纹理层（蒙版效果） ========== */
.bg-texture-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  /* 最底层，所有内容在上方 */
  pointer-events: none;
  /* 不阻挡鼠标事件 */
  overflow: hidden;
}

/* 纹理图片 – 降低不透明度使其隐约可见 */
.bg-texture-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 填满屏幕，不拉伸变形 */
  opacity: 0.3;
  /* 🔧 越低越淡（可调 0.2~0.5） */
}

/* 蒙版层 – 叠加半透明底色进一步柔化纹理 */
.bg-texture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(245, 240, 225, 0.55);
  /* 🔧 颜色与原有 #f5f0e1 一致，透明度可调 0.4~0.7 */
}
</style>