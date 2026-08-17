<template>
  <div v-if="topic">
    <router-link to="/grammar" class="back">← 返回语法列表</router-link>
    <div class="card article-card">
      <div class="head">
        <h1>{{ topic.title }}</h1>
        <span class="tag">{{ topic.level }}</span>
      </div>
      <div class="article" v-html="topic.content"></div>
    </div>

    <div class="prev-next">
      <router-link v-if="prev" :to="`/grammar/${prev.id}`" class="btn outline">← {{ prev.title }}</router-link>
      <span v-else></span>
      <router-link v-if="next" :to="`/grammar/${next.id}`" class="btn outline">{{ next.title }} →</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { grammarTopics } from '../data/grammar'

const route = useRoute()
const index = computed(() => grammarTopics.findIndex((t) => t.id === route.params.id))
const topic = computed(() => grammarTopics[index.value])
const prev = computed(() => grammarTopics[index.value - 1])
const next = computed(() => grammarTopics[index.value + 1])
</script>

<style scoped>
.back { color: var(--primary); font-size: 14px; display: inline-block; margin-top: 20px; }
.article-card { margin-top: 12px; }
.head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.article :deep(h3) { margin: 20px 0 8px; font-size: 17px; color: var(--primary-dark); }
.article :deep(p) { margin: 6px 0; }
.article :deep(ul) { padding-left: 22px; margin: 6px 0; }
.article :deep(table) { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 14px; }
.article :deep(th), .article :deep(td) { border: 1px solid var(--border); padding: 8px 10px; text-align: left; }
.article :deep(th) { background: var(--primary-light); }
.article :deep(.tip-box) {
  background: #fff8e6;
  border-left: 4px solid var(--warning);
  padding: 10px 14px;
  border-radius: 8px;
  margin: 12px 0;
  font-size: 14px;
}
.prev-next { display: flex; justify-content: space-between; margin-top: 20px; }
@media (max-width: 640px) {
  .article { font-size: 15px; }
  .article :deep(h3) { font-size: 16px; margin: 16px 0 6px; }
  .article :deep(table) { font-size: 13px; }
  .article :deep(th), .article :deep(td) { padding: 6px 8px; }
  .article-card { overflow-x: auto; }
}
</style>
