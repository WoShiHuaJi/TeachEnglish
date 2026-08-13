<template>
  <div>
    <section class="hero card">
      <h1>欢迎来到英语学习乐园 👋</h1>
      <p>从音标打好基础，到语法构建框架，再到单词日积月累，配合艾宾浩斯遗忘曲线科学复习。</p>
      <div class="hero-actions">
        <router-link to="/phonetics" class="btn">从音标开始</router-link>
        <router-link to="/review" class="btn outline">
          今日复习 <span v-if="reviewBadge > 0">({{ reviewBadge }})</span>
        </router-link>
      </div>
    </section>

    <div class="grid stats">
      <div class="card stat">
        <div class="num">{{ masteredCount }}/{{ PHONEME_TOTAL }}</div>
        <div class="label">音标掌握</div>
      </div>
      <div class="card stat">
        <div class="num">{{ learnedCount }}</div>
        <div class="label">已学单词</div>
      </div>
      <div class="card stat">
        <div class="num success">{{ wordMasteredCount }}</div>
        <div class="label">已掌握单词</div>
      </div>
      <div class="card stat">
        <div class="num warn">{{ dueCount }}</div>
        <div class="label">待复习单词</div>
      </div>
    </div>

    <h2 class="section-title">今日进度</h2>
    <div class="grid stats">
      <div class="card stat">
        <div class="num">{{ todayStats.learned }}</div>
        <div class="label">今日学习（词次）</div>
      </div>
      <div class="card stat">
        <div class="num success">{{ todayStats.reviewed }}</div>
        <div class="label">今日复习（词次）</div>
      </div>
      <div class="card stat">
        <div class="num warn">{{ reviewAccuracy }}%</div>
        <div class="label">复习正确率</div>
      </div>
    </div>

    <h2 class="section-title">近 7 天学习情况</h2>
    <div class="card chart-card">
      <div class="chart">
        <div v-for="day in weekStats" :key="day.label" class="bar-col">
          <div class="bars">
            <div
              class="bar learn"
              :style="{ height: barHeight(day.learn) }"
              :title="`学习 ${day.learn}`"
            ></div>
            <div
              class="bar review"
              :style="{ height: barHeight(day.review) }"
              :title="`复习 ${day.review}`"
            ></div>
          </div>
          <div class="bar-label">{{ day.label }}</div>
        </div>
      </div>
      <div class="legend">
        <span><i class="swatch learn"></i> 学习</span>
        <span><i class="swatch review"></i> 复习</span>
      </div>
    </div>

    <h2 class="section-title">学习路径</h2>
    <div class="grid paths">
      <router-link to="/phonetics" class="card path">
        <div class="emoji">🔤</div>
        <h3>英语音标</h3>
        <p>48 个国际音标，元音辅音分类学习，点击即可听发音。</p>
      </router-link>
      <router-link to="/grammar" class="card path">
        <div class="emoji">📖</div>
        <h3>英语语法</h3>
        <p>名词、时态、从句…… 由浅入深覆盖小学到高中核心语法。</p>
      </router-link>
      <router-link to="/vocabulary" class="card path">
        <div class="emoji">📝</div>
        <h3>英语单词 <span v-if="!phoneticsMastered">🔒</span></h3>
        <p v-if="phoneticsMastered">人教版小学到高中各册各单元单词，带音标与发音。</p>
        <p v-else>掌握全部 48 个音标后解锁（当前 {{ masteredCount }}/{{ PHONEME_TOTAL }}）。</p>
      </router-link>
      <router-link to="/review" class="card path">
        <div class="emoji">⏰</div>
        <h3>智能复习</h3>
        <p>遵循遗忘曲线（1/2/4/7/15/30 天），在最佳时机巩固记忆。</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgress } from '../composables/useProgress'
import { usePhonetics } from '../composables/usePhonetics'

const { dueCount, learnedCount, masteredCount: wordMasteredCount, todayStats, weekStats } = useProgress()
const { PHONEME_TOTAL, masteredCount, phoneticsMastered, remainingCount } = usePhonetics()

const reviewBadge = computed(() => (phoneticsMastered.value ? dueCount.value : remainingCount.value))

const reviewAccuracy = computed(() => {
  if (!todayStats.value.reviewed) return 100
  return Math.round((todayStats.value.correct / todayStats.value.reviewed) * 100)
})

const maxCount = computed(() =>
  Math.max(1, ...weekStats.value.map((d) => Math.max(d.learn, d.review)))
)

function barHeight(count) {
  if (!count) return '2px'
  return `${Math.max(6, Math.round((count / maxCount.value) * 100))}px`
}
</script>

<style scoped>
.hero { margin-top: 24px; text-align: center; padding: 48px 24px; }
.hero h1 { font-size: 30px; margin-bottom: 12px; }
.hero p { color: var(--text-light); max-width: 520px; margin: 0 auto 24px; }
.hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.stats { grid-template-columns: repeat(4, 1fr); margin-top: 20px; }
@media (max-width: 640px) { .stats { grid-template-columns: repeat(2, 1fr); } }
.stat { text-align: center; padding: 18px; }
.num { font-size: 28px; font-weight: 700; color: var(--primary); }
.num.success { color: var(--success); }
.num.warn { color: var(--warning); }
.label { color: var(--text-light); font-size: 13px; }
.section-title { margin: 32px 0 16px; font-size: 20px; }
.chart-card { padding: 20px 24px 12px; }
.chart { display: flex; align-items: flex-end; justify-content: space-around; height: 130px; }
.bar-col { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
.bars { display: flex; align-items: flex-end; gap: 4px; height: 100px; }
.bar { width: 14px; border-radius: 4px 4px 0 0; min-height: 2px; transition: height 0.3s; }
.bar.learn { background: var(--primary); }
.bar.review { background: var(--success); }
.bar-label { font-size: 12px; color: var(--text-light); }
.legend { display: flex; gap: 20px; justify-content: center; margin-top: 12px; font-size: 13px; color: var(--text-light); }
.swatch { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; }
.swatch.learn { background: var(--primary); }
.swatch.review { background: var(--success); }
.paths { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
.path { transition: transform 0.15s, box-shadow 0.15s; }
.path:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(31, 36, 48, 0.1); }
.emoji { font-size: 32px; margin-bottom: 8px; }
.path h3 { margin-bottom: 6px; }
.path p { color: var(--text-light); font-size: 13px; }
</style>
