<template>
  <div v-if="unit">
    <div class="topbar">
      <router-link to="/vocabulary" class="back">← 返回</router-link>
      <span class="progress-text">{{ index + 1 }} / {{ words.length }}</span>
    </div>
    <h1 class="unit-title">{{ book.title }} · {{ unit.title }}</h1>

    <div v-if="!finished" class="flashcard-area">
      <div class="card flashcard" @click="flipped = !flipped">
        <div class="word">{{ current[0] }}</div>
        <div class="phonetic">{{ current[1] }}</div>
        <button class="icon-btn" @click.stop="speak(current[0])">🔊</button>
        <div v-if="flipped" class="meaning">{{ current[2] }}</div>
        <div v-else class="hint">点击卡片查看释义</div>
        <div v-if="wordState" class="level">
          记忆等级：
          <span v-for="i in 7" :key="i" class="dot" :class="{ on: i <= wordState.level }"></span>
        </div>
      </div>

      <div class="actions">
        <button class="btn danger" @click="answer(false)">不认识</button>
        <button class="btn success" @click="answer(true)">认识</button>
      </div>
    </div>

    <div v-else class="card result">
      <div class="emoji">🎉</div>
      <h2>本单元学习完成！</h2>
      <p>认识 {{ knownCount }} 个 · 需巩固 {{ words.length - knownCount }} 个</p>
      <p class="tip">系统已按遗忘曲线安排复习，记得按时回来复习哦。</p>
      <div class="actions">
        <button class="btn outline" @click="restart">再学一遍</button>
        <router-link to="/vocabulary" class="btn">选择其他单元</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getBook, getUnit, wordKey } from '../data/vocabulary'
import { useProgress } from '../composables/useProgress'
import { useSpeech } from '../composables/useSpeech'

const route = useRoute()
const { markWord, getWordState } = useProgress()
const { speak } = useSpeech()

const book = getBook(route.params.bookId)
const unit = getUnit(route.params.bookId, route.params.unitId)
const words = unit ? unit.words : []

const index = ref(0)
const flipped = ref(false)
const finished = ref(false)
const knownCount = ref(0)

const current = computed(() => words[index.value])
const wordState = computed(() => getWordState(wordKey(book.id, unit.id, current.value)))

function answer(known) {
  markWord(wordKey(book.id, unit.id, current.value), known, 'learn')
  if (known) knownCount.value++
  if (index.value >= words.length - 1) {
    finished.value = true
  } else {
    index.value++
    flipped.value = false
  }
}

function restart() {
  index.value = 0
  flipped.value = false
  finished.value = false
  knownCount.value = 0
}
</script>

<style scoped>
.topbar { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
.back { color: var(--primary); font-size: 14px; }
.progress-text { color: var(--text-light); font-size: 14px; }
.unit-title { font-size: 20px; margin: 12px 0 20px; }
.flashcard-area { max-width: 480px; margin: 0 auto; }
.flashcard {
  text-align: center;
  padding: 48px 24px;
  cursor: pointer;
  user-select: none;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.word { font-size: 34px; font-weight: 700; }
.phonetic { color: var(--text-light); font-size: 16px; }
.meaning { font-size: 18px; color: var(--primary-dark); margin-top: 8px; }
.hint { color: var(--text-light); font-size: 13px; margin-top: 8px; }
.level { margin-top: 12px; font-size: 12px; color: var(--text-light); }
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border);
  margin: 0 2px;
}
.dot.on { background: var(--success); }
.actions { display: flex; gap: 16px; justify-content: center; margin-top: 24px; }
.result { max-width: 480px; margin: 0 auto; text-align: center; padding: 48px 24px; }
.result .emoji { font-size: 48px; }
.result h2 { margin: 12px 0; }
.result p { color: var(--text-light); }
.result .tip { font-size: 13px; margin-top: 8px; }
</style>
