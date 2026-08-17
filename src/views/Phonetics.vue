<template>
  <div>
    <h1 class="page-title">英语国际音标（48 个）</h1>
    <p class="page-desc">点击音标卡片听例词发音，注意发音要领提示。全部掌握后解锁单词学习。</p>

    <div class="card mastery-card">
      <div class="mastery-info">
        <span>音标掌握进度</span>
        <b>{{ masteredCount }} / {{ PHONEME_TOTAL }}</b>
      </div>
      <div class="mastery-bar">
        <div class="fill" :style="{ width: (masteredCount / PHONEME_TOTAL) * 100 + '%' }"></div>
      </div>
      <p v-if="phoneticsMastered" class="unlock-text">🎉 已全部掌握，单词学习已解锁！</p>
      <p v-else class="lock-text">🔒 掌握全部音标后解锁单词学习</p>
    </div>

    <div class="tabs">
      <button :class="{ active: tab === 'vowel' }" @click="tab = 'vowel'">元音（20）</button>
      <button :class="{ active: tab === 'consonant' }" @click="tab = 'consonant'">辅音（28）</button>
      <button :class="{ active: tab === 'quiz' }" @click="tab = 'quiz'">练习考核</button>
    </div>

    <PhoneticsQuiz v-if="tab === 'quiz'" :key="quizKey" />

    <template v-else>
    <div v-for="group in currentGroups" :key="group.group" class="group">
      <h2 class="group-title">{{ group.group }}</h2>
      <div class="grid symbols">
        <div
          v-for="item in group.items"
          :key="item.symbol"
          class="card symbol-card"
          :class="{ mastered: isMastered(item.symbol) }"
          @click="play(item)"
        >
          <span v-if="isMastered(item.symbol)" class="check">✓</span>
          <div class="symbol">{{ item.symbol }}</div>
          <div class="example">
            <b>{{ item.example }}</b> <span class="phonetic">{{ item.phonetic }}</span>
          </div>
          <div class="cn">{{ item.cn }}</div>
          <div class="tip">{{ item.tip }}</div>
          <button class="speak-btn" @click.stop="play(item)">🔊 发音</button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { vowels, consonants } from '../data/phonetics'
import { useSpeech } from '../composables/useSpeech'
import { usePhonetics } from '../composables/usePhonetics'
import PhoneticsQuiz from '../components/PhoneticsQuiz.vue'

const { speak } = useSpeech()
const { PHONEME_TOTAL, masteredCount, phoneticsMastered, isMastered } = usePhonetics()
const tab = ref('vowel')
const quizKey = ref(0)
const currentGroups = computed(() => (tab.value === 'vowel' ? vowels : consonants))

function play(item) {
  speak(item.example, 'en-GB')
}
</script>

<style scoped>
.mastery-card { margin-bottom: 20px; padding: 16px 20px; }
.mastery-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 14px; }
.mastery-info b { color: var(--primary); }
.mastery-bar { height: 8px; background: var(--bg); border-radius: 999px; overflow: hidden; }
.mastery-bar .fill { height: 100%; background: var(--success); border-radius: 999px; transition: width 0.4s; }
.unlock-text { margin-top: 8px; color: var(--success); font-size: 13px; font-weight: 600; }
.lock-text { margin-top: 8px; color: var(--text-light); font-size: 13px; }
.tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
.tabs button {
  padding: 8px 20px;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-light);
}
.tabs button.active { background: var(--primary); border-color: var(--primary); color: #fff; }
.group { margin-bottom: 28px; }
.group-title { font-size: 17px; margin-bottom: 12px; color: var(--text); }
.symbols { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
@media (max-width: 640px) {
  .symbols { grid-template-columns: repeat(2, 1fr); }
  .symbol-card { padding: 12px; }
  .symbol { font-size: 21px; }
  .tip { font-size: 11px; }
}
.symbol-card { cursor: pointer; transition: transform 0.15s; padding: 16px; position: relative; }
.symbol-card:hover { transform: translateY(-2px); }
.symbol-card.mastered { border: 1px solid var(--success); }
.check {
  position: absolute;
  top: 8px;
  right: 10px;
  color: var(--success);
  font-weight: 700;
}
.symbol { font-size: 24px; font-weight: 700; color: var(--primary); }
.example { margin-top: 6px; }
.phonetic { color: var(--text-light); font-size: 13px; }
.cn { color: var(--text-light); font-size: 13px; }
.tip { margin-top: 8px; font-size: 12px; color: var(--text-light); background: var(--bg); border-radius: 8px; padding: 6px 8px; }
.speak-btn {
  margin-top: 10px;
  border: none;
  background: var(--primary-light);
  color: var(--primary);
  padding: 5px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}
</style>
