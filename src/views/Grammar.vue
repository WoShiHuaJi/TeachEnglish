<template>
  <div>
    <h1 class="page-title">英语语法</h1>
    <p class="page-desc">覆盖小学到高中核心语法点，点击卡片查看详细讲解。</p>

    <div class="grid topics">
      <router-link
        v-for="topic in grammarTopics"
        :key="topic.id"
        :to="`/grammar/${topic.id}`"
        class="card topic"
      >
        <div class="top-row">
          <h3>{{ topic.title }}</h3>
          <span class="tag">{{ topic.level }}</span>
        </div>
        <p>{{ topic.summary }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { grammarTopics } from '../data/grammar'
</script>

<style scoped>
.topics { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
.topic { transition: transform 0.15s; }
.topic:hover { transform: translateY(-3px); }
.top-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
.topic p { color: var(--text-light); font-size: 14px; }
</style>
