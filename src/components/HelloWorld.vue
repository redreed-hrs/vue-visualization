<script setup>
import mainBg from './images/fbc8c393047c3058f8127cf0c16676a0.png'

const emit = defineEmits(['close'])

let startY = 0
let isSwiping = false
const SWIPE_THRESHOLD = 50
let hasClosed = false

const closeSplash = () => {
  if (hasClosed) return
  hasClosed = true
  emit('close')
}

const handleTouchStart = (e) => {
  startY = e.touches[0].clientY
  isSwiping = true
}

const handleTouchEnd = (e) => {
  if (!isSwiping) return
  const endY = e.changedTouches[0].clientY
  const deltaY = startY - endY
  if (deltaY > SWIPE_THRESHOLD) closeSplash()
  isSwiping = false
}

let mouseStartY = 0
let isMouseDown = false
const handleMouseDown = (e) => {
  mouseStartY = e.clientY
  isMouseDown = true
}
const handleMouseUp = (e) => {
  if (!isMouseDown) return
  const deltaY = mouseStartY - e.clientY
  if (deltaY > SWIPE_THRESHOLD) closeSplash()
  isMouseDown = false
}

const handleClick = () => closeSplash()
const handleKeydown = (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    closeSplash()
  }
}

const initEvents = () => {
  window.addEventListener('touchstart', handleTouchStart)
  window.addEventListener('touchend', handleTouchEnd)
  window.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('click', handleClick)
  window.addEventListener('keydown', handleKeydown)
}

const destroyEvents = () => {
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('touchend', handleTouchEnd)
  window.removeEventListener('mousedown', handleMouseDown)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('click', handleClick)
  window.removeEventListener('keydown', handleKeydown)
}

import { onUnmounted } from 'vue'
initEvents()
onUnmounted(() => destroyEvents())
</script>

<template>
  <div class="full-page">
    <div class="bg" :style="{ backgroundImage: `url(${mainBg})` }"></div>
    <div class="mask"></div>

    <div class="content-wrapper">
      <div class="content">
        <h1 class="title">木览青数</h1>
        <p class="subtitle">木览古建余韵，深读营造匠心</p>
        <div class="scroll-tip">
          <span class="tip-text">向上滑动进入</span>
          <div class="arrow-up"></div>
        </div>
      </div>
    </div>

    <div class="bottom-hint">点击任意区域也可进入</div>
  </div>
</template>

<style scoped>
.full-page {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
  z-index: 9999;
  cursor: pointer;
  box-sizing: border-box;
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
  animation: bgParallax 8s ease-in-out infinite alternate;
}

@keyframes bgParallax {
  0% { transform: scale(1.02); }
  100% { transform: scale(1.05); }
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
  z-index: 1;
}

.content-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.content {
  text-align: center;
  color: #fff;
  width: 100%;
  max-width: 700px;
  animation: contentFadeIn 1.2s ease-out;
  margin: 0 auto;
}

@keyframes contentFadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.title {
  font-size: 62px;
  font-weight: 700;
  letter-spacing: 12px;
  margin: 0 0 24px 0;
  padding: 0;
  line-height: 1.2;
  white-space: nowrap;
  background: linear-gradient(120deg, #d4b886, #f8e9d1, #d4b886);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  overflow: visible;
  position: relative;
  z-index: 99;
}

.title::after {
  content: '';
  display: block;
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4b886, transparent);
  margin: 15px auto 0;
  opacity: 0.8;
}

.subtitle {
  font-size: 18px;
  letter-spacing: 2px;
  opacity: 0.95;
  line-height: 1.6;
  margin-bottom: 50px;
  text-shadow: 0 1px 5px rgba(0,0,0,0.4);
  font-weight: 300;
  white-space: nowrap;
}

.scroll-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.tip-text {
  font-size: 14px;
  opacity: 0.85;
  letter-spacing: 1px;
}

.arrow-up {
  width: 24px;
  height: 24px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(-135deg);
  animation: arrowBounce 1.8s infinite ease-in-out;
  opacity: 0.8;
}

@keyframes arrowBounce {
  0% { transform: rotate(-135deg) translateY(0); opacity: 0.4; }
  50% { transform: rotate(-135deg) translateY(-8px); opacity: 1; }
  100% { transform: rotate(-135deg) translateY(0); opacity: 0.4; }
}

.bottom-hint {
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  text-align: center;
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  z-index: 2;
  animation: hintFade 3s ease-in-out infinite alternate;
}

@keyframes hintFade {
  from { opacity: 0.5; }
  to { opacity: 0.8; }
}

@media (max-width: 768px) {
  .title {
    font-size: 44px;
    letter-spacing: 6px;
    line-height: 1.1;
  }
  .subtitle {
    font-size: 15px;
    margin-bottom: 35px;
  }
  .arrow-up {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 38px;
    letter-spacing: 4px;
  }
  .subtitle {
    font-size: 13px;
    padding: 0 5px;
  }
  .bottom-hint {
    font-size: 10px;
    bottom: 15px;
  }
}
</style>