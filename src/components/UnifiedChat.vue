<template>
  <!-- 紧凑模式（嵌入式） -->
  <div v-if="mode === 'embedded'" class="chat-embedded">
    <div class="message-list" ref="messageListRef">
      <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
        <div class="message-avatar">
          <img v-if="msg.role === 'user'" src="./images/ico/个人信息.png" alt="用户" class="avatar-icon" />
          <img v-else src="./images/ico/机器人.png" alt="机器人" class="avatar-icon" />
        </div>
        <div class="message-content" v-html="formatMessage(msg.content)"></div>
      </div>
      <div v-if="loading" class="message assistant">
        <div class="message-avatar">
          <img src="./images/ico/机器人.png" alt="机器人" class="avatar-icon" />
        </div>
        <div class="message-content typing"><span></span><span></span><span></span></div>
      </div>
    </div>
    <div class="input-area">
      <textarea v-model="inputText" @keydown.ctrl.enter="sendMessage" placeholder="输入问题，例如：哪个朝代古建筑最多？山西有多少处？2025年哪省预算最高？" rows="2"></textarea>
      <button @click="sendMessage" :disabled="loading || !inputText.trim()">发送</button>
    </div>
  </div>

  <!-- 模态框模式（放大版） -->
  <Teleport to="body" v-if="mode === 'modal' && visible">
    <div class="chat-modal-overlay" @click.self="handleClose">
      <div class="chat-modal-container">
        <div class="chat-modal-header">
          <span class="chat-modal-title">
            <img src="./images/ico/书籍.png" alt="书籍" class="title-icon" />
            古建筑数据 AI 助手
          </span>
          <span class="chat-modal-close" @click="handleClose">✕</span>
        </div>
        <div class="chat-modal-body">
          <div class="message-list" ref="messageListRef">
            <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
              <div class="message-avatar">
                <img v-if="msg.role === 'user'" src="./images/ico/个人信息.png" alt="用户" class="avatar-icon" />
                <img v-else src="./images/ico/机器人.png" alt="机器人" class="avatar-icon" />
              </div>
              <div class="message-content" v-html="formatMessage(msg.content)"></div>
            </div>
            <div v-if="loading" class="message assistant">
              <div class="message-avatar">
                <img src="./images/ico/机器人.png" alt="机器人" class="avatar-icon" />
              </div>
              <div class="message-content typing"><span></span><span></span><span></span></div>
            </div>
          </div>
          <div class="input-area">
            <textarea v-model="inputText" @keydown.ctrl.enter="sendMessage" placeholder="输入问题，例如：哪个朝代古建筑最多？山西有多少处？2025年哪省预算最高？" rows="2"></textarea>
            <button @click="sendMessage" :disabled="loading || !inputText.trim()">发送</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, inject, watch, nextTick } from 'vue'

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (val) => ['embedded', 'modal'].includes(val)
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'close'])

// 注入全局聊天状态（由父组件提供，实现消息同步）
const messages = inject('chatMessages')
const loading = inject('chatLoading')
const sendMessageGlobal = inject('sendMessage')

const inputText = ref('')
const messageListRef = ref(null)

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || loading.value) return
  inputText.value = ''
  await sendMessageGlobal(text)
  scrollToBottom()
}

const formatMessage = (content) => content.replace(/\n/g, '<br>')

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

// 监听消息变化，自动滚动到底部
watch([messages, loading], () => {
  scrollToBottom()
}, { deep: true })
</script>

<style scoped>
/* ========== 紧凑模式样式 ========== */
.chat-embedded {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fffef7;
  padding: 8px;
  box-sizing: border-box;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: #ede0cc;
}

.avatar-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  border-radius: 50%;
}

.message-content {
  max-width: 70%;
  background-color: #f5f0e1;
  padding: 8px 12px;
  border-radius: 12px;
  color: #4a3520;
  line-height: 1.4;
}

.message.user .message-content {
  background-color: #d9c8b2;
}

.typing span {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #8b6e46;
  margin: 0 2px;
  animation: typing 1.4s infinite;
}

.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-4px); }
}

.input-area {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #ddd0b8;
}

.input-area textarea {
  flex: 1;
  border: 1px solid #c8aa7a;
  border-radius: 8px;
  padding: 8px;
  font-family: inherit;
  resize: none;
  background-color: #fffdf8;
}

.input-area button {
  background-color: #a67c52;
  border: none;
  color: white;
  padding: 0 20px;
  border-radius: 30px;
  cursor: pointer;
  font-weight: bold;
}

.input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========== 模态框模式样式 ========== */
.chat-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 10002;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: '宋体', 'SimSun', serif;
}

.chat-modal-container {
  width: 70vw;
  max-width: 1000px;
  height: 80vh;
  background-color: #fffef7;
  border: 1px solid #8b6e46;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
}

.chat-modal-header {
  background-color: #8b6e46;
  color: white;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.chat-modal-title {
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.chat-modal-close {
  font-size: 24px;
  cursor: pointer;
}

.chat-modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
}

.chat-modal-body .message-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-modal-body .input-area {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #ddd0b8;
}
</style>