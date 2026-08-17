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
    <div class="card settings-card">
      <h3>⚙️ 每日学习量</h3>
      <div class="setting-rows">
        <label class="setting-row">
          <span>每日新学音标（掌握全部音标前）</span>
          <select :value="state.settings.dailyPhonemes" @change="setSetting('dailyPhonemes', Number($event.target.value))">
            <option v-for="n in [2, 3, 4, 6, 8, 10, 12]" :key="n" :value="n">{{ n }} 个</option>
          </select>
        </label>
        <label class="setting-row">
          <span>每日新学单词（解锁单词后）</span>
          <select :value="state.settings.dailyWords" @change="setSetting('dailyWords', Number($event.target.value))">
            <option v-for="n in [5, 10, 15, 20, 30, 50]" :key="n" :value="n">{{ n }} 个</option>
          </select>
        </label>
      </div>
      <p class="settings-tip">每天学完当日内容后会立即出检测题，检验是否真正学会。</p>
    </div>

    <div class="card backup-card">
      <h3>☁️ 云端备份与恢复</h3>
      <p class="backup-desc">进度会自动备份到云端。请抄下或截图保存你的备份 ID，清除浏览器缓存后可用它恢复数据。</p>
      <div class="backup-row">
        <code class="backup-id">{{ showId ? backupId : maskedId }}</code>
        <button class="mini-btn" @click="showId = !showId">{{ showId ? '隐藏' : '显示' }}</button>
        <button class="mini-btn" @click="copyId">{{ copied ? '已复制 ✓' : '复制' }}</button>
      </div>
      <details class="restore">
        <summary>清除缓存了？点这里用备份 ID 恢复数据</summary>
        <div class="restore-body">
          <input v-model="restoreId" placeholder="粘贴你的备份 ID" class="restore-input" />
          <button class="btn" :disabled="restoring" @click="doRestore">
            {{ restoring ? '恢复中…' : '恢复' }}
          </button>
          <p v-if="restoreMsg" class="restore-msg" :class="{ error: restoreError }">{{ restoreMsg }}</p>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProgress } from '../composables/useProgress'
import { usePhonetics } from '../composables/usePhonetics'
import { getBackupId, restoreFromId } from '../composables/useSync'

const { dueCount, learnedCount, masteredCount: wordMasteredCount, todayStats, weekStats, state, setSetting } = useProgress()
const { PHONEME_TOTAL, masteredCount, phoneticsMastered, remainingCount } = usePhonetics()

const reviewBadge = computed(() => (phoneticsMastered.value ? dueCount.value : remainingCount.value))

const backupId = getBackupId()
const showId = ref(false)
const copied = ref(false)
const restoreId = ref('')
const restoring = ref(false)
const restoreMsg = ref('')
const restoreError = ref(false)

const maskedId = computed(() =>
  backupId.length > 8 ? backupId.slice(0, 4) + '••••••' + backupId.slice(-4) : '••••••••'
)

async function copyId() {
  try {
    await navigator.clipboard.writeText(backupId)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    showId.value = true
  }
}

async function doRestore() {
  restoring.value = true
  restoreMsg.value = ''
  const ok = await restoreFromId(restoreId.value)
  restoring.value = false
  restoreError.value = !ok
  if (ok) {
    restoreMsg.value = '恢复成功，即将刷新页面…'
    setTimeout(() => location.reload(), 1200)
  } else {
    restoreMsg.value = '恢复失败：ID 无效或云端没有该 ID 的备份'
  }
}

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
.hero {
  margin-top: 24px;
  text-align: center;
  padding: 48px 24px;
  background: linear-gradient(135deg, #4f6df5 0%, #7a5cf6 100%);
  color: #fff;
}
.hero h1 { font-size: 30px; margin-bottom: 12px; letter-spacing: -0.5px; }
.hero p { color: rgba(255, 255, 255, 0.85); max-width: 520px; margin: 0 auto 24px; }
.hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.hero .btn { background: #fff; color: var(--primary); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15); }
.hero .btn:hover { background: #f0f2ff; }
.hero .btn.outline { background: transparent; color: #fff; border-color: rgba(255, 255, 255, 0.7); box-shadow: none; }
.hero .btn.outline:hover { background: rgba(255, 255, 255, 0.12); }
@media (max-width: 640px) {
  .hero { padding: 32px 16px; border-radius: 0 0 20px 20px; margin: 0 -14px; }
  .hero h1 { font-size: 23px; letter-spacing: 0; }
  .hero p { font-size: 13px; }
}
.stats { grid-template-columns: repeat(4, 1fr); margin-top: 20px; }
@media (max-width: 640px) { .stats { grid-template-columns: repeat(2, 1fr); } }
.stat { text-align: center; padding: 18px 8px; }
.num { font-size: 26px; font-weight: 700; color: var(--primary); }
@media (max-width: 640px) { .num { font-size: 21px; } }
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
.backup-card { margin-top: 32px; }
.backup-card h3 { font-size: 16px; margin-bottom: 6px; }
.backup-desc { color: var(--text-light); font-size: 13px; margin-bottom: 12px; }
.backup-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.backup-id {
  background: var(--bg);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  word-break: break-all;
  flex: 1;
  min-width: 200px;
}
.mini-btn {
  border: 1px solid var(--border);
  background: #fff;
  padding: 7px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--primary);
}
.restore { margin-top: 14px; }
.restore summary { cursor: pointer; color: var(--primary); font-size: 14px; }
.restore-body { display: flex; gap: 8px; align-items: center; margin-top: 10px; flex-wrap: wrap; }
.restore-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
}
.restore-msg { width: 100%; font-size: 13px; color: var(--success); margin: 4px 0 0; }
.restore-msg.error { color: var(--danger); }
.settings-card { margin-top: 32px; }
.settings-card h3 { font-size: 16px; margin-bottom: 12px; }
.setting-rows { display: flex; flex-direction: column; gap: 10px; }
.setting-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 14px; }
.setting-row select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
}
.settings-tip { margin-top: 10px; font-size: 12px; color: var(--text-light); }
.paths { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
.path { transition: transform 0.15s, box-shadow 0.15s; }
.path:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(31, 36, 48, 0.1); }
.emoji { font-size: 32px; margin-bottom: 8px; }
.path h3 { margin-bottom: 6px; }
.path p { color: var(--text-light); font-size: 13px; }
</style>
