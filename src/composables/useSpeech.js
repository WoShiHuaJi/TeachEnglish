// 语音播放封装：
// 1. 优先使用 Web Speech API（离线可用）
// 2. 无英语语音包 / 播放失败 / 超时未启动 → 回退到在线词典发音（有道，国内可直连）
export function useSpeech() {
  let voices = []
  let audioEl = null

  function loadVoices() {
    voices = window.speechSynthesis?.getVoices() || []
  }

  if ('speechSynthesis' in window) {
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }

  function pickVoice(lang) {
    const english = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'))
    if (!english.length) return null
    const target = lang.replace('_', '-').toLowerCase()
    return (
      english.find((v) => v.lang.replace('_', '-').toLowerCase() === target) ||
      english.find((v) => v.lang.toLowerCase().startsWith('en-us')) ||
      english.find((v) => /google/i.test(v.name)) ||
      english[0]
    )
  }

  // 在线发音回退：type 1 = 英式，2 = 美式
  function playOnline(text, lang) {
    try {
      const type = lang === 'en-GB' ? 1 : 2
      const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=${type}`
      if (audioEl) audioEl.pause()
      audioEl = new Audio(url)
      audioEl.play().catch(() => {})
    } catch {
      // 忽略
    }
  }

  function speak(text, lang = 'en-US', rate = 0.85) {
    if (!('speechSynthesis' in window)) {
      playOnline(text, lang)
      return
    }
    const synth = window.speechSynthesis
    const voice = pickVoice(lang)
    // 系统没有英语语音包（如部分华为/无 GMS 设备），直接走在线发音
    if (!voice) {
      playOnline(text, lang)
      return
    }

    synth.cancel()
    if (synth.paused) synth.resume()

    const u = new SpeechSynthesisUtterance(text)
    u.voice = voice
    u.lang = voice.lang
    u.rate = rate
    u.volume = 1

    let started = false
    u.onstart = () => { started = true }
    u.onerror = () => { if (!started) playOnline(text, lang) }

    // iOS 上 cancel 后立即 speak 偶尔无声，延迟一拍再播放
    setTimeout(() => {
      if (synth.paused) synth.resume()
      synth.speak(u)
    }, 50)

    // 超时仍未开始播放（部分安卓 TTS 静默失败），回退在线发音
    setTimeout(() => {
      if (!started) {
        synth.cancel()
        playOnline(text, lang)
      }
    }, 1500)
  }

  return { speak }
}
