<!-- BuildingMethod.vue · 营造法式古籍典藏主页面 -->
<template>
<div
  class="building-method-container"
  ref="containerRef"
  :style="{ '--bg-image': `url(${bgImage})` }"
>
    <!-- 顶部导航栏 -->
    <div class="detail-header">
      <div class="back-btn" @click="closePage">
        <span class="back-icon">←</span>
        <span>返回主平台</span>
      </div>
      <div class="header-title">
        <span class="title-decoration">《</span>
        营造法式数字化阅读平台
        <span class="title-decoration">》</span>
      </div>
      <div class="placeholder"></div>
    </div>

    <!-- 左右主体布局 -->
    <div class="main-layout">
      <!-- 左侧导航栏（古风卷轴样式） -->
      <div class="nav-sidebar">
        <div class="nav-title">
          <span class="title-chinese">目 录</span>
        </div>
        <ul class="nav-list">
          <li :class="{ active: activeTab === 'author' }" @click="switchTab('author')">
            <span>作者生平</span>
            <span class="nav-decoration"></span>
          </li>
          <li :class="{ active: activeTab === 'background' }" @click="switchTab('background')">
            <span>书籍背景</span>
            <span class="nav-decoration"></span>
          </li>
          <li :class="{ active: activeTab === 'wordcloud' }" @click="switchTab('wordcloud')">
            <span>高频词云</span>
            <span class="nav-decoration"></span>
          </li>
          <li class="has-submenu">
            <div class="nav-parent" :class="{ expanded: textMenuExpanded }" @click="toggleTextMenu">
              <span>正文</span>
              <span class="arrow">{{ textMenuExpanded ? '▼' : '▶' }}</span>
            </div>
            <transition name="submenu">
              <ul v-if="textMenuExpanded" class="sub-nav">
                <li v-for="chapter in chapters" :key="chapter.id"
                  :class="{ active: currentChapterId === chapter.id }" @click="selectChapter(chapter.id)">
                  <span class="chapter-index">{{ formatChapterIndex(chapter.title) }}</span>
                  <span class="chapter-name">{{ formatChapterName(chapter.title) }}</span>
                </li>
              </ul>
            </transition>
          </li>
        </ul>
        <div class="nav-footer">
          <div class="timber-grain"></div>
          <p>榫卯结构 · 匠心传承</p>
          <div class="stamp">钦定</div>
        </div>
      </div>

      <!-- 右侧主内容区 -->
      <div class="content-area">
        <transition name="fade-slide" mode="out-in">
          <div :key="activeTab" class="content-card">
            <!-- 作者生平（含画像） -->
            <div v-if="activeTab === 'author'">
              <div class="author-header">
                <h2><span class="deco-icon"><img src="./images/ico/个人信息.png" alt="" /></span> 李诫 · 将作监奇才</h2>
                <div class="header-decoration"></div>
              </div>
              <div class="author-biography">
                <div class="author-text">
                  <div class="scrollable-text">
                    <p><span class="drop-cap">李</span>诫（1035年－1110年），字明仲，北宋郑州管城县（今河南新郑）人。出身官宦世家，自幼聪慧，精于算数、地理、建筑。曾任将作监主簿、少监，官至将作监，总领宫廷建筑营缮事务。</p>
                    <p>他“性聪慧，博学多艺”，不仅主持了五王邸、辟雍、尚书省、朱雀门等重大工程，更倾十余年心血编修《营造法式》。书中“材份制”为中国古代建筑模数化的里程碑，其科学性与系统性领先世界数百年。</p>
                    <p>李诫还擅长绘画、书法、篆刻，著有《续山海经》《琵琶录》等，可惜多已失传。唯有《营造法式》穿越近千年，成为解读中国古建筑密码的钥匙。</p>
                    <div class="quote-block">
                      <span class="quote-mark">“</span>
                      <div class="quote-text">其书所言虽止艺事，而能考证经传，参会众说，以合于古者饬材庀事之义。</div>
                      <div class="quote-source">——摘自《四库全书总目提要·营造法式》</div>
                    </div>
                    <div class="quote-block">
                      <span class="quote-mark">“</span>
                      <div class="quote-text">陈振孙《直斋书录解题》以为“远出喻皓木经之上”。今学界更誉其为“整个中古时期世界上最完备的建筑学专著”。</div>
                      <div class="quote-source">——摘自陈振孙《直斋书录解题》</div>
                    </div>
                  </div>
                </div>
                <div class="author-portrait">
                  <div class="portrait-frame">
                    <img src="./images/c4d1259890061ec90feb1fa31c8dd7b3.png" alt="李诫画像" class="portrait-img" />
                  </div>
                  <div class="portrait-caption">李诫像（据古籍摹绘）</div>
                  <div class="portrait-seal">诫印</div>
                </div>
              </div>
            </div>

            <!-- 书籍背景与评价 -->
            <div v-if="activeTab === 'background'">
              <h2><span class="deco-icon"><img src="./images/ico/书籍.png" alt="" /></span> 背景</h2>
              <div class="scrollable-text">
                <p><span class="drop-cap">北</span>宋崇宁二年（1103年），宋徽宗下诏刊行《营造法式》，旨在统一全国官式建筑的标准，杜绝工程舞弊。书中系统总结了唐宋以来的建筑经验，以“材、分°”模数制为核心，将建筑构件、用工、用料全部数字化。</p>
                <p>然而，此书曾一度失传。直至民国年间，朱启钤先生创办“中国营造学社”，在江南图书馆发现手抄本，梁思成、刘敦桢等学者如获至宝，历经数年整理、注释，终使这部“奇书”重见天日。</p>
                <div class="comment">
                  <div class="comment-icon"></div>
                  <div class="comment-content">
                    <strong>梁思成</strong>：“《营造法式》是中国建筑之文法课本，其科学价值可与《几何原本》媲美。”
                  </div>
                </div>
                <div class="comment">
                  <div class="comment-icon"></div>
                  <div class="comment-content">
                    <strong>当代学者</strong>：“一部《法式》，半部中国建筑史。它不仅是技术手册，更是宋代美学与工程的最高结晶。”
                  </div>
                </div>
                <p>如今，借助数字技术，我们得以将这部近千年古籍以互动方式呈现——每一次点击，都是与李诫的隔空对话。</p>
              </div>

              <!-- ★★★ 读者留言区 · 长河留声 ★★★ -->
              <div class="message-river">
                <div class="river-header">
                  <span class="river-icon"><img src="./images/ico/icon-six.png" alt="" /></span>
                  <h3>长河留声 </h3>
                  <span class="river-line"></span>
                </div>
                <div class="message-form">
                  <input
                    v-model="messageNickname"
                    type="text"
                    placeholder="留名（可不填）"
                    maxlength="20"
                    class="nickname-input"
                  />
                  <div class="content-input-wrapper">
                    <textarea
                      v-model="messageContent"
                      placeholder="写下您的感悟…（最多200字）"
                      maxlength="200"
                      rows="2"
                      class="content-input"
                      @keydown.enter.prevent="submitMessage"
                    ></textarea>
                    <button class="send-btn" @click="submitMessage" :disabled="!messageContent.trim() || sending">
                      <span v-if="!sending">✎ 留 言</span>
                      <span v-else>⋯ 发送中</span>
                    </button>
                  </div>
                </div>
                <div class="messages-stream" ref="messageStream">
                  <div v-if="messages.length === 0 && !loadingMessages" class="empty-message">
                    <span><img src="./images/ico/7拟稿纸-07.png" alt="" class="empty-icon-img" /></span> 暂无留言，不妨留下第一笔…
                  </div>
                  <div v-else class="message-items">
                    <div
                      v-for="(msg, index) in messages"
                      :key="msg.id"
                      class="message-item"
                      :style="{ animationDelay: (index * 0.05) + 's' }"
                    >
                      <span class="msg-nick">{{ msg.nickname }}</span>
                      <span class="msg-colon">：</span>
                      <span class="msg-content">{{ msg.content }}</span>
                      <span class="msg-time">{{ msg.timeAgo }}</span>
                    </div>
                  </div>
                </div>
                <div class="river-footer">
                  <button class="refresh-btn" @click="fetchMessages" :disabled="loadingMessages">
                    <span>⟳</span> {{ loadingMessages ? '载入中...' : '刷新长河' }}
                  </button>
                  <span class="message-count">共 {{ messages.length }} 条寄语</span>
                </div>
              </div>
              <!-- ★★★ 留言区结束 ★★★ -->
            </div>

            <!-- ★ 独立词云卡片 · 使用丹青词云组件 ★ -->
            <div v-if="activeTab === 'wordcloud'">
              <h2><span class="deco-icon"></span> 高频词云</h2>
              <div class="wordcloud-card">
                <DanmakuCloud :containerHeight="520" />
              </div>
              <p class="wordcloud-note">
                <span><img src="./images/ico/路径.png" alt="" class="inline-icon" /> 丹青谱色 | 重绘云图 <img src="./images/ico/路径.png" alt="" class="inline-icon" /></span>
              </p>
            </div>

            <!-- 正文（动态章节 + sections） -->
            <div v-if="activeTab === 'text'">
              <div class="chapter-header">
                <div class="chapter-title-wrap">
                  <h2><span class="deco-icon"><img src="./images/ico/竹简.png" alt="" /></span> {{ currentChapterTitle }}</h2>
                  <div class="chapter-breadcrumb">
                    <span class="breadcrumb-item">营造法式</span>
                    <span class="breadcrumb-sep">›</span>
                    <span class="breadcrumb-item active">{{ currentChapterShortName }}</span>
                  </div>
                </div>
                <button class="toggle-chapter-btn" @click="showAllChapters = !showAllChapters">
                  <span>{{ showAllChapters ? '收起' : '浏览' }}</span>
                  <span class="btn-icon">{{ showAllChapters ? '▲' : '▼' }}</span>
                </button>
              </div>
              <transition name="collapse">
                <div v-if="showAllChapters" class="chapter-list">
                  <div v-for="chapter in chapters" :key="chapter.id"
                    class="chapter-item" :class="{ active: currentChapterId === chapter.id }"
                    @click="selectChapter(chapter.id)">
                    <span class="chapter-num">{{ formatChapterIndex(chapter.title) }}</span>
                    <span class="chapter-text">{{ formatChapterName(chapter.title) }}</span>
                  </div>
                </div>
              </transition>

              <div v-if="sectionsLoading" class="loading-skeleton">
                <div class="skeleton-block shimmer"></div>
                <div class="skeleton-block shimmer"></div>
                <div class="skeleton-block shimmer"></div>
              </div>
              <div v-else-if="currentSections.length === 0" class="empty-tip">
                <div class="empty-icon"><img src="./images/ico/刷新.png" alt="" /></div>
                <p>暂无正文内容，待后续补充。</p>
              </div>
              <div v-else class="chapter-content">
                <div v-for="(section, idx) in currentSections" :key="section.id"
                  class="section-card" :class="{ 'section-first': idx === 0 }">
                  <div class="section-corner"></div>
                  <h3 v-if="section.title" class="section-title">
                    <span class="title-marker">◆</span>
                    {{ section.title }}
                  </h3>
                  <div v-if="section.original" class="section original-section">
                    <div class="section-header">
                      <span class="section-icon"><img src="./images/ico/竹简.png" alt="" /></span>
                      <h4>原文</h4>
                      <span class="section-line"></span>
                    </div>
                    <p class="classic-text">{{ section.original }}</p>
                  </div>
                  <div v-if="section.explanation" class="section explanation-section">
                    <div class="section-header">
                      <span class="section-icon"><img src="./images/ico/文书卷.png" alt="" /></span>
                      <h4>题解</h4>
                      <span class="section-line"></span>
                    </div>
                    <p>{{ section.explanation }}</p>
                  </div>
                  <div v-if="section.translation" class="section translation-section">
                    <div class="section-header">
                      <span class="section-icon"><img src="./images/ico/古风物件，中国风，铜钱，圆形方孔钱2.png" alt="" /></span>
                      <h4>译文</h4>
                      <span class="section-line"></span>
                    </div>
                    <p>{{ section.translation }}</p>
                  </div>
                </div>
                <div class="interact-note">
                  <span class="handwrite"><img src="./images/ico/7拟稿纸-07.png" alt="" class="handwrite-icon" /> {{ currentPoem }}</span>
                  
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 底部 Footer -->
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-decoration"></div>
        <p class="footer-main-title">木览青数——中国古代建筑成就·中华优秀传统文化</p>
        <div class="footer-seal">
          <div class="seal-circle" @click="showEasterEgg"><span>御览</span></div>
        </div>
        <p class="footer-copyright">© 2026 木览青数. 基于《营造法式》体系呈现.</p>
      </div>
      <transition name="fade">
        <div v-if="easterEggVisible" class="easter-egg-gif" @click="hideEasterEgg">
          <img src="./images/BCC22ACF26B77289572181F1D2CDCBC2.gif" alt="彩蛋" />
        </div>
      </transition>
    </footer>

    <!-- 智能悬浮菜单（仅正文阅读时显示） -->
    <div v-if="activeTab === 'text' && currentSections.length > 0"
         class="floating-menu"
         ref="floatingMenuRef"
         :class="{ 'is-dragging': isDragging, 'is-expanded': menuExpanded }"
         :style="floatingStyle"
         @pointerdown.prevent="onPointerDown">
      <div class="drag-ring" v-if="isDragging || hasMoved"></div>
      <img :src="menuIcon" class="menu-icon" v-show="!menuExpanded" />
      <div class="menu-actions" v-show="menuExpanded">
        <div class="action-btn prev-btn" @click.stop="goPrevChapter" title="上一章">
          <img :src="leftArrow" alt="上一章" />
        </div>
        <div class="action-btn top-btn" @click.stop="goTop" title="返回顶部">
          <img :src="goTopIcon" alt="返回顶部" />
        </div>
        <div class="action-btn next-btn" @click.stop="goNextChapter" title="下一章">
          <img :src="rightArrow" alt="下一章" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, reactive, nextTick } from 'vue'
import axios from 'axios'
import DanmakuCloud from './DanmakuCloud.vue'
import bgImage from './images/afeb3710c9eab8728f22737ddad030b3.png'
import menuIcon from './images/ico/模型工具.png'
import leftArrow from './images/ico/向左-双箭头.png'
import rightArrow from './images/ico/向右-双箭头.png'
import goTopIcon from './images/ico/返回顶部.png'

const emit = defineEmits(['close'])

const API_BASE_URL = 'http://localhost:8081/api'
const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 10000 })

const activeTab = ref('author')
const textMenuExpanded = ref(true)
const showAllChapters = ref(false)
const chapters = ref([])
const currentChapterId = ref(null)
const currentSections = ref([])
const sectionsLoading = ref(false)

const messageNickname = ref('')
const messageContent = ref('')
const messages = ref([])
const loadingMessages = ref(false)
const sending = ref(false)
const messageStream = ref(null)
const containerRef = ref(null)

const easterEggVisible = ref(false)
let eggTimer = null

const showEasterEgg = () => {
  if (eggTimer) clearTimeout(eggTimer)
  easterEggVisible.value = true
  eggTimer = setTimeout(() => {
    easterEggVisible.value = false
    eggTimer = null
  }, 3000)
}
const hideEasterEgg = () => {
  if (eggTimer) clearTimeout(eggTimer)
  eggTimer = null
  easterEggVisible.value = false
}

const craftPoems = [
  "巧夺天工木，匠心透千年。",
  "一榫一卯合，天地自分明。",
  "削木为梁柱，撑起万钧穹。",
  "纹理藏岁月，刀痕见精神。",
  "不施丹青彩，木色自清华。",
  "刨花飞如雪，墨线定乾坤。",
  "栋梁须直取，曲木作承托。",
  "榫头入卯眼，阴阳两相宜。",
  "材分八等定，屋宇九重高。",
  "规矩绳墨下，方圆自天成。",
  "斫轮老手在，大匠运斤风。",
  "如鸟斯革翼，如翚斯飞檐。",
  "上栋下宇间，风雨不能侵。",
  "梓人传心法，法式照汗青。"
]
const currentPoem = ref('')
const refreshPoem = () => {
  const randomIndex = Math.floor(Math.random() * craftPoems.length)
  currentPoem.value = craftPoems[randomIndex]
}

const currentChapterTitle = computed(() => {
  if (!currentChapterId.value) return '正文'
  const chapter = chapters.value.find(c => c.id === currentChapterId.value)
  return chapter ? chapter.title : '正文'
})
const currentChapterShortName = computed(() => {
  const title = currentChapterTitle.value
  if (title.includes('·')) return title.split('·')[1] || title
  return title.length > 20 ? title.slice(0, 18) + '…' : title
})

const formatChapterIndex = (title) => {
  const match = title.match(/第(\d+)章/)
  return match ? `卷${match[1]}` : '卷'
}
const formatChapterName = (title) => {
  const parts = title.split(/\s+/)
  return parts[parts.length - 1] || title
}

const loadChapters = async () => {
  try {
    const response = await apiClient.get('/chapters')
    chapters.value = response.data.sort((a, b) => a.sort - b.sort)
    if (chapters.value.length > 0 && !currentChapterId.value) {
      currentChapterId.value = chapters.value[0].id
      await loadSections(currentChapterId.value)
    }
  } catch (error) {
    console.error('加载章节列表失败:', error)
  }
}

const loadSections = async (chapterId) => {
  if (!chapterId) return
  sectionsLoading.value = true
  try {
    const response = await apiClient.get(`/sections/${chapterId}`)
    currentSections.value = response.data.sort((a, b) => a.sort - b.sort)
    refreshPoem()
  } catch (error) {
    console.error('加载正文失败:', error)
    currentSections.value = []
  } finally {
    sectionsLoading.value = false
  }
}

const selectChapter = async (chapterId) => {
  if (currentChapterId.value === chapterId) return
  currentChapterId.value = chapterId
  await loadSections(chapterId)
  if (activeTab.value !== 'text') activeTab.value = 'text'
  if (window.innerWidth <= 768) showAllChapters.value = false
}

const fetchMessages = async () => {
  loadingMessages.value = true
  try {
    const res = await apiClient.get('/messages/recent', { params: { limit: 50 } })
    messages.value = res.data
  } catch (e) {
    console.error('获取留言失败', e)
    messages.value = []
  } finally {
    loadingMessages.value = false
  }
}

const submitMessage = async () => {
  const content = messageContent.value.trim()
  if (!content) return
  sending.value = true
  try {
    const params = new URLSearchParams()
    params.append('nickname', messageNickname.value.trim() || '无名匠')
    params.append('content', content)
    await apiClient.post('/messages', params)
    messageContent.value = ''
    await fetchMessages()
    if (messageStream.value) {
      setTimeout(() => {
        messageStream.value.scrollTop = messageStream.value.scrollHeight
      }, 100)
    }
  } catch (e) {
    console.error('留言失败', e)
    alert('留言失败，请稍后重试')
  } finally {
    sending.value = false
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'text' && chapters.value.length && !currentChapterId.value) {
    currentChapterId.value = chapters.value[0].id
    loadSections(currentChapterId.value)
  }
  if (tab === 'background') {
    fetchMessages()
  }
}

const toggleTextMenu = () => { textMenuExpanded.value = !textMenuExpanded.value }
const closePage = () => { emit('close') }
const handleKeydown = (e) => { if (e.key === 'Escape') closePage() }

// ========== 悬浮菜单逻辑 ==========
const floatingMenuRef = ref(null)
const menuExpanded = ref(false)
const isDragging = ref(false)
const hasMoved = ref(false)
const menuPos = reactive({ x: window.innerWidth - 80, y: window.innerHeight * 0.7 })
const dragOffset = ref({ x: 0, y: 0 })
const startPos = { x: 0, y: 0 }

const resetFloatingMenu = () => {
  menuPos.x = window.innerWidth - 80
  menuPos.y = window.innerHeight * 0.7
  menuExpanded.value = false
  isDragging.value = false
  hasMoved.value = false
  dragOffset.value = { x: 0, y: 0 }
}

watch(activeTab, (newTab, oldTab) => {
  if (newTab === 'text' && oldTab !== 'text') {
    nextTick(() => resetFloatingMenu())
  }
})

const floatingStyle = computed(() => {
  if (isDragging.value) {
    return {
      left: menuPos.x + 'px',
      top: menuPos.y + 'px',
      transform: `translate(${dragOffset.value.x}px, ${dragOffset.value.y}px)`,
      cursor: 'grabbing'
    }
  }
  return {
    left: menuPos.x + 'px',
    top: menuPos.y + 'px',
    transform: 'translate(0, 0)',
    cursor: 'pointer'
  }
})

const adjustMenuPosition = () => {
  if (!floatingMenuRef.value || !menuExpanded.value) return
  const menuEl = floatingMenuRef.value
  const actualWidth = menuEl.scrollWidth || menuEl.getBoundingClientRect().width
  let newX = menuPos.x
  if (newX + actualWidth > window.innerWidth - 10) newX = window.innerWidth - actualWidth - 10
  if (newX < 10) newX = 10
  menuPos.x = newX
}

watch(menuExpanded, async (val) => {
  if (val) {
    await nextTick()
    adjustMenuPosition()
  }
})

const onPointerDown = (e) => {
  if (e.target.closest('.action-btn')) return
  e.preventDefault()
  const point = e.touches ? e.touches[0] : e
  startPos.x = point.clientX
  startPos.y = point.clientY
  hasMoved.value = false
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

const onPointerMove = (e) => {
  const point = e.touches ? e.touches[0] : e
  const dx = point.clientX - startPos.x
  const dy = point.clientY - startPos.y
  if (!hasMoved.value && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
    hasMoved.value = true
    isDragging.value = true
  }
  if (isDragging.value) dragOffset.value = { x: dx, y: dy }
}

const onPointerUp = () => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  if (isDragging.value) {
    menuPos.x += dragOffset.value.x
    menuPos.y += dragOffset.value.y
    menuPos.x = Math.min(Math.max(menuPos.x, 20), window.innerWidth - 60)
    menuPos.y = Math.min(Math.max(menuPos.y, 20), window.innerHeight - 60)
    isDragging.value = false
    dragOffset.value = { x: 0, y: 0 }
    if (menuExpanded.value) adjustMenuPosition()
  } else if (!hasMoved.value) {
    menuExpanded.value = !menuExpanded.value
  }
  hasMoved.value = false
}

const getCurrentChapterIndex = () => {
  if (!chapters.value.length || !currentChapterId.value) return -1
  return chapters.value.findIndex(c => c.id === currentChapterId.value)
}

const goPrevChapter = () => {
  if (activeTab.value !== 'text') return
  const idx = getCurrentChapterIndex()
  if (idx > 0) selectChapter(chapters.value[idx - 1].id)
  else alert('已经是第一章')
}

const goNextChapter = () => {
  if (activeTab.value !== 'text') return
  const idx = getCurrentChapterIndex()
  if (idx < chapters.value.length - 1) selectChapter(chapters.value[idx + 1].id)
  else alert('已经是最后一章')
}

const goTop = () => {
  if (containerRef.value) containerRef.value.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  await loadChapters()
  refreshPoem()
  if (activeTab.value === 'background') fetchMessages()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (eggTimer) clearTimeout(eggTimer)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})
</script>

<style scoped>
/* 彩蛋样式 */
.easter-egg-gif { position: fixed; bottom: 120px; right: 40px; width: 200px; z-index: 1000; cursor: pointer; border-radius: 16px; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5); border: 3px solid #d4b886; background: #2c1e12; padding: 4px; transition: transform 0.2s; }
.easter-egg-gif:hover { transform: scale(1.02); }
.easter-egg-gif img { width: 100%; height: auto; display: block; border-radius: 12px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.building-method-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  /* 多背景：图片在上层，木纹纹理在下层，最底层是底色 */
  background-image:
    var(--bg-image),
    radial-gradient(circle at 15% 30%, rgba(90, 60, 40, 0.4) 1.5%, transparent 2%),
    repeating-linear-gradient(45deg, rgba(80, 55, 35, 0.1) 0px, rgba(80, 55, 35, 0.1) 2px, transparent 2px, transparent 8px);
  background-size: cover, 40px 40px, 12px 12px;
  background-position: center, 0 0, 0 0;
  background-repeat: no-repeat, repeat, repeat;
  background-attachment: fixed, scroll, scroll;
  background-color: #5c3e2b; /* 最底层底色 */
  margin: 0;
  padding: 0;
  font-family: '宋体', 'SimSun', 'Georgia', 'Times New Roman', serif;
  color: #2c221b;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  scroll-behavior: smooth;
}
.building-method-container::-webkit-scrollbar {
  width: 12px;
  background: #e8d9c4;
  border-radius: 6px;
}
.building-method-container::-webkit-scrollbar-track {
  background: #f0e6d8;
  border-radius: 6px;
  border: 1px solid #c8aa7a;
}
.building-method-container::-webkit-scrollbar-thumb {
  background: #8b694a;
  border-radius: 6px;
  border: 2px solid #d4b886;
}
.building-method-container::-webkit-scrollbar-thumb:hover {
  background: #b87c4f;
}

.detail-header {
  background: rgba(30, 20, 12, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 32px;
  border-bottom: 1px solid #d4b886;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  color: #fef0d8;
  flex-wrap: wrap;
  z-index: 10;
  flex-shrink: 0;
  position: relative;
  width: 100%;
}
.back-btn { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.95rem; background: rgba(255, 245, 220, 0.15); padding: 6px 16px; border-radius: 40px; transition: all 0.25s ease; border: 1px solid rgba(212, 184, 134, 0.3); }
.back-btn:hover { background: rgba(255, 245, 220, 0.3); transform: translateX(-3px); border-color: #d4b886; }
.header-title { font-size: 1.4rem; letter-spacing: 4px; font-weight: 500; text-shadow: 1px 1px 2px rgba(0,0,0,0.4); font-family: 'Georgia', '宋体', serif; }
.title-decoration { font-size: 1.6rem; font-weight: normal; color: #d4b886; }
.subtitle { font-size: 0.8rem; letter-spacing: 2px; margin-left: 8px; opacity: 0.8; }
.placeholder { width: 100px; }
.main-layout { display: flex; gap: 28px; padding: 28px 36px; flex: 1; position: relative; z-index: 1; }
.nav-sidebar {
  width: 300px;
  background: linear-gradient(165deg, rgba(45, 32, 22, 0.92) 0%, rgba(35, 24, 16, 0.96) 100%);
  backdrop-filter: blur(12px);
  border-radius: 32px;
  padding: 24px 16px;
  color: #fdf3e0;
  border: 1px solid rgba(200, 170, 122, 0.5);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  height: fit-content;
  position: relative;
  overflow: hidden;
}
.nav-sidebar::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.05"><path d="M20,20 L80,20 M20,40 L80,40 M20,60 L80,60 M20,80 L80,80" stroke="%23d4b886" stroke-width="0.5"/><circle cx="50" cy="50" r="8" stroke="%23d4b886" fill="none" stroke-width="0.5"/></svg>') repeat; pointer-events: none; }
.nav-title { text-align: center; margin-bottom: 24px; }
.title-chinese { font-size: 1.8rem; font-family: 'Georgia', serif; letter-spacing: 8px; background: linear-gradient(135deg, #e8d5b5, #c8aa7a); -webkit-background-clip: text; background-clip: text; color: transparent; }
.title-seal { position: absolute; right: 20px; top: -5px; font-size: 0.7rem; border: 1px solid #c8aa7a; padding: 2px 6px; border-radius: 4px; opacity: 0.7; transform: rotate(15deg); }
.nav-list { list-style: none; padding: 0; margin: 0; }
.nav-list > li { margin: 8px 0; border-radius: 48px; cursor: pointer; transition: all 0.2s ease; }
.nav-list > li:not(.has-submenu) { display: flex; align-items: center; gap: 12px; padding: 10px 18px; }
.nav-list > li:not(.has-submenu):hover { background: rgba(200, 170, 122, 0.25); transform: translateX(4px); }
.nav-list > li.active:not(.has-submenu) { background: linear-gradient(135deg, #b87c4f, #9b623b); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
.has-submenu { padding: 0 !important; }
.nav-parent { display: flex; justify-content: space-between; align-items: center; padding: 10px 18px; border-radius: 48px; cursor: pointer; transition: 0.2s; }
.nav-parent:hover { background: rgba(200, 170, 122, 0.2); }
.nav-parent.expanded { background: rgba(200, 170, 122, 0.15); border-radius: 48px 48px 20px 20px; }
.arrow { font-size: 0.7rem; opacity: 0.8; }
.sub-nav { list-style: none; padding-left: 20px; margin: 8px 0 12px 0; max-height: 400px; overflow-y: auto; }
.sub-nav li { padding: 8px 16px; margin: 4px 8px; font-size: 0.85rem; border-radius: 32px; cursor: pointer; display: flex; gap: 8px; align-items: baseline; transition: all 0.15s; }
.sub-nav li:hover { background: rgba(200, 170, 122, 0.3); transform: translateX(4px); }
.sub-nav li.active { background: #b87c4f; color: white; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); }
.chapter-index { font-size: 0.7rem; opacity: 0.7; font-family: monospace; }
.chapter-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nav-footer { text-align: center; margin-top: 32px; font-size: 0.7rem; border-top: 1px solid rgba(200, 170, 122, 0.4); padding-top: 20px; }
.timber-grain { height: 2px; background: linear-gradient(90deg, transparent, #d4b886, transparent); margin-bottom: 12px; }
.stamp { display: inline-block; margin-top: 12px; font-size: 0.65rem; border: 1px solid #c8aa7a; padding: 2px 8px; border-radius: 2px; opacity: 0.6; transform: rotate(-5deg); }
.content-area {
  flex: 3;
  background: #fef8ef;
  background-image: radial-gradient(circle at 20% 40%, rgba(200, 170, 120, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  border-radius: 36px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  padding: 28px 36px;
  border: 1px solid #e6d5b3;
}
.content-card { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
h2 { font-size: 1.8rem; border-left: 5px solid #b87c4f; padding-left: 20px; margin: 0 0 20px 0; color: #5c3e2b; display: flex; align-items: center; gap: 12px; font-weight: normal; letter-spacing: 2px; }
/* 图标图片样式 */
.deco-icon img { width: 1.6rem; height: 1.6rem; object-fit: contain; vertical-align: middle; }
.river-icon img { width: 1.8rem; height: 1.8rem; object-fit: contain; vertical-align: middle; }
.inline-icon { width: 1em; height: 1em; object-fit: contain; vertical-align: middle; margin: 0 4px; }
.empty-icon-img { width: 3rem; height: 3rem; object-fit: contain; vertical-align: middle; margin-bottom: 8px; }
.section-icon img { width: 1.2rem; height: 1.2rem; object-fit: contain; vertical-align: middle; }
.empty-icon img { width: 3rem; height: 3rem; object-fit: contain; }
.handwrite-icon { width: 1em; height: 1em; object-fit: contain; vertical-align: middle; margin-right: 4px; }
.author-biography { display: flex; gap: 40px; margin-top: 16px; align-items: flex-start; }
.author-text { flex: 2; }
.author-portrait { flex: 1; text-align: center; background: rgba(200, 170, 120, 0.12); border-radius: 32px; padding: 24px 16px; backdrop-filter: blur(2px); border: 1px solid rgba(200, 170, 120, 0.3); position: relative; }
.portrait-frame { background: #d4b88620; border-radius: 24px; padding: 8px; display: inline-block; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
.portrait-img { max-width: 100%; border-radius: 16px; border: 2px solid #d4b886; }
.portrait-caption { margin-top: 16px; font-size: 0.75rem; color: #8b694a; letter-spacing: 2px; }
.portrait-seal { position: absolute; bottom: 16px; right: 20px; font-size: 0.7rem; border: 1px solid #c8aa7a; padding: 2px 6px; border-radius: 2px; opacity: 0.5; transform: rotate(-8deg); }
.drop-cap { font-size: 2.4rem; float: left; line-height: 0.8; padding-right: 8px; font-weight: bold; color: #b87c4f; font-family: 'Georgia', serif; }
.scrollable-text { line-height: 1.75; font-size: 1rem; color: #2f241b; }
.quote-block { display: flex; flex-direction: column; gap: 8px; background: #f2e5d2; padding: 18px 24px; border-radius: 48px; margin: 28px 0; font-style: italic; position: relative; font-size: 1rem; box-shadow: inset 0 0 0 1px #fff8, 0 4px 12px rgba(0,0,0,0.08); border-left: 4px solid #b87c4f; }
.quote-text { font-style: italic; line-height: 1.7; text-align: justify; padding-left: 8px; }
.quote-source { text-align: right; font-size: 0.8rem; color: #8b694a; letter-spacing: 1px; margin-top: 4px; border-top: 1px dashed rgba(200, 170, 120, 0.3); padding-top: 6px; align-self: flex-end; }
.quote-mark { font-size: 2.8rem; font-family: serif; opacity: 0.4; margin-right: 8px; float: left; line-height: 0.8; }
.comment { background: #e8d9c4; border-radius: 24px; padding: 16px 24px; margin: 24px 0; display: flex; gap: 16px; align-items: flex-start; border-left: 5px solid #b87c4f; }
.comment-icon { font-size: 1.5rem; }
.comment-content { flex: 1; line-height: 1.6; }
.wordcloud-card { background: rgba(250, 245, 235, 0.5); border-radius: 36px; padding: 8px; margin: 16px 0; border: 1px solid #dccbb8; box-shadow: inset 0 2px 8px rgba(0,0,0,0.02), 0 10px 20px -8px rgba(80, 50, 30, 0.15); backdrop-filter: blur(2px); }
.wordcloud-note { text-align: center; font-size: 0.85rem; color: #6b4f37; margin-top: 16px; letter-spacing: 3px; font-family: '华文楷体', 'KaiTi', serif; opacity: 0.8; }
.chapter-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; margin-bottom: 20px; border-bottom: 1px dashed #d4b886; padding-bottom: 16px; }
.chapter-title-wrap h2 { margin-bottom: 6px; }
.chapter-breadcrumb { font-size: 0.75rem; color: #8b694a; margin-left: 36px; }
.breadcrumb-item { cursor: default; }
.breadcrumb-sep { margin: 0 6px; }
.toggle-chapter-btn { background: #b87c4f; border: none; color: white; padding: 8px 20px; border-radius: 40px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
.toggle-chapter-btn:hover { background: #9b623b; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.25); }
.chapter-list { background: rgba(200, 170, 120, 0.15); border-radius: 28px; padding: 16px 20px; margin: 16px 0 24px; display: flex; flex-wrap: wrap; gap: 12px; backdrop-filter: blur(2px); }
.chapter-item { background: #fef0e0; padding: 8px 20px; border-radius: 40px; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: baseline; gap: 8px; font-size: 0.85rem; border: 1px solid transparent; }
.chapter-item:hover { background: #e8d5b5; transform: translateY(-2px); border-color: #b87c4f; }
.chapter-item.active { background: #b87c4f; color: white; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); border-color: #d4b886; }
.chapter-num { font-size: 0.7rem; opacity: 0.7; }
.section-card { margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #e0d0b8; position: relative; }
.section-card.section-first { border-bottom: none; }
.section-corner { position: absolute; top: 0; left: 0; width: 30px; height: 30px; border-top: 2px solid #d4b886; border-left: 2px solid #d4b886; opacity: 0.4; pointer-events: none; }
.section-title { font-size: 1.3rem; color: #7a5a42; margin: 0 0 20px 0; padding-left: 16px; display: flex; align-items: center; gap: 12px; }
.title-marker { color: #b87c4f; font-size: 1rem; }
.section { margin-bottom: 28px; }
.section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; border-bottom: 1px solid #e8d5b5; padding-bottom: 6px; }
.section-icon { font-size: 1.2rem; }
.section-header h4 { font-size: 1.05rem; color: #8b694a; margin: 0; font-weight: 600; letter-spacing: 1px; }
.section-line { flex: 1; height: 1px; background: linear-gradient(90deg, #d4b886, transparent); }
.classic-text { font-family: 'Georgia', '宋体', serif; line-height: 1.85; background: #faf5ea; padding: 20px 28px; border-radius: 28px; white-space: pre-line; font-size: 0.95rem; border: 1px solid #efe0cc; box-shadow: inset 0 1px 4px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.02); }
.original-section .classic-text { background: #f7f0e2; }
.explanation-section p, .translation-section p { line-height: 1.7; text-align: justify; }
.interact-note { text-align: center; margin-top: 48px; font-size: 0.85rem; color: #b87c4f; background: rgba(200, 170, 120, 0.2); border-radius: 60px; padding: 12px 24px; display: inline-block; width: auto; margin-left: auto; margin-right: auto; backdrop-filter: blur(2px); }
.handwrite { font-style: italic; letter-spacing: 2px; }
.note-seal { margin-left: 12px; font-size: 0.7rem; border: 1px solid #c8aa7a; padding: 2px 8px; border-radius: 20px; }
.loading-skeleton { margin-top: 32px; }
.skeleton-block { height: 140px; background: linear-gradient(90deg, #f0e6d8 25%, #e8d9c4 50%, #f0e6d8 75%); background-size: 200% 100%; border-radius: 28px; margin-bottom: 24px; }
.shimmer { animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.empty-tip { text-align: center; padding: 80px 20px; color: #8b694a; font-size: 1.1rem; }
.empty-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.6; }
.site-footer {
  width: 100%;
  border-top: 1px solid rgba(200, 170, 122, 0.4);
  background: rgba(30, 20, 12, 0.7);
  backdrop-filter: blur(8px);
  padding: 20px 16px;
  margin-top: auto;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.footer-container { max-width: 1200px; margin: 0 auto; text-align: center; position: relative; }
.footer-decoration { height: 2px; width: 80px; background: #d4b886; margin: 0 auto 16px; }
.footer-main-title { font-size: 0.8rem; font-weight: 500; letter-spacing: 4px; color: #fef0d8; text-transform: uppercase; margin-bottom: 16px; }
.footer-seal { display: flex; justify-content: center; margin-bottom: 12px; }
.seal-circle { width: 48px; height: 48px; border-radius: 50%; border: 1.5px solid #d4b886; display: flex; align-items: center; justify-content: center; background: rgba(212, 184, 134, 0.12); color: #d4b886; font-size: 0.7rem; font-weight: bold; letter-spacing: 1px; transform: rotate(-8deg); cursor: pointer; }
.footer-copyright { font-size: 0.65rem; color: #c8aa7a; margin: 0; opacity: 0.7; }
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.25s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateX(15px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-10px); }
.collapse-enter-active, .collapse-leave-active { transition: all 0.2s ease; }
.collapse-enter-from, .collapse-leave-to { opacity: 0; transform: scaleY(0.8); transform-origin: top; }
.submenu-enter-active, .submenu-leave-active { transition: all 0.2s ease; }
.submenu-enter-from, .submenu-leave-to { opacity: 0; transform: translateY(-8px); }

/* 留言区样式 */
.message-river { margin-top: 48px; padding-top: 24px; border-top: 2px dashed #d4b886; }
.river-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.river-icon { font-size: 1.8rem; }
.river-header h3 { font-size: 1.4rem; color: #5c3e2b; margin: 0; font-weight: normal; letter-spacing: 4px; }
.river-line { flex: 1; height: 1px; background: linear-gradient(90deg, #d4b886, transparent); }
.message-form { background: rgba(230, 210, 180, 0.2); border-radius: 28px; padding: 16px 20px; margin-bottom: 28px; border: 1px solid #dccbb8; }
.nickname-input { width: 200px; padding: 10px 18px; border: 1px solid #c8aa7a; border-radius: 40px; background: #fff9f0; font-family: '宋体', serif; font-size: 0.9rem; margin-bottom: 12px; transition: 0.2s; }
.nickname-input:focus { outline: none; border-color: #b87c4f; box-shadow: 0 0 0 3px rgba(184, 124, 79, 0.15); }
.content-input-wrapper { display: flex; gap: 12px; align-items: flex-end; }
.content-input { flex: 1; padding: 12px 18px; border: 1px solid #c8aa7a; border-radius: 24px; background: #fff9f0; font-family: '宋体', serif; font-size: 0.95rem; resize: vertical; min-height: 60px; transition: 0.2s; }
.content-input:focus { outline: none; border-color: #b87c4f; box-shadow: 0 0 0 3px rgba(184, 124, 79, 0.15); }
.send-btn { background: #b87c4f; border: none; color: white; padding: 12px 24px; border-radius: 40px; cursor: pointer; font-size: 0.95rem; font-family: '宋体', serif; letter-spacing: 2px; transition: all 0.2s; white-space: nowrap; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border: 1px solid #d4b886; }
.send-btn:hover:not(:disabled) { background: #9b623b; transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.15); }
.send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.messages-stream { background: rgba(250, 245, 235, 0.4); border-radius: 24px; padding: 16px 8px; max-height: 300px; overflow-y: auto; border: 1px solid #e6d5b3; box-shadow: inset 0 2px 6px rgba(0,0,0,0.02); scroll-behavior: smooth; }
.messages-stream::-webkit-scrollbar { width: 6px; background: #e8d9c4; border-radius: 3px; }
.messages-stream::-webkit-scrollbar-thumb { background: #b87c4f; border-radius: 3px; }
.message-items { display: flex; flex-direction: column; gap: 10px; }
.message-item { background: #fdf3e6; padding: 8px 18px; border-radius: 40px; font-size: 0.9rem; border-left: 4px solid #b87c4f; box-shadow: 0 2px 6px rgba(0,0,0,0.05); animation: floatIn 0.6s ease-out; display: flex; align-items: baseline; flex-wrap: wrap; }
@keyframes floatIn { 0% { opacity: 0; transform: translateX(-12px); } 100% { opacity: 1; transform: translateX(0); } }
.msg-nick { font-weight: bold; color: #7a5a42; margin-right: 4px; }
.msg-colon { margin-right: 6px; color: #b87c4f; }
.msg-content { flex: 1; color: #2c221b; word-break: break-word; }
.msg-time { font-size: 0.7rem; color: #8b694a; margin-left: 12px; opacity: 0.7; white-space: nowrap; }
.empty-message { text-align: center; color: #8b694a; padding: 32px; font-size: 0.95rem; letter-spacing: 2px; }
.river-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
.refresh-btn { background: transparent; border: 1px solid #c8aa7a; color: #5c3e2b; padding: 8px 20px; border-radius: 40px; cursor: pointer; font-size: 0.8rem; font-family: '宋体', serif; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
.refresh-btn:hover { background: rgba(184, 124, 79, 0.1); border-color: #b87c4f; }
.message-count { font-size: 0.75rem; color: #8b694a; letter-spacing: 1px; }

/* 悬浮菜单优化样式 */
.floating-menu {
  position: fixed;
  width: 56px;
  height: 56px;
  background: rgba(139, 110, 70, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 0 2px #d4b886;
  z-index: 1000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-radius 0.3s, width 0.3s, padding 0.3s;
  user-select: none;
  touch-action: none;
}
.floating-menu.is-expanded {
  width: auto;
  border-radius: 32px;
  padding: 0 12px;
  gap: 8px;
}
.menu-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}
.menu-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,245,220,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.action-btn:hover {
  background: #b87c4f;
  transform: scale(1.1);
}
.action-btn img {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 1px 2px #000);
}
/* 拖拽光圈 */
.drag-ring {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border-radius: 50%;
  border: 2px solid #d4b886;
  animation: ringPulse 1.2s ease-out infinite;
  pointer-events: none;
}
@keyframes ringPulse {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(1.5); opacity: 0; }
}
.is-dragging .drag-ring {
  animation: ringPulse 0.8s ease-out infinite;
}

@media (max-width: 900px) {
  .main-layout { flex-direction: column; padding: 20px; }
  .nav-sidebar { width: 100%; margin-bottom: 20px; }
  .content-area { padding: 20px; }
  h2 { font-size: 1.5rem; }
  .author-biography { flex-direction: column; }
  .author-portrait { width: 70%; margin: 0 auto; }
  .sub-nav { max-height: 300px; }
  .chapter-item { font-size: 0.75rem; }
}
@media (max-width: 600px) {
  .detail-header { padding: 10px 16px; }
  .header-title { font-size: 1rem; }
  .back-btn span:last-child { display: none; }
  .back-btn { padding: 6px 12px; }
  .chapter-list { gap: 8px; }
  .chapter-item { padding: 4px 12px; }
  .content-input-wrapper { flex-direction: column; }
  .send-btn { width: 100%; }
  .nickname-input { width: 100%; }
  .floating-menu {
    width: 48px;
    height: 48px;
  }
  .action-btn {
    width: 30px;
    height: 30px;
  }
  .action-btn img {
    width: 20px;
    height: 20px;
  }
}
</style>