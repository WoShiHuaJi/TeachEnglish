<template>
  <div v-if="unit">
    <div class="topbar">
      <router-link to="/vocabulary" class="back">← 返回</router-link>
      <span class="progress-text">{{ progressText }}</span>
    </div>
    <h1 class="unit-title">{{ book.title }} · {{ unit.title }}</h1>

    <div v-if="phase === 'empty'" class="card result">
      <div class="emoji">📚</div>
      <h2>今日学习任务已完成</h2>
      <p>今日新学单词已达 {{ dailyWords }} 个上限，明天再来学习新内容。</p>
      <p class="tip">可以前往复习页巩固已学内容。</p>
      <div class="actions">
        <router-link to="/review" class="btn">去复习</router-link>
      </div>
    </div>

    <div v-else-if="phase === 'learn'" class="flashcard-area">
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
        <button class="btn danger" @click="answerLearn(false)">不认识</button>
        <button class="btn success" @click="answerLearn(true)">认识</button>
      </div>
    </div>

    <div v-else-if="phase === 'quiz'" class="quiz-area">
      <div class="card quiz-card">
        <div class="quiz-head">
          <span class="tag">学后检测</span>
          <span class="counter">第 {{ quizIndex + 1 }} / {{ quiz.length }} 题</span>
        </div>
        <template v-if="currentQuiz.kind === 'en2cn'">
          <div class="quiz-word">{{ currentQuiz.word[0] }}</div>
          <div class="phonetic">{{ currentQuiz.word[1] }}</div>
          <button class="icon-btn" @click="speak(currentQuiz.word[0])">🔊</button>
          <div class="quiz-prompt">选择正确的中文释义</div>
        </template>
        <template v-else>
          <div class="quiz-cn">{{ currentQuiz.word[2] }}</div>
          <div class="quiz-prompt">选择对应的英文单词</div>
        </template>
        <div class="options">
          <button
            v-for="opt in currentQuiz.options"
            :key="opt"
            class="option"
            :class="quizOptionClass(opt)"
            :disabled="quizAnswered"
            @click="answerQuiz(opt)"
          >{{ opt }}</button>
        </div>
        <div v-if="quizAnswered" class="feedback" :class="quizLastCorrect ? 'ok' : 'bad'">
          <template v-if="quizLastCorrect">✓ 回答正确</template>
          <template v-else>✗ 正确答案：{{ currentQuiz.answer }}（该词将重新安排学习）</template>
        </div>
      </div>
    </div>

    <div v-else class="card result">
      <div class="emoji">🎉</div>
      <h2>今日学习与检测完成！</h2>
      <p>学习 {{ sessionWords.length }} 个单词 · 检测 {{ quiz.length }} 题 · 答对 {{ quizCorrect }} 题</p>
      <p v-if="quizCorrect < quiz.length" class="tip">答错的单词已重新安排到复习队列，明天会再次出现。</p>
      <p v-else class="tip">全部答对，太棒了！系统已按遗忘曲线安排后续复习。</p>
      <div class="actions">
        <router-link to="/vocabulary" class="btn outline">返回单词表</router-link>
        <router-link to="/review" class="btn">去复习</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { books, getBook, getUnit, wordKey } from '../data/vocabulary'
import { useProgress } from '../composables/useProgress'
import { useSpeech } from '../composables/useSpeech'

const route = useRoute()
const { state, markWord, getWordState } = useProgress()
const { speak } = useSpeech()

const book = getBook(route.params.bookId)
const unit = getUnit(route.params.bookId, route.params.unitId)

const wordPool = books.flatMap((b) =>
  b.units.flatMap((u) => u.words.map((w) => ({ en: w[0], cn: w[2] })))
)

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const dailyWords = Number(state.settings?.dailyWords) || 20

const startOfToday = new Date()
startOfToday.setHours(0, 0, 0, 0)
const todayStart = startOfToday.getTime()

const learnedTodayKeys = new Set(
  state.log.filter((e) => e.type === 'learn' && e.t >= todayStart && e.key).map((e) => e.key)
)
const todayLearnCount = state.log.filter((e) => e.type === 'learn' && e.t >= todayStart).length
const quota = Math.max(0, dailyWords - todayLearnCount)

const freshWords = (unit ? unit.words : []).filter(
  (w) => !learnedTodayKeys.has(wordKey(book.id, unit.id, w))
)
const sessionWords = freshWords.slice(0, quota)

const phase = ref(sessionWords.length > 0 ? 'learn' : 'empty')
const index = ref(0)
const flipped = ref(false)
const knownCount = ref(0)

const current = computed(() => sessionWords[index.value])
const wordState = computed(() => getWordState(wordKey(book.id, unit.id, current.value)))
const progressText = computed(() => {
  if (phase.value === 'learn') return `${index.value + 1} / ${sessionWords.length}`
  if (phase.value === 'quiz') return `检测中`
  return ''
})

const quiz = ref([])
const quizIndex = ref(0)
const quizAnswered = ref(false)
const quizLastCorrect = ref(false)
const quizCorrect = ref(0)
const currentQuiz = computed(() => quiz.value[quizIndex.value])

function answerLearn(known) {
  markWord(wordKey(book.id, unit.id, current.value), known, 'learn')
  if (known) knownCount.value++
  if (index.value >= sessionWords.length - 1) {
    startQuiz()
  } else {
    index.value++
    flipped.value = false
  }
}

function startQuiz() {
  quiz.value = buildQuiz(sessionWords)
  phase.value = 'quiz'
}

function buildQuiz(words) {
  const questions = []
  for (const w of words) {
    const cnDistractors = shuffle(wordPool.filter((p) => p.cn !== w[2])).slice(0, 3).map((p) => p.cn)
    questions.push({
      kind: 'en2cn',
      word: w,
      options: shuffle([w[2], ...cnDistractors]),
      answer: w[2],
    })
    const enDistractors = shuffle(wordPool.filter((p) => p.en !== w[0])).slice(0, 3).map((p) => p.en)
    questions.push({
      kind: 'cn2en',
      word: w,
      options: shuffle([w[0], ...enDistractors]),
      answer: w[0],
    })
  }
  return shuffle(questions)
}

function quizOptionClass(opt) {
  if (!quizAnswered.value) return ''
  if (opt === currentQuiz.value.answer) return 'correct'
  return 'disabled'
}

function answerQuiz(opt) {
  if (quizAnswered.value) return
  quizAnswered.value = true
  const q = currentQuiz.value
  const correct = opt === q.answer
  quizLastCorrect.value = correct
  if (correct) quizCorrect.value++
  markWord(wordKey(book.id, unit.id, q.word), correct, 'learn')
  setTimeout(() => {
    if (quizIndex.value >= quiz.value.length - 1) {
      phase.value = 'done'
    } else {
      quizIndex.value++
      quizAnswered.value = false
    }
  }, 1400)
}
</script>

<style scoped>
.topbar { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
.back { color: var(--primary); font-size: 14px; }
.progress-text { color: var(--text-light); font-size: 14px; }
.unit-title { font-size: 20px; margin: 12px 0 20px; }
.flashcard-area, .quiz-area { max-width: 480px; margin: 0 auto; }
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
.quiz-card { padding: 24px; text-align: center; }
.quiz-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.counter { color: var(--text-light); font-size: 13px; }
.quiz-word { font-size: 30px; font-weight: 700; }
.quiz-cn { font-size: 22px; font-weight: 700; color: var(--primary-dark); }
.quiz-prompt { margin: 14px 0; color: var(--text-light); font-size: 14px; }
.options { display: grid; grid-template-columns: 1fr; gap: 10px; }
.option {
  padding: 13px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.15s;
}
.option:not(:disabled):hover { border-color: var(--primary); background: var(--primary-light); }
.option.correct { border-color: var(--success); background: #e8f7f0; color: var(--success); font-weight: 700; }
.option.disabled { opacity: 0.45; }
.option:disabled { cursor: default; }
.feedback { margin-top: 14px; font-size: 14px; }
.feedback.ok { color: var(--success); }
.feedback.bad { color: var(--danger); }
@media (max-width: 640px) {
  .flashcard { min-height: 240px; padding: 36px 16px; }
  .word { font-size: 28px; }
  .quiz-word { font-size: 26px; }
  .quiz-cn { font-size: 19px; }
  .unit-title { font-size: 18px; }
  .actions .btn { flex: 1; }
}
</style>
