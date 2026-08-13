export function useSpeech() {
  function speak(text, lang = 'en-US', rate = 0.85) {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = rate
    window.speechSynthesis.speak(u)
  }
  return { speak }
}
