<template>
  <div class="app-container">
    <div class="bg-texture-layer" v-if="!showBuildingMethod && !showSplash">
      <img :src="bgTexture" alt="" class="bg-texture-image" />
      <div class="bg-texture-overlay"></div>
    </div>
    <HelloWorld v-if="showSplash" @close="showSplash = false" />
    <BuildingMethod v-else-if="showBuildingMethod" @close="showBuildingMethod = false" />
    <div v-else class="dashboard">
      <div class="header-bar">
        <div class="header-left" @click="showBuildingMethod = true">
          <img src="./components/images/s5beb9247da49c.png" alt="logo" class="logo" />
          <span class="school-name">木览青数</span>
        </div>
        <div class="header-title">基于加权K-Means++的古建筑遗产时空聚类与演化分析</div>
        <div class="header-right"><span class="time">{{ currentTime }}</span></div>
      </div>
      <div class="grid-container">
        <div class="card card-left-top">
          <div class="card-header"><span class="card-title">文化遗产保护财政投入</span><span class="card-expand"
              @click="openExpand('finance')">⤢</span></div>
          <div class="chart-wrapper">
            <LineChart :chart-data="financeData" @year-click="handleYearClick" />
          </div>
        </div>
        <div class="card card-center-top">
          <div class="card-header"><span class="card-title">中国古建筑保护单位分布图</span><span class="card-expand"
              @click="openExpand('map')">⤢</span></div>
          <div class="map-wrapper">
            <Amap3DMap :api-base-url="apiBaseUrl" :compact="true" />
          </div>
        </div>
        <div class="card card-right-merged">
          <div class="card-header"><span class="card-title"><img src="./components/images/ico/书籍.png" alt="书籍"
                style="width:20px; height:20px; vertical-align:middle; margin-right:6px;" />古建筑数据 AI 助手</span><span
              class="card-expand" @click="openAIChat">⤢</span></div>
          <div style="flex:1; min-height:0; display: flex; flex-direction: column;">
            <UnifiedChat mode="embedded" />
          </div>
        </div>
        <div class="card card-left-bottom">
          <div class="card-header"><span class="card-title">各省古建筑保护单位数量排名</span><span class="card-expand"
              @click="openExpand('rankBar')">⤢</span></div>
          <div class="chart-wrapper">
            <BarChart :chart-data="pagedRankBarData" title="" :y-axis-min="0" :y-axis-max="rankMaxValue"
              :y-axis-interval="rankInterval" :bar-width="'40%'" :bar-category-gap="'30%'"
              @bar-click="handleProvinceBarClick" />
          </div>
          <div class="pagination-controls" v-if="totalPages > 1"><button class="page-btn" @click="prevPage"
              :disabled="totalPages <= 1">◀</button><span class="page-info">{{ currentPage + 1 }} / {{ totalPages
              }}</span><button class="page-btn" @click="nextPage" :disabled="totalPages <= 1">▶</button></div>
        </div>
        <div class="card card-center-bottom">
          <div class="card-header"><span class="card-title">各朝代古建筑保护单位分布</span><span class="card-expand"
              @click="openExpand('dynastyTimeline')">⤢</span></div>
          <div class="chart-wrapper">
            <BarChart :chart-data="dynastyBarData" title="" :y-axis-min="0" :y-axis-max="dynastyMaxValue"
              :y-axis-interval="dynastyInterval" @bar-click="handleDynastyBarClick" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="expandVisible" class="expand-modal" @click.self="closeExpand">
      <div class="expand-content">
        <div class="expand-header"><span class="expand-title">{{ expandTitle }}</span><span class="expand-close"
            @click="closeExpand">✕</span></div>
        <div class="expand-body">
          <div v-if="expandType === 'finance'" class="expand-chart">
            <LineChart :chart-data="financeData" :expanded="true" @year-click="handleYearClick" />
            <div class="data-source">数据来源：财政部/国家文物局2020-2025年文化遗产保护资金统计（公开数据）</div>
          </div>
          <div v-else-if="expandType === 'map'" class="expand-map">
            <Amap3DMap :api-base-url="apiBaseUrl" :expanded="true" />
          </div>
          <div v-else-if="expandType === 'rankBar'" class="expand-chart">
            <BarChart :chart-data="rankBarData" title="" :y-axis-min="0" :y-axis-max="rankMaxValue"
              :y-axis-interval="rankInterval" :bar-width="'40%'" :bar-category-gap="'30%'"
              @bar-click="handleProvinceBarClick" />
          </div>
          <div v-else-if="expandType === 'dynastyTimeline'" class="expand-dynasty-section">
            <div class="view-switcher"><button :class="['switch-btn', { active: dynastyExpandViewMode === 'bar' }]"
                @click="dynastyExpandViewMode = 'bar'">柱状图</button><button
                :class="['switch-btn', { active: dynastyExpandViewMode === 'timeline' }]"
                @click="dynastyExpandViewMode = 'timeline'">时间脉络</button></div>
            <div v-show="dynastyExpandViewMode === 'bar'" class="dynasty-bar-container">
              <BarChart :chart-data="dynastyBarData" title="" :y-axis-min="0" :y-axis-max="dynastyMaxValue"
                :y-axis-interval="dynastyInterval" />
              <div class="data-source"></div>
            </div>
            <div v-show="dynastyExpandViewMode === 'timeline'" class="dynasty-timeline-view">
              <div class="landscape-bg"></div>
              <div class="water-ripple"></div>
              <div class="timeline-horizontal-wrapper" ref="timelineContainer">
                <svg class="wave-svg" :viewBox="`0 0 ${containerWidth} 200`" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#8b6e46" stop-opacity="0.6" />
                      <stop offset="30%" stop-color="#c8aa7a" stop-opacity="0.9" />
                      <stop offset="70%" stop-color="#d4b48c" stop-opacity="0.9" />
                      <stop offset="100%" stop-color="#8b6e46" stop-opacity="0.6" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path :d="mountainWavePath" fill="none" stroke="url(#waveGradient)" stroke-width="4"
                    stroke-linecap="round" class="wave-path" filter="url(#glow)" />
                  <path :d="waterFlowPath" fill="none" stroke="#b89a7a" stroke-width="1.5" stroke-dasharray="8 6"
                    stroke-linecap="round" opacity="0.6" class="water-flow" />
                </svg>
                <div class="timeline-nodes-flex">
                  <div v-for="(node, idx) in optimizedTimelineNodes" :key="idx" class="timeline-horizontal-node"
                    :class="{ 'node-up': idx % 2 === 0, 'node-down': idx % 2 === 1 }"
                    :style="{ transform: `translateY(${nodeOffsets[idx]}px)` }">
                    <template v-if="idx % 2 === 0">
                      <div class="node-card card-above">
                        <div class="node-dynasty">{{ node.dynasty }}</div>
                        <div class="node-event">{{ node.event }}</div>
                      </div>
                      <div class="node-connector-vertical connector-up"></div>
                      <div class="node-dot"></div>
                    </template>
                    <template v-else>
                      <div class="node-dot"></div>
                      <div class="node-connector-vertical connector-down"></div>
                      <div class="node-card card-below">
                        <div class="node-dynasty">{{ node.dynasty }}</div>
                        <div class="node-event">{{ node.event }}</div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              <div class="timeline-poem">「 九域遗珍大数据，千年古建此中流 」</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="budgetModalVisible" class="budget-modal" @click.self="budgetModalVisible = false">
      <div class="budget-modal-content">
        <div class="budget-modal-header"><span class="budget-modal-title">{{ budgetYear }}年国家文物保护资金分省预算表</span><span
            class="budget-modal-close" @click="budgetModalVisible = false">✕</span></div>
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
          <div class="budget-source">数据来源：财政部/国家文物局《{{ budgetYear }}年国家文物保护资金预算表》<span
              v-if="budgetYear === 2021">（注：原始文件未列出的省份按未拨款 0 万元计）</span></div>
        </div>
      </div>
    </div>
    <div v-if="provinceModalVisible" class="budget-modal" @click.self="provinceModalVisible = false">
      <div class="budget-modal-content" style="width: 90vw; max-width: 1400px;">
        <div class="budget-modal-header"><span class="budget-modal-title">{{ currentProvince }} 古建筑保护单位列表（共 {{
          filteredProvinceList.length }} 处）</span>
          <div class="header-right-part">
            <div class="search-box"><input v-model="searchKeyword" placeholder="搜索名称/时代/地址等"
                class="search-input" /><button v-if="searchKeyword" class="clear-search"
                @click="searchKeyword = ''">✕</button></div><span class="budget-modal-close"
              @click="provinceModalVisible = false">✕</span>
          </div>
        </div>
        <div class="budget-modal-body">
          <div v-if="provinceLoading" class="province-loading">
            <div class="loading-spinner"></div><span>正在加载 {{ currentProvince }} 的数据...</span>
          </div><template v-else>
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
                    <td colspan="8" style="text-align: center;">{{ searchKeyword ? '未找到匹配的古建筑保护单位' : '该省份暂无古建筑保护单位数据' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pagination-controls" v-if="provinceTotalPages > 1"><button class="page-btn"
                @click="provincePrevPage" :disabled="provinceCurrentPage <= 0">◀</button><span class="page-info">{{
                  provinceCurrentPage + 1 }} / {{ provinceTotalPages }}</span><button class="page-btn"
                @click="provinceNextPage" :disabled="provinceCurrentPage >= provinceTotalPages - 1">▶</button>
              <div class="jump-to-page"><span>前往</span><input v-model.number="jumpPageInput" type="number" min="1"
                  :max="provinceTotalPages" class="jump-input" @keyup.enter="jumpToPage" /><span>页</span><button
                  class="page-btn jump-btn" @click="jumpToPage">跳转</button></div>
            </div>
            <div class="data-source">数据来源：全球变化科学研究数据出版系统 | 按年代先后排序</div>
          </template>
        </div>
      </div>
    </div>
    <div class="ancient-decoration left-decoration" v-if="!showBuildingMethod && !showSplash"></div>
    <div class="ancient-decoration right-decoration" v-if="!showBuildingMethod && !showSplash"></div>
    <div class="ancient-decoration top-decoration" v-if="!showBuildingMethod && !showSplash"></div>
    <div class="ancient-decoration bottom-decoration" v-if="!showBuildingMethod && !showSplash"></div>
    <UnifiedChat mode="modal" v-model:visible="aiChatVisible" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, provide, nextTick } from 'vue'
import axios from 'axios'
import LineChart from './components/LineChart.vue'
import BarChart from './components/BarChart.vue'
import Amap3DMap from './components/Amap3DMap.vue'
import HelloWorld from './components/HelloWorld.vue'
import BuildingMethod from './components/BuildingMethod.vue'
import UnifiedChat from './components/UnifiedChat.vue'
import bgTexture from './components/images/5e8d81ef47cbfc954a3304f4e2604073.png'
import officialHeritageCounts from './components/js/officialHeritageCounts.json'
import dynastyCountMap from './components/js/dynastyData.json'
import yearlyBudgetData from './components/js/yearlyBudgetData.json'
import allBudgetProvinces from './components/js/allBudgetProvinces.json'

const apiBaseUrl = 'http://localhost:8081/api'

const chatMessages = ref([{ role: 'assistant', content: '您好！我是古建筑数据智能助手，已加载全国重点文物保护单位数据、朝代分布、各省预算等信息。请问您想了解什么？' }])
const chatLoading = ref(false)
const knowledgeContext = { provinceCounts: officialHeritageCounts, dynastyCounts: dynastyCountMap, yearlyBudget: yearlyBudgetData, allProvinces: allBudgetProvinces }
const getMockReply = (question, ctx) => {
  const q = question.toLowerCase()
  if (q.includes('朝代') && (q.includes('最多') || q.includes('哪个'))) { let maxDynasty = '', maxCount = 0; for (const [dyn, cnt] of Object.entries(ctx.dynastyCounts)) { if (cnt > maxCount) { maxCount = cnt; maxDynasty = dyn } } return `根据数据，${maxDynasty} 时期的古建筑数量最多，共 ${maxCount} 处。` }
  if (q.includes('山西') && q.includes('多少')) return `山西省共有 ${ctx.provinceCounts['山西'] || 0} 处全国重点文物保护单位（古建筑类）。`
  if (q.includes('预算') && q.includes('2025')) { const bud = ctx.yearlyBudget['2025']; const topProvince = Object.entries(bud).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]); return `2025 年文物保护资金预算最高的是 ${topProvince[0]}，预算 ${topProvince[1]} 万元。` }
  return `已加载全国古建筑数据（省份数量、朝代分布、历年预算）。您可以问类似"哪个朝代古建筑最多？""山西有多少处？""2025年预算最高的省份？"我会给出详细分析。`
}
const sendMessage = async (text) => {
  if (!text.trim() || chatLoading.value) return
  chatMessages.value.push({ role: 'user', content: text })
  chatLoading.value = true
  try {
    const contextForAI = { provinceCounts: officialHeritageCounts, dynastyCounts: dynastyCountMap, budgetYears: Object.keys(yearlyBudgetData), totalHeritage: 5058, note: '用户询问古建筑数据，请基于以上信息回答。' }
    const response = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, context: contextForAI }) })
    if (!response.ok) throw new Error('API 请求失败')
    const data = await response.json()
    const reply = data.reply || '抱歉，我暂时无法回答这个问题。'
    chatMessages.value.push({ role: 'assistant', content: reply })
  } catch (error) { console.error('AI 调用失败:', error); const mockReply = getMockReply(text, knowledgeContext); chatMessages.value.push({ role: 'assistant', content: mockReply }) }
  finally { chatLoading.value = false }
}
provide('chatMessages', chatMessages); provide('chatLoading', chatLoading); provide('sendMessage', sendMessage)

const aiChatVisible = ref(false)
const openAIChat = () => { aiChatVisible.value = true }

const provinceFullNameMap = { '北京': '北京市', '天津': '天津市', '上海': '上海市', '重庆': '重庆市', '河北': '河北省', '山西': '山西省', '内蒙古': '内蒙古自治区', '辽宁': '辽宁省', '吉林': '吉林省', '黑龙江': '黑龙江省', '江苏': '江苏省', '安徽': '安徽省', '福建': '福建省', '江西': '江西省', '山东': '山东省', '河南': '河南省', '湖北': '湖北省', '湖南': '湖南省', '广东': '广东省', '广西': '广西壮族自治区', '海南': '海南省', '四川': '四川省', '贵州': '贵州省', '云南': '云南省', '西藏': '西藏自治区', '陕西': '陕西省', '甘肃': '甘肃省', '青海': '青海省', '宁夏': '宁夏回族自治区', '新疆': '新疆维吾尔自治区', '台湾': '台湾省', '香港': '香港特别行政区', '澳门': '澳门特别行政区' }

const dynastyOrder = ['旧石器时代', '新石器时代', '夏', '商', '西周春秋', '战国', '秦', '汉', '三国', '晋', '南北朝', '隋', '唐', '五代', '宋', '辽', '金', '元', '明', '清']
const dynastyBarData = computed(() => ({ xAxisData: dynastyOrder, seriesData: dynastyOrder.map(d => dynastyCountMap[d] || 0) }))
const dynastyMaxValue = computed(() => { const max = Math.max(...dynastyBarData.value.seriesData); return Math.ceil(max / 100) * 100 })
const dynastyInterval = computed(() => { const max = dynastyMaxValue.value; if (max <= 200) return 50; if (max <= 500) return 100; return 200 })

const rankBarData = computed(() => { const arr = []; for (const [province, count] of Object.entries(officialHeritageCounts)) arr.push({ name: province, value: count }); arr.sort((a, b) => { if (b.value !== a.value) return b.value - a.value; return a.name.localeCompare(b.name) }); return { xAxisData: arr.map(i => i.name), seriesData: arr.map(i => i.value) } })

const pageSize = 5, currentPage = ref(0)
const totalItems = computed(() => rankBarData.value.xAxisData.length)
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize))
const pagedRankBarData = computed(() => { const start = currentPage.value * pageSize, end = start + pageSize; const slicedX = rankBarData.value.xAxisData.slice(start, end), slicedY = rankBarData.value.seriesData.slice(start, end); const fullX = [...slicedX], fullY = [...slicedY]; while (fullX.length < pageSize) { fullX.push(''); fullY.push(null) } return { xAxisData: fullX, seriesData: fullY } })
const rankMaxValue = computed(() => { const values = rankBarData.value.seriesData.filter(v => v !== null && v !== undefined); if (values.length === 0) return 100; const maxVal = Math.max(...values); return Math.ceil(maxVal / 50) * 50 })
const rankInterval = computed(() => { const maxVal = rankMaxValue.value; if (maxVal <= 100) return 20; if (maxVal <= 200) return 50; return 100 })
const prevPage = () => { resetAutoTimer(); currentPage.value = (currentPage.value - 1 + totalPages.value) % totalPages.value }
const nextPage = () => { resetAutoTimer(); currentPage.value = (currentPage.value + 1) % totalPages.value }

const optimizedTimelineNodes = [
  { dynasty: '先秦', event: '茅茨土阶·夯土版筑' },
  { dynasty: '秦汉', event: '高台建筑·大屋顶雏形' },
  { dynasty: '魏晋南北朝', event: '佛教石窟·塔幢见证' },
  { dynasty: '隋唐', event: '雄健豪放·斗栱宏大' },
  { dynasty: '北宋', event: '精致典雅·结构理性' },
  { dynasty: '金元', event: '减柱造法·粗犷有力' },
  { dynasty: '明代', event: '官式定型·砖石普及' },
  { dynasty: '清代', event: '细密繁复·技艺精湛' }
];
const handleDynastyBarClick = (params) => { }
const financeData = { xAxisData: ['2020', '2021', '2022', '2023', '2024', '2025'], seriesData: [589966, 633299, 638333, 638333, 638333, 638333] }

const expandVisible = ref(false), expandType = ref(''), expandTitle = ref(''), dynastyExpandViewMode = ref('bar')
const openExpand = (type) => { expandType.value = type; const titles = { finance: '文化遗产保护财政投入', map: '中国古建筑保护单位分布图', rankBar: '各省古建筑保护单位数量排名', dynastyTimeline: '各朝代古建筑保护单位分布 · 文化传承脉络' }; expandTitle.value = titles[type] || ''; expandVisible.value = true; if (type === 'dynastyTimeline') dynastyExpandViewMode.value = 'bar' }
const closeExpand = () => { expandVisible.value = false }

const currentTime = ref('')
const updateTime = () => { const now = new Date(); currentTime.value = now.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
updateTime()
let timeTimer = setInterval(updateTime, 1000)

let autoTimer = null
const startAutoTimer = () => { if (autoTimer) clearInterval(autoTimer); autoTimer = setInterval(() => { if (totalPages.value > 1) currentPage.value = (currentPage.value + 1) % totalPages.value }, 5000) }
const resetAutoTimer = () => { if (autoTimer) { clearInterval(autoTimer); startAutoTimer() } }

const showSplash = ref(true), showBuildingMethod = ref(false)

const budgetModalVisible = ref(false), budgetYear = ref(null), budgetData = ref([])
const handleYearClick = (year) => { const yearNum = parseInt(year); budgetYear.value = yearNum; const yearData = yearlyBudgetData[yearNum]; if (!yearData) { alert(`未找到 ${yearNum} 年的预算数据`); return } budgetData.value = allBudgetProvinces.map(province => ({ province, amount: yearData[province] || 0 })); budgetModalVisible.value = true }

const provinceModalVisible = ref(false), currentProvince = ref(''), sortedProvinceHeritageList = ref([]), provinceLoading = ref(false), provincePageSize = 10, provinceCurrentPage = ref(0), searchKeyword = ref(''), jumpPageInput = ref('')
const filteredProvinceList = computed(() => { const list = sortedProvinceHeritageList.value; if (!searchKeyword.value.trim()) return list; const keyword = searchKeyword.value.trim().toLowerCase(); return list.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(keyword))) })
const provinceTotalPages = computed(() => Math.ceil(filteredProvinceList.value.length / provincePageSize))
const paginatedProvinceList = computed(() => { const start = provinceCurrentPage.value * provincePageSize; return filteredProvinceList.value.slice(start, start + provincePageSize) })
const jumpToPage = () => { let page = parseInt(jumpPageInput.value, 10); if (isNaN(page) || page < 1) page = 1; if (page > provinceTotalPages.value) page = provinceTotalPages.value; provinceCurrentPage.value = page - 1; jumpPageInput.value = '' }
watch(searchKeyword, () => { provinceCurrentPage.value = 0 })
const getPeriodWeight = (periodStr) => { if (!periodStr) return 999; let mainPeriod = periodStr.split(/[、,，至\-～]/)[0].trim(); for (let i = 0; i < dynastyOrder.length; i++) { if (mainPeriod.includes(dynastyOrder[i]) || dynastyOrder[i].includes(mainPeriod)) return i } const map = { '西周': '西周春秋', '春秋': '西周春秋', '殷': '商', '元明': '元', '明清': '明', '清民': '清' }; if (map[mainPeriod]) { const idx = dynastyOrder.indexOf(map[mainPeriod]); if (idx !== -1) return idx } return 999 }
const sortByPeriod = (a, b) => getPeriodWeight(a.period) - getPeriodWeight(b.period)
const provincePrevPage = () => { if (provinceCurrentPage.value > 0) provinceCurrentPage.value-- }
const provinceNextPage = () => { if (provinceCurrentPage.value < provinceTotalPages.value - 1) provinceCurrentPage.value++ }
const handleProvinceBarClick = async (params) => { const shortName = params.name; if (!shortName) return; const fullName = provinceFullNameMap[shortName] || shortName; provinceModalVisible.value = true; currentProvince.value = fullName; sortedProvinceHeritageList.value = []; provinceCurrentPage.value = 0; provinceLoading.value = true; searchKeyword.value = ''; jumpPageInput.value = ''; try { const res = await axios.get(`${apiBaseUrl}/heritage/detail/by-province`, { params: { province: fullName }, timeout: 10000 }); const rawData = res.data || []; sortedProvinceHeritageList.value = [...rawData].sort(sortByPeriod) } catch (error) { console.error('获取省份文保详情失败', error); alert(`获取 ${fullName} 数据失败，请稍后重试\n${error.message}`); sortedProvinceHeritageList.value = [] } finally { provinceLoading.value = false } }

const timelineContainer = ref(null), containerWidth = ref(800), wavePhase = ref(0)
let animationFrameId = null
const mountainAmp = 22, mountainFreq = 1.2, streamAmp = 8, streamFreq = 5.5, speed = 0.28
const nodeOffsets = computed(() => { const totalNodes = optimizedTimelineNodes.length; return optimizedTimelineNodes.map((_, idx) => { const xRatio = totalNodes > 1 ? idx / (totalNodes - 1) : 0.5; const mountainAngle = xRatio * Math.PI * 2 * mountainFreq + wavePhase.value; const streamAngle = xRatio * Math.PI * 2 * streamFreq + wavePhase.value * 1.5; return Math.sin(mountainAngle) * mountainAmp + Math.sin(streamAngle) * streamAmp * 0.4 }) })
const mountainWavePath = computed(() => { if (!timelineContainer.value) return ''; const width = containerWidth.value || 800, steps = 200; let path = ''; for (let i = 0; i <= steps; i++) { const x = (i / steps) * width, xRatio = i / steps; const mountainAngle = xRatio * Math.PI * 2 * mountainFreq + wavePhase.value; const streamAngle = xRatio * Math.PI * 2 * streamFreq + wavePhase.value * 1.5; let y = 100 + Math.sin(mountainAngle) * mountainAmp + Math.sin(streamAngle) * streamAmp * 0.6; y = Math.min(180, Math.max(20, y)); path += `${i === 0 ? 'M' : 'L'} ${x} ${y} ` } return path })
const waterFlowPath = computed(() => { if (!timelineContainer.value) return ''; const width = containerWidth.value || 800, steps = 150; let path = ''; for (let i = 0; i <= steps; i++) { const x = (i / steps) * width, xRatio = i / steps; const angle = xRatio * Math.PI * 2 * (streamFreq + 1.2) + wavePhase.value * 1.8; let y = 112 + Math.sin(angle) * (streamAmp * 0.8); y = Math.min(170, Math.max(40, y)); path += `${i === 0 ? 'M' : 'L'} ${x} ${y} ` } return path })
const animate = () => { wavePhase.value += 0.02 * speed; animationFrameId = requestAnimationFrame(animate) }
const updateContainerWidth = () => { if (timelineContainer.value) containerWidth.value = timelineContainer.value.clientWidth }
const startWaveAnimation = () => { if (animationFrameId) return; updateContainerWidth(); animate() }
const stopWaveAnimation = () => { if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null } }
watch(dynastyExpandViewMode, (newMode) => { if (expandVisible.value && newMode === 'timeline') nextTick(() => startWaveAnimation()); else stopWaveAnimation() })
watch(expandVisible, (visible) => { if (!visible) stopWaveAnimation(); else if (dynastyExpandViewMode.value === 'timeline') nextTick(() => startWaveAnimation()) })
const onWindowResize = () => { if (expandVisible.value && dynastyExpandViewMode.value === 'timeline') updateContainerWidth() }
onMounted(() => { startAutoTimer(); window.addEventListener('resize', onWindowResize) })
onUnmounted(() => { clearInterval(timeTimer); if (autoTimer) clearInterval(autoTimer); stopWaveAnimation(); window.removeEventListener('resize', onWindowResize) })
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box
}

.app-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f0e1;
  overflow: hidden;
  font-family: '宋体', 'SimSun', 'Microsoft YaHei', serif;
  position: relative
}

.ancient-decoration {
  position: fixed;
  z-index: 1;
  opacity: 0.35;
  pointer-events: none
}

.left-decoration {
  left: 0;
  top: 0;
  width: 60px;
  height: 100vh;
  background-color: #c8aa7a;
  border-right: 1px solid #8b6e46
}

.right-decoration {
  right: 0;
  top: 0;
  width: 60px;
  height: 100vh;
  background-color: #c8aa7a;
  border-left: 1px solid #8b6e46
}

.top-decoration {
  top: 0;
  left: 60px;
  right: 60px;
  height: 36px;
  background-color: #bfa07a;
  border-bottom: 1px solid #8b6e46
}

.bottom-decoration {
  bottom: 0;
  left: 60px;
  right: 60px;
  height: 36px;
  background-color: #bfa07a;
  border-top: 1px solid #8b6e46
}

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
  margin-bottom: 10px;
  border-radius: 0 0 10px 10px
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #f5e7d3
}

.school-name {
  color: #fff;
  font-size: 16px;
  font-weight: bold
}

.header-title {
  color: #fff;
  font-size: 18px;
  letter-spacing: 2px
}

.header-right .time {
  color: #fff;
  font-size: 14px
}

.dashboard {
  width: 100%;
  height: calc(100vh - 70px);
  padding: 15px;
  position: relative;
  z-index: 2
}

.grid-container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 0.9fr 1.8fr 1.1fr;
  grid-template-rows: 1fr 0.6fr;
  gap: 15px
}

.card {
  background-color: #fff;
  border: 1px solid #c8aa7a;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(139, 110, 70, 0.08)
}

.card-header {
  height: 40px;
  background-color: #ede0cc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  border-bottom: 1px solid #c8aa7a;
  border-radius: 10px 10px 0 0
}

.card-title {
  color: #4a3520;
  font-size: 16px;
  font-weight: bold
}

.card-expand {
  color: #8b6e46;
  font-size: 16px;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background-color 0.2s
}

.card-expand:hover {
  background-color: rgba(139, 110, 70, 0.1)
}

.chart-wrapper {
  flex: 1;
  min-height: 0;
  padding: 5px;
  display: flex;
  align-items: stretch;
  justify-content: center
}

.map-wrapper {
  flex: 1;
  min-height: 0;
  padding: 10px
}

.card-left-top {
  grid-column: 1;
  grid-row: 1
}

.card-center-top {
  grid-column: 2;
  grid-row: 1
}

.card-right-merged {
  grid-column: 3;
  grid-row: 1/span 2
}

.card-left-bottom {
  grid-column: 1;
  grid-row: 2
}

.card-center-bottom {
  grid-column: 2;
  grid-row: 2
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid #ddd0b8;
  flex-shrink: 0
}

.page-btn {
  background-color: #a67c52;
  border: none;
  color: #fff;
  font-size: 16px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s
}

.page-btn:hover:not(:disabled) {
  background-color: #8b6e46
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed
}

.page-info {
  color: #4a3520;
  font-size: 14px;
  font-weight: bold;
  background-color: #f5f0e1;
  padding: 4px 12px;
  border-radius: 6px
}

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
  justify-content: center
}

.expand-content {
  width: 85vw;
  height: 85vh;
  background-color: #fff;
  border: 1px solid #8b6e46;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3)
}

.expand-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #8b6e46;
  color: #fff;
  border-radius: 14px 14px 0 0;
  flex-shrink: 0
}

.expand-title {
  font-size: 20px;
  font-weight: bold
}

.expand-close {
  font-size: 20px;
  cursor: pointer;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  transition: background-color 0.2s
}

.expand-close:hover {
  background-color: rgba(255, 255, 255, 0.3)
}

.expand-body {
  flex: 1;
  padding: 20px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  min-height: 0
}

.expand-body>.expand-chart,
.expand-body>.expand-map {
  flex: 1;
  min-height: 0
}

.view-switcher {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  justify-content: center;
  flex-shrink: 0
}

.switch-btn {
  padding: 8px 24px;
  border: 1px solid #c8aa7a;
  background-color: #fdf8ee;
  color: #4a3520;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s
}

.switch-btn.active {
  background-color: #8b6e46;
  color: #fff;
  border-color: #8b6e46
}

.switch-btn:hover:not(.active) {
  background-color: #ede0cc
}

.expand-dynasty-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0
}

.dynasty-bar-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column
}

.dynasty-bar-container>:first-child {
  flex: 1;
  min-height: 0
}

.dynasty-timeline-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  background: linear-gradient(to bottom, rgba(245, 240, 225, 0.2), rgba(235, 225, 205, 0.4));
  border-radius: 16px;
  overflow: hidden
}

.landscape-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400"><path fill="rgba(139,110,70,0.08)" d="M0,350 Q150,280 300,310 T600,260 T900,290 T1200,240 L1200,400 L0,400 Z"/><path fill="rgba(139,110,70,0.05)" d="M0,380 Q200,320 400,340 T800,300 T1200,320 L1200,400 L0,400 Z"/><path fill="rgba(100,70,40,0.03)" d="M0,400 L0,360 Q300,300 600,330 T1200,280 L1200,400 Z"/></svg>');
  background-repeat: repeat-x;
  background-position: bottom;
  background-size: 1200px 400px;
  opacity: 0.5;
  pointer-events: none;
  z-index: 0
}

.water-ripple {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: repeating-linear-gradient(transparent 0px, transparent 4px, rgba(200, 170, 122, 0.15) 4px, rgba(200, 170, 122, 0.15) 8px);
  pointer-events: none;
  z-index: 0;
  animation: rippleMove 8s linear infinite
}

@keyframes rippleMove {
  0% {
    background-position: 0 0
  }

  100% {
    background-position: 100px 0
  }
}

.timeline-horizontal-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  margin: 20px 40px;
  z-index: 2;
  min-height: 320px
}

.wave-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none
}

.wave-path {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  transition: d 0.1s linear
}

.water-flow {
  transition: d 0.1s linear;
  animation: shimmer 3s infinite alternate
}

@keyframes shimmer {
  0% {
    opacity: 0.4
  }

  100% {
    opacity: 0.8
  }
}

.timeline-nodes-flex {
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 40px 0 60px
}

.timeline-horizontal-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 130px;
  transition: transform 0.2s ease-out;
  will-change: transform
}

.node-connector-vertical {
  display: none
}

.node-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
  opacity: 0;
  pointer-events: none
}

.node-card {
  background: linear-gradient(145deg, #fef9ef 0%, #f5e7d3 100%);
  border: 1px solid #c8aa7a;
  border-radius: 16px;
  padding: 14px 18px;
  text-align: center;
  min-width: 140px;
  box-shadow: 0 8px 20px rgba(100, 70, 40, 0.2), inset 0 1px 0 #fff9f0;
  flex-shrink: 0;
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(2px)
}

.node-card::before {
  content: "";
  font-family: "Segoe UI Emoji";
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  color: #b89a7a;
  opacity: 0.5;
  text-shadow: 0 1px 0 #fff
}

.card-above {
  margin-bottom: 20px;
  order: -1;
  transform: translateY(8px)
}

.card-below {
  margin-top: 20px;
  order: 3;
  transform: translateY(-8px)
}

.timeline-horizontal-node:hover .node-card {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 28px rgba(100, 70, 40, 0.3);
  background: linear-gradient(145deg, #fff8ef, #f7e9d5)
}

.node-dynasty {
  font-weight: bold;
  font-size: 18px;
  color: #3e2a1f;
  white-space: nowrap;
  letter-spacing: 2px;
  border-bottom: 1px dashed #c8aa7a;
  display: inline-block;
  padding-bottom: 4px;
  margin-bottom: 6px
}

.node-event {
  font-size: 12px;
  color: #7a5a3a;
  white-space: normal;
  line-height: 1.5;
  margin-top: 8px;
  font-style: italic
}

.timeline-poem {
  text-align: center;
  font-size: 13px;
  color: #8b6e46;
  letter-spacing: 2px;
  padding: 12px 0;
  border-top: 1px dashed #d4c4a8;
  margin-top: 8px;
  font-family: "KaiTi", "楷体", serif;
  background: rgba(245, 240, 225, 0.6);
  border-radius: 0 0 16px 16px
}

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
  justify-content: center
}

.budget-modal-content {
  width: 80vw;
  max-width: 1000px;
  height: 80vh;
  background-color: #fff;
  border: 1px solid #8b6e46;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3)
}

.budget-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #8b6e46;
  color: #fff;
  border-radius: 14px 14px 0 0;
  flex-shrink: 0
}

.budget-modal-title {
  font-size: 20px;
  font-weight: bold
}

.budget-modal-close {
  font-size: 20px;
  cursor: pointer;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  transition: background-color 0.2s
}

.budget-modal-close:hover {
  background-color: rgba(255, 255, 255, 0.3)
}

.budget-modal-body {
  flex: 1;
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0
}

.budget-table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border-radius: 8px
}

.budget-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px
}

.budget-table th,
.budget-table td {
  border: 1px solid #c8aa7a;
  padding: 8px 12px;
  text-align: center;
  color: #4a3520
}

.budget-table th {
  background-color: #ede0cc;
  font-weight: bold
}

.budget-number {
  text-align: right;
  font-family: monospace
}

.budget-source {
  flex-shrink: 0;
  margin-top: 16px;
  font-size: 12px;
  color: #8b6e46;
  text-align: right;
  border-top: 1px solid #ddd0b8;
  padding-top: 8px
}

.data-source {
  flex-shrink: 0;
  text-align: right;
  font-size: 12px;
  color: #8b6e46;
  margin-top: 12px;
  padding-right: 10px;
  border-top: 1px solid #ddd0b8;
  padding-top: 8px
}

.province-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
  color: #4a3520
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #c8aa7a;
  border-top-color: #8b6e46;
  border-radius: 50%;
  animation: spin 0.8s linear infinite
}

@keyframes spin {
  to {
    transform: rotate(360deg)
  }
}

.header-right-part {
  display: flex;
  align-items: center;
  gap: 20px
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #fdf8ee;
  border: 1px solid #c8aa7a;
  border-radius: 8px;
  padding: 2px 8px
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  padding: 6px 4px;
  width: 220px;
  color: #4a3520;
  font-size: 14px;
  border-radius: 6px
}

.search-input::placeholder {
  color: #b8865b
}

.clear-search {
  background: none;
  border: none;
  color: #8b6e46;
  font-size: 16px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center
}

.clear-search:hover {
  background-color: rgba(139, 110, 70, 0.1)
}

.jump-to-page {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 16px;
  font-size: 14px;
  color: #4a3520
}

.jump-input {
  width: 60px;
  padding: 4px 6px;
  border: 1px solid #c8aa7a;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  color: #4a3520;
  background-color: #fff;
  outline: none
}

.jump-btn {
  width: auto;
  padding: 4px 12px;
  font-size: 14px;
  background-color: #a67c52;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer
}

.jump-btn:hover {
  background-color: #8b6e46
}

.bg-texture-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  overflow: hidden
}

.bg-texture-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3
}

.bg-texture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(245, 240, 225, 0.55)
}

@media (max-width:1200px) {
  .timeline-horizontal-node {
    min-width: 100px
  }

  .node-card {
    padding: 8px 12px;
    min-width: 110px
  }

  .node-dynasty {
    font-size: 14px
  }

  .node-event {
    font-size: 10px
  }
}
</style>