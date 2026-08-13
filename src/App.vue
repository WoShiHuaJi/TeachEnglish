<template>
  <div class="layout">
    <header class="header">
      <div class="container header-inner">
        <router-link to="/" class="logo">📚 英语学习乐园</router-link>
        <nav class="nav">
          <router-link to="/phonetics">音标</router-link>
          <router-link to="/grammar">语法</router-link>
          <router-link to="/vocabulary">单词<span v-if="!phoneticsMastered"> 🔒</span></router-link>
          <router-link to="/review" class="review-link">
            复习
            <span v-if="badgeCount > 0" class="badge">{{ badgeCount }}</span>
          </router-link>
        </nav>
      </div>
    </header>
    <main class="main container">
      <router-view />
    </main>
    <footer class="footer">从音标到单词，循序渐进 · 遵循艾宾浩斯遗忘曲线科学复习</footer>
    <nav class="tabbar">
      <router-link to="/" class="tab">
        <span class="icon">🏠</span>首页
      </router-link>
      <router-link to="/phonetics" class="tab">
        <span class="icon">🔤</span>音标
      </router-link>
      <router-link to="/grammar" class="tab">
        <span class="icon">📖</span>语法
      </router-link>
      <router-link to="/vocabulary" class="tab">
        <span class="icon">📝</span>单词<span v-if="!phoneticsMastered">🔒</span>
      </router-link>
      <router-link to="/review" class="tab">
        <span class="icon">⏰</span>复习
        <span v-if="badgeCount > 0" class="badge">{{ badgeCount }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgress } from './composables/useProgress'
import { usePhonetics } from './composables/usePhonetics'

const { dueCount } = useProgress()
const { phoneticsMastered, remainingCount, duePhonemeCount } = usePhonetics()

const badgeCount = computed(() =>
  phoneticsMastered.value ? dueCount.value + duePhonemeCount.value : remainingCount.value
)
</script>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; }
.header {
  background: #fff;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}
.header-inner { display: flex; align-items: center; justify-content: space-between; height: 60px; }
.logo { font-size: 18px; font-weight: 700; color: var(--primary); }
.nav { display: flex; gap: 4px; }
.nav a {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 15px;
  color: var(--text-light);
  position: relative;
}
.nav a:hover { background: var(--bg); color: var(--text); }
.nav a.router-link-active { color: var(--primary); background: var(--primary-light); font-weight: 600; }
.badge {
  position: absolute;
  top: 0;
  right: -2px;
  background: var(--danger);
  color: #fff;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
.main { flex: 1; padding-bottom: 48px; }
.footer {
  text-align: center;
  color: var(--text-light);
  font-size: 13px;
  padding: 24px;
  border-top: 1px solid var(--border);
  background: #fff;
}
.tabbar { display: none; }

@media (max-width: 640px) {
  .header .nav { display: none; }
  .header-inner { justify-content: center; }
  .main { padding-bottom: 90px; }
  .footer { display: none; }
  .tabbar {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1px solid var(--border);
    padding-bottom: env(safe-area-inset-bottom);
    z-index: 20;
  }
  .tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 0 6px;
    font-size: 11px;
    color: var(--text-light);
    position: relative;
  }
  .tab .icon { font-size: 20px; }
  .tab.router-link-active { color: var(--primary); font-weight: 600; }
}
</style>
