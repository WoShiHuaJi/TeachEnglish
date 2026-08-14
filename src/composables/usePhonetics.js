import { computed } from 'vue'
import { vowels, consonants, phonemeTotal } from '../data/phonetics'
import { useProgress } from './useProgress'

export const allPhonemes = [...vowels, ...consonants].flatMap((g) => g.items)
export const PHONEME_TOTAL = phonemeTotal
const QUESTIONS_PER_PHONEME = 3
const SESSION_PHONEMES = 6
const REVIEW_PHONEMES = 8

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function todayStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function usePhonetics() {
  const { state, phonemeMasteredCount } = useProgress()

  const masteredCount = phonemeMasteredCount
  const remainingCount = computed(() => PHONEME_TOTAL - phonemeMasteredCount.value)
  const phoneticsMastered = computed(() => state.phoneticsUnlocked === true)

  const duePhonemes = computed(() => {
    const now = Date.now()
    return allPhonemes
      .filter((item) => {
        const p = state.phonemes[item.symbol]
        return p?.mastered && p.nextReview <= now
      })
      .sort((a, b) => state.phonemes[a.symbol].nextReview - state.phonemes[b.symbol].nextReview)
  })

  const duePhonemeCount = computed(() => duePhonemes.value.length)

  function isMastered(symbol) {
    return !!state.phonemes[symbol]?.mastered
  }

  function sessionPhonemes() {
    const start = todayStart()
    return allPhonemes
      .filter((item) => {
        const p = state.phonemes[item.symbol]
        if (p?.mastered) return false
        if (p?.lastTry && p.lastTry >= start) return false
        return true
      })
      .sort((a, b) => {
        const pa = state.phonemes[a.symbol]?.lastTry || 0
        const pb = state.phonemes[b.symbol]?.lastTry || 0
        return pb - pa
      })
      .slice(0, Number(state.settings?.dailyPhonemes) || SESSION_PHONEMES)
  }

  function buildQuestions(items) {
    const questions = []
    for (const item of items) {
      questions.push(...makeQuestionSet(item, `${item.symbol}-base`, ['word', 'symbol', 'audio']))
    }
    return shuffle(questions).map((q) => ({ ...q, mode: 'practice' }))
  }

  function makeQuestion(item, id, kind) {
    const others = shuffle(allPhonemes.filter((x) => x.symbol !== item.symbol))
    if (kind === 'word') {
      return {
        id,
        symbol: item.symbol,
        kind,
        prompt: `哪个单词中含有音标 ${item.symbol} 的发音？`,
        options: shuffle([item.example, ...others.slice(0, 3).map((o) => o.example)]),
        answer: item.example,
      }
    }
    if (kind === 'symbol') {
      return {
        id,
        symbol: item.symbol,
        kind,
        prompt: `单词「${item.example}」中含有下列哪个音标？`,
        speakText: item.example,
        options: shuffle([item.symbol, ...others.slice(0, 3).map((o) => o.symbol)]),
        answer: item.symbol,
      }
    }
    return {
      id,
      symbol: item.symbol,
      kind: 'audio',
      prompt: '听发音，选出你听到的音标',
      speakText: item.example,
      options: shuffle([item.symbol, ...others.slice(0, 3).map((o) => o.symbol)]),
      answer: item.symbol,
    }
  }

  function makeQuestionSet(item, idPrefix, kinds) {
    return kinds.map((kind, i) => makeQuestion(item, `${idPrefix}-${i}`, kind))
  }

  function buildExtraQuestions(symbol, count = 2) {
    const item = allPhonemes.find((x) => x.symbol === symbol)
    if (!item) return []
    const kinds = shuffle(['word', 'symbol', 'audio']).slice(0, count)
    return makeQuestionSet(item, `${symbol}-extra${Date.now()}`, kinds).map((q) => ({
      ...q,
      mode: 'practice',
    }))
  }

  function buildReviewQuestions() {
    const items = duePhonemes.value.slice(0, REVIEW_PHONEMES)
    const kinds = ['word', 'symbol', 'audio']
    return items.map((item, i) => ({
      ...makeQuestion(item, `${item.symbol}-review${Date.now()}-${i}`, kinds[i % kinds.length]),
      mode: 'review',
    }))
  }

  return {
    allPhonemes,
    PHONEME_TOTAL,
    QUESTIONS_PER_PHONEME,
    masteredCount,
    remainingCount,
    phoneticsMastered,
    duePhonemes,
    duePhonemeCount,
    isMastered,
    sessionPhonemes,
    buildQuestions,
    buildExtraQuestions,
    buildReviewQuestions,
    shuffle,
  }
}
