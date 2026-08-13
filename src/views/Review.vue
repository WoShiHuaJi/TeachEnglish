<template>
  <div>
    <h1 class="page-title">每日复习</h1>

    <template v-if="!phoneticsMastered">
      <p class="page-desc">
        音标尚未全部掌握（{{ masteredCount }}/{{ PHONEME_TOTAL }}），今日复习内容为音标练习。
        每个知识点 3 道题，每题只有一次作答机会；错 1 题会随机追加 2 题确认是否为失误，再错则判定未完全掌握，明天重新挑战。
        已掌握的音标会按遗忘曲线（1/2/4/7/15/30 天）到期复测。
      </p>
      <PhoneticsQuiz :key="quizDate" />
    </template>

    <template v-else>
    <p class="page-desc">
      按艾宾浩斯遗忘曲线安排：学习后 1 天、2 天、4 天、7 天、15 天、30 天复习，答错则重新计时。
    </p>

    <div v-if="duePhonemeCount > 0" class="phoneme-review">
      <h2 class="section-title">音标曲线复习（{{ duePhonemeCount }} 个到期）</h2>
      <PhoneticsQuiz :key="'phoneme-' + quizDate" />
    </div>

    <h2 class="section-title">单词复习</h2>
    <div v-if="dueWords.length === 0 && !started" class="card empty">
      <div class="emoji">✅</div>
      <h2>太棒了！</h2>
      <p v-if="learnedCount === 0">还没有学习记录，先去 <router-link to="/vocabulary">学习单词</router-link> 吧。</p>
      <p v-else>当前没有到期需要复习的单词，稍后再来看看。</p>
      <div v-if="upcoming.length > 0" class="upcoming">
        <h3>接下来安排</h3>
        <div v-for="item in upcoming" :key="item.key" class="upcoming-row">
          <span class="en">{{ item.word.en }}</span>
          <span class="time">{{ formatTime(item.state.nextReview) }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="!started" class="card start">
      <div class="emoji">⏰</div>
      <h2>{{ dueWords.length }} 个单词待复习</h2>
      <p>现在开始复习，巩固记忆效果最佳。</p>
      <button class="btn" @click="begin">开始复习</button>
    </div>

    <div v-else-if="!finished" class="flashcard-area">
      <div class="progress-text">{{ index + 1 }} / {{ queue.length }}</div>
      <div class="card flashcard" @click="flipped = !flipped">
        <div class="word">{{ currentWord.word.en }}</div>
        <div class="phonetic">{{ currentWord.word.phonetic }}</div>
        <div class="from">{{ currentWord.word.bookTitle }} · {{ currentWord.word.unitTitle }}</div>
        <button class="icon-btn" @click.stop="speak(currentWord.word.en)">🔊</button>
        <div v-if="flipped" class="meaning">{{ currentWord.word.cn }}</div>
        <div v-else class="hint">点击卡片回忆释义</div>
        <div class="level">
          记忆等级：
          <span v-for="i in 7" :key="i" class="dot" :class="{ on: i <= currentWord.state.level }"></span>
        </div>
      </div>
      <div class="actions">
        <button class="btn danger" @click="answer(false)">忘记了</button>
        <button class="btn success" @click="answer(true)">记得</button>
      </div>
    </div>

    <div v-else class="card result">
      <div class="emoji">🎉</div>
      <h2>本轮复习完成！</h2>
      <p>共复习 {{ queue.length }} 个 · 记住 {{ knownCount }} 个 · 遗忘 {{ queue.length - knownCount }} 个</p>
      <div class="actions">
        <router-link to="/" class="btn outline">返回首页</router-link>
        <router-link to="/vocabulary" class="btn">继续学习新单词</router-link>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProgress } from '../composables/useProgress'
import { useSpeech } from '../composables/useSpeech'
import { usePhonetics } from '../composables/usePhonetics'
import { findWord } from '../data/vocabulary'
import PhoneticsQuiz from '../components/PhoneticsQuiz.vue'

const { dueWords, markWord, learnedCount, state } = useProgress()
const { speak } = useSpeech()
const { PHONEME_TOTAL, masteredCount, phoneticsMastered, duePhonemeCount } = usePhonetics()

const quizDate = new Date().toDateString()

const started = ref(false)
const finished = ref(false)
const index = ref(0)
const flipped = ref(false)
const knownCount = ref(0)
const queue = ref([])

const currentWord = computed(() => queue.value[index.value])

const upcoming = computed(() => {
  const now = Date.now()
  return Object.entries(state.words)
    .map(([key, s]) => ({ key, state: s, word: findWord(key) }))
    .filter((x) => x.word && x.state.nextReview > now)
    .sort((a, b) => a.state.nextReview - b.state.nextReview)
    .slice(0, 8)
})

function begin() {
  queue.value = dueWords.value
    .map((key) => ({ key, word: findWord(key), state: state.words[key] }))
    .filter((x) => x.word)
  started.value = true
}

function answer(known) {
  markWord(currentWord.value.key, known, 'review')
  if (known) knownCount.value++
  if (index.value >= queue.value.length - 1) {
    finished.value = true
  } else {
    index.value++
    flipped.value = false
  }
}

function formatTime(ts) {
  const diff = ts - Date.now()
  const days = Math.round(diff / 86400000)
  if (days <= 0) return '今天'
  if (days === 1) return '明天'
  return `${days} 天后`
}
</script>

<style scoped>
.section-title { font-size: 18px; margin: 24px 0 12px; }
.phoneme-review { margin-bottom: 8px; }
.empty, .start { text-align: center; padding: 48px 24px; max-width: 560px; margin: 0 auto; }
.emoji { font-size: 48px; }
h2 { margin: 12px 0 8px; }
.empty p, .start p { color: var(--text-light); }
.empty a { color: var(--primary); }
.start .btn { margin-top: 20px; }
.upcoming { margin-top: 24px; text-align: left; }
.upcoming h3 { font-size: 15px; margin-bottom: 8px; }
.upcoming-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg);
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 14px;
}
.upcoming-row .time { color: var(--text-light); }
.flashcard-area { max-width: 480px; margin: 0 auto; }
.progress-text { text-align: right; color: var(--text-light); font-size: 14px; margin-bottom: 8px; }
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
.from { color: var(--text-light); font-size: 12px; }
.meaning { font-size: 18px; color: var(--primary-dark); margin-top: 8px; }
.hint { color: var(--text-light); font-size: 13px; margin-top: 8px; }
.level { margin-top: 12px; font-size: 12px; color: var(--text-light); }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--border); margin: 0 2px; }
.dot.on { background: var(--success); }
.actions { display: flex; gap: 16px; justify-content: center; margin-top: 24px; }
.result { max-width: 480px; margin: 0 auto; text-align: center; padding: 48px 24px; }
.result p { color: var(--text-light); }
</style>
