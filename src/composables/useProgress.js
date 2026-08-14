import { reactive, computed } from 'vue'
import { phonemeTotal } from '../data/phonetics'

const STORAGE_KEY = 'english-learning-progress'
const INTERVALS_DAYS = [0.01, 1, 2, 4, 7, 15, 30]
const DAY = 24 * 60 * 60 * 1000

const DEFAULTS = {
  words: {},
  phoneticsDone: [],
  log: [],
  phonemes: {},
  phoneticsUnlocked: false,
  updatedAt: 0,
  settings: { dailyPhonemes: 6, dailyWords: 20 },
}

function load() {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) }
  } catch {
    return { ...DEFAULTS }
  }
}

const state = reactive(load())

function save() {
  state.updatedAt = Date.now()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useProgress() {
  function markWord(key, known, type = 'learn') {
    const now = Date.now()
    const item = state.words[key] || { level: 0, nextReview: now }
    if (known) {
      item.level = Math.min(item.level + 1, INTERVALS_DAYS.length - 1)
    } else {
      item.level = 0
    }
    item.lastReview = now
    item.nextReview = now + INTERVALS_DAYS[item.level] * DAY
    state.words[key] = item
    state.log.push({ t: now, type, known, key })
    save()
    return item
  }

  function setSetting(name, value) {
    state.settings = { ...state.settings, [name]: value }
    save()
  }

  function getWordState(key) {
    return state.words[key]
  }

  const dueWords = computed(() => {
    const now = Date.now()
    return Object.keys(state.words).filter((k) => state.words[k].nextReview <= now)
  })

  const dueCount = computed(() => dueWords.value.length)

  const learnedCount = computed(() => Object.keys(state.words).length)

  const masteredCount = computed(
    () => Object.values(state.words).filter((w) => w.level >= 4).length
  )

  function markPhoneme(symbol, passed) {
    const now = Date.now()
    const prev = state.phonemes[symbol] || { attempts: 0, level: 0, mastered: false }
    const level = passed
      ? Math.min((prev.mastered ? prev.level : 0) + 1, INTERVALS_DAYS.length - 1)
      : 0
    state.phonemes[symbol] = {
      mastered: passed,
      attempts: prev.attempts + 1,
      level,
      lastTry: now,
      nextReview: now + INTERVALS_DAYS[level] * DAY,
    }
    if (passed && !state.phoneticsUnlocked) {
      const mastered = Object.values(state.phonemes).filter((p) => p.mastered).length
      if (mastered >= phonemeTotal) state.phoneticsUnlocked = true
    }
    state.log.push({ t: now, type: 'phonetics', known: passed })
    save()
  }

  function getPhonemeState(symbol) {
    return state.phonemes[symbol]
  }

  const phonemeMasteredCount = computed(
    () => Object.values(state.phonemes).filter((p) => p.mastered).length
  )

  function dayStart(offsetDays = 0) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.getTime() - offsetDays * DAY
  }

  const todayStats = computed(() => {
    const start = dayStart()
    const entries = state.log.filter((e) => e.t >= start)
    const isReview = (e) => e.type === 'review' || e.type === 'phonetics'
    return {
      learned: entries.filter((e) => e.type === 'learn').length,
      reviewed: entries.filter(isReview).length,
      correct: entries.filter((e) => isReview(e) && e.known).length,
    }
  })

  const weekStats = computed(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const start = dayStart(i)
      const end = start + DAY
      const entries = state.log.filter((e) => e.t >= start && e.t < end)
      const d = new Date(start)
      days.push({
        label: i === 0 ? '今天' : `${d.getMonth() + 1}/${d.getDate()}`,
        learn: entries.filter((e) => e.type === 'learn').length,
        review: entries.filter((e) => e.type === 'review' || e.type === 'phonetics').length,
      })
    }
    return days
  })

  function resetAll() {
    state.words = {}
    state.phoneticsDone = []
    state.log = []
    state.phonemes = {}
    state.phoneticsUnlocked = false
    save()
  }

  return {
    state,
    markWord,
    getWordState,
    dueWords,
    dueCount,
    learnedCount,
    masteredCount,
    markPhoneme,
    getPhonemeState,
    phonemeMasteredCount,
    todayStats,
    weekStats,
    setSetting,
    resetAll,
    persist: save,
  }
}
