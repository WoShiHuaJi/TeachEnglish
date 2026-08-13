import { watch } from 'vue'
import { useProgress } from './useProgress'

const ID_KEY = 'english-learning-user-id'

function getUserId() {
  let id = localStorage.getItem(ID_KEY)
  if (!id) {
    id = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(ID_KEY, id)
  }
  return id
}

let started = false

export function getBackupId() {
  return getUserId()
}

export async function restoreFromId(id) {
  const trimmed = (id || '').trim()
  if (!/^[A-Za-z0-9-]{8,64}$/.test(trimmed)) return false
  try {
    const res = await fetch(`/api/progress?id=${encodeURIComponent(trimmed)}`)
    const json = await res.json()
    if (!json?.data) return false
    localStorage.setItem(ID_KEY, trimmed)
    const { state, persist } = useProgress()
    Object.assign(state, json.data)
    state.updatedAt = json.updatedAt
    persist()
    return true
  } catch {
    return false
  }
}

export function initSync() {
  if (started) return
  started = true

  const { state, persist } = useProgress()
  const userId = getUserId()
  let timer = null
  let applying = false

  function payload() {
    return JSON.stringify({
      updatedAt: state.updatedAt || Date.now(),
      data: {
        words: state.words,
        phonemes: state.phonemes,
        log: state.log,
        phoneticsUnlocked: state.phoneticsUnlocked,
      },
    })
  }

  async function push() {
    try {
      await fetch(`/api/progress?id=${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payload(),
      })
    } catch {
      // 离线或接口不可用时静默失败，本地 localStorage 仍是主存储
    }
  }

  function schedulePush() {
    if (applying) return
    clearTimeout(timer)
    timer = setTimeout(push, 2000)
  }

  async function pull() {
    try {
      const res = await fetch(`/api/progress?id=${encodeURIComponent(userId)}`)
      const json = await res.json()
      if (json?.data && (json.updatedAt || 0) > (state.updatedAt || 0)) {
        applying = true
        Object.assign(state, json.data)
        state.updatedAt = json.updatedAt
        persist()
        setTimeout(() => { applying = false }, 0)
      }
    } catch {
      // 忽略：首次使用或离线
    }
  }

  pull()
  watch(state, schedulePush, { deep: true })

  window.addEventListener('online', pull)
}
