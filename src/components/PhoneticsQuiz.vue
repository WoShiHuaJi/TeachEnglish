<template>
  <div class="quiz">
    <div v-if="queue.length === 0" class="card box">
      <div class="emoji">📚</div>
      <h2>今日音标任务已完成</h2>
      <p v-if="phoneticsMastered && masteredCount >= PHONEME_TOTAL">48 个音标全部在握，单词学习已解锁，到期音标会按遗忘曲线再次出现。</p>
      <p v-else-if="phoneticsMastered">部分音标需巩固，明天按遗忘曲线继续复习。</p>
      <p v-else>今日的可练习知识点已用完，明天再来继续攻克剩余 {{ remainingCount }} 个音标。</p>
      <div class="mastery-bar">
        <div class="fill" :style="{ width: (masteredCount / PHONEME_TOTAL) * 100 + '%' }"></div>
      </div>
      <p class="mastery-text">已掌握 {{ masteredCount }} / {{ PHONEME_TOTAL }}</p>
    </div>

    <div v-else-if="!finished" class="card box">
      <div class="top-row">
        <span class="counter">第 {{ answeredCount + 1 }} / {{ totalQuestions }} 题</span>
        <span v-if="current.mode === 'review'" class="tag review-tag">曲线复习</span>
        <span v-else class="tag">知识点 {{ passedSymbols.size + failedSymbols.size + 1 }} / {{ sessionCount }}</span>
      </div>

      <div class="prompt">{{ current.prompt }}</div>

      <button v-if="current.speakText" class="btn outline audio-btn" @click="playAudio">
        🔊 播放发音
      </button>

      <div class="options">
        <button
          v-for="opt in current.options"
          :key="opt"
          class="option"
          :class="optionClass(opt)"
          :disabled="answered"
          @click="answer(opt)"
        >{{ opt }}</button>
      </div>

      <div v-if="answered" class="feedback" :class="lastCorrect ? 'ok' : 'bad'">
        <template v-if="lastCorrect">✓ 回答正确</template>
        <template v-else>✗ 回答错误，正确答案：{{ current.answer }}</template>
        <template v-if="extraNotice">
          <br /><small>该知识点答错 1 题，将随机追加 2 题确认是否为失误</small>
        </template>
        <template v-else-if="!lastCorrect && failedSymbols.has(current.symbol)">
          <br /><small>知识点 {{ current.symbol }} 判定未完全掌握，请明天再挑战</small>
        </template>
      </div>
    </div>

    <div v-else class="card box">
      <div class="emoji">🏁</div>
      <h2>本轮练习结束</h2>
      <p>通过 {{ passedSymbols.size }} 个知识点 · 未通过 {{ failedSymbols.size }} 个</p>
      <div class="mastery-bar">
        <div class="fill" :style="{ width: (masteredCount / PHONEME_TOTAL) * 100 + '%' }"></div>
      </div>
      <p class="mastery-text">已掌握 {{ masteredCount }} / {{ PHONEME_TOTAL }}</p>
      <p v-if="failedSymbols.size > 0" class="retry-hint">
        未完全掌握的知识点（{{ [...failedSymbols].join(' ') }}）明天会再次出现，先去音标表巩固一下吧。
      </p>
      <p v-else-if="phoneticsMastered" class="retry-hint ok-text">
        🎉 全部音标已掌握，单词学习已解锁！
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePhonetics } from '../composables/usePhonetics'
import { useProgress } from '../composables/useProgress'
import { useSpeech } from '../composables/useSpeech'

const {
  PHONEME_TOTAL,
  QUESTIONS_PER_PHONEME,
  masteredCount,
  remainingCount,
  phoneticsMastered,
  sessionPhonemes,
  buildQuestions,
  buildExtraQuestions,
  buildReviewQuestions,
  shuffle,
} = usePhonetics()
const { markPhoneme } = useProgress()
const { speak } = useSpeech()

const queue = ref([])
const index = ref(0)
const answered = ref(false)
const lastCorrect = ref(false)
const answeredCount = ref(0)
const finished = ref(false)
const passedSymbols = ref(new Set())
const failedSymbols = ref(new Set())
const symbolStats = ref({})
const extraNotice = ref(false)
const sessionCount = ref(0)
const reviewCount = ref(0)

const totalQuestions = computed(() => queue.value.length)
const current = computed(() => queue.value[index.value])

onMounted(() => {
  const items = sessionPhonemes()
  sessionCount.value = items.length
  const practice = buildQuestions(items)
  const review = buildReviewQuestions()
  reviewCount.value = review.length
  queue.value = shuffle([...practice, ...review])
  if (queue.value.length > 0 && current.value.kind === 'audio') playAudio()
})

function playAudio() {
  if (current.value?.speakText) speak(current.value.speakText, 'en-GB')
}

function optionClass(opt) {
  if (!answered.value) return ''
  if (opt === current.value.answer) return 'correct'
  return 'disabled'
}

function getStats(symbol) {
  if (!symbolStats.value[symbol]) {
    symbolStats.value[symbol] = {
      base: 0, baseWrong: 0,
      extraAdded: false, extra: 0, extraWrong: 0,
      judged: false,
    }
  }
  return symbolStats.value[symbol]
}

function addPassed(symbol) {
  markPhoneme(symbol, true)
  passedSymbols.value = new Set(passedSymbols.value).add(symbol)
}

function addFailed(symbol) {
  markPhoneme(symbol, false)
  failedSymbols.value = new Set(failedSymbols.value).add(symbol)
}

function insertExtrasRandomly(extras) {
  for (const ex of extras) {
    const range = queue.value.length - index.value
    const pos = index.value + 1 + Math.floor(Math.random() * range)
    queue.value.splice(pos, 0, ex)
  }
}

function answer(opt) {
  if (answered.value) return
  answered.value = true
  extraNotice.value = false
  const q = current.value
  const correct = opt === q.answer
  lastCorrect.value = correct

  const st = getStats(q.symbol)
  const isExtra = q.id.includes('-extra')

  if (q.mode === 'review') {
    if (correct) {
      addPassed(q.symbol)
    } else {
      addFailed(q.symbol)
    }
    setTimeout(next, 1600)
    return
  }

  if (isExtra) {
    st.extra++
    if (!correct) st.extraWrong++
  } else {
    st.base++
    if (!correct) st.baseWrong++
  }

  if (!st.judged && !isExtra && st.base >= QUESTIONS_PER_PHONEME) {
    if (st.baseWrong === 0) {
      st.judged = true
      addPassed(q.symbol)
    } else if (st.baseWrong === 1) {
      st.extraAdded = true
      insertExtrasRandomly(buildExtraQuestions(q.symbol, 2))
      extraNotice.value = true
    } else {
      st.judged = true
      addFailed(q.symbol)
    }
  }

  if (!st.judged && isExtra && st.extra >= 2) {
    st.judged = true
    if (st.extraWrong === 0) {
      addPassed(q.symbol)
    } else {
      addFailed(q.symbol)
    }
  }

  setTimeout(next, 1600)
}

function next() {
  answeredCount.value++
  let i = index.value + 1
  while (i < queue.value.length && failedSymbols.value.has(queue.value[i].symbol)) i++
  if (i >= queue.value.length) {
    finished.value = true
  } else {
    index.value = i
    answered.value = false
    extraNotice.value = false
    if (current.value.kind === 'audio') setTimeout(playAudio, 300)
  }
}
</script>

<style scoped>
.box { max-width: 480px; margin: 0 auto; padding: 28px 20px; text-align: center; }
.emoji { font-size: 44px; }
.box h2 { margin: 10px 0 8px; font-size: 20px; }
.box p { color: var(--text-light); }
.top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.counter { color: var(--text-light); font-size: 13px; }
.prompt { font-size: 18px; font-weight: 600; margin-bottom: 18px; }
.audio-btn { margin-bottom: 16px; }
.options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.option {
  padding: 14px 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  font-size: 17px;
  cursor: pointer;
  transition: all 0.15s;
}
.option:not(:disabled):hover { border-color: var(--primary); background: var(--primary-light); }
.option.correct { border-color: var(--success); background: #e8f7f0; color: var(--success); font-weight: 700; }
.option.disabled { opacity: 0.45; }
.option:disabled { cursor: default; }
.feedback { margin-top: 16px; font-size: 15px; line-height: 1.5; }
.feedback.ok { color: var(--success); }
.feedback.bad { color: var(--danger); }
.feedback small { color: var(--text-light); }
.review-tag { background: #e8f7f0; color: var(--success); }
.mastery-bar { height: 8px; background: var(--bg); border-radius: 999px; overflow: hidden; margin: 16px 0 6px; }
.mastery-bar .fill { height: 100%; background: var(--success); border-radius: 999px; transition: width 0.4s; }
.mastery-text { font-size: 13px; }
.retry-hint { margin-top: 12px; font-size: 13px; }
.ok-text { color: var(--success); font-weight: 600; }
</style>
