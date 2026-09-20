// Web Speech API 封装，针对移动端（iOS Safari / Android Chrome）做了兼容处理
export function useSpeech() {
  let voices = []

  function loadVoices() {
    voices = window.speechSynthesis?.getVoices() || []
  }

  if ('speechSynthesis' in window) {
    loadVoices()
    // 移动端语音列表异步加载
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

  function speak(text, lang = 'en-US', rate = 0.85) {
    if (!('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    synth.cancel()
    if (synth.paused) synth.resume()

    const u = new SpeechSynthesisUtterance(text)
    const voice = pickVoice(lang)
    if (voice) {
      u.voice = voice
      u.lang = voice.lang
    } else {
      u.lang = lang
    }
    u.rate = rate
    u.volume = 1

    // iOS 上 cancel 后立即 speak 偶尔无声，延迟一拍再播放
    setTimeout(() => {
      if (synth.paused) synth.resume()
      synth.speak(u)
    }, 50)
  }

  return { speak }
}
