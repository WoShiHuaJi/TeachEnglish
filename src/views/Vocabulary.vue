<template>
  <div>
    <h1 class="page-title">英语单词</h1>
    <p class="page-desc">人教版教材同步单词，选择教材与单元开始学习。</p>

    <div class="tabs">
      <button
        v-for="s in stages"
        :key="s"
        :class="{ active: stage === s }"
        @click="stage = s; selectedBook = null"
      >{{ s }}</button>
    </div>

    <div v-if="!selectedBook" class="grid books">
      <div
        v-for="book in stageBooks"
        :key="book.id"
        class="card book"
        @click="selectedBook = book"
      >
        <h3>{{ book.title }}</h3>
        <p>{{ book.units.length }} 个单元 · {{ countWords(book) }} 个单词</p>
        <div class="progress-bar">
          <div class="fill" :style="{ width: bookProgress(book) + '%' }"></div>
        </div>
      </div>
      <div v-if="stageBooks.length === 0" class="card empty">
        该学段单词数据整理中，敬请期待 🚧
      </div>
    </div>

    <div v-else>
      <button class="back-btn" @click="selectedBook = null">← 返回{{ stage }}教材</button>
      <h2 class="book-title">{{ selectedBook.title }}</h2>
      <div class="grid units">
        <router-link
          v-for="unit in selectedBook.units"
          :key="unit.id"
          :to="`/learn/${selectedBook.id}/${unit.id}`"
          class="card unit"
        >
          <h3>{{ unit.title }}</h3>
          <p>{{ unit.words.length }} 个单词</p>
          <span v-if="unitLearned(selectedBook.id, unit) > 0" class="tag">
            已学 {{ unitLearned(selectedBook.id, unit) }}/{{ unit.words.length }}
          </span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { books, stages, wordKey } from '../data/vocabulary'
import { useProgress } from '../composables/useProgress'

const { state } = useProgress()
const stage = ref('小学')
const selectedBook = ref(null)

const stageBooks = computed(() => books.filter((b) => b.stage === stage.value))

function countWords(book) {
  return book.units.reduce((sum, u) => sum + u.words.length, 0)
}

function unitLearned(bookId, unit) {
  return unit.words.filter((w) => state.words[wordKey(bookId, unit.id, w)]).length
}

function bookProgress(book) {
  const total = countWords(book)
  if (!total) return 0
  const learned = book.units.reduce((sum, u) => sum + unitLearned(book.id, u), 0)
  return Math.round((learned / total) * 100)
}
</script>

<style scoped>
.tabs { display: flex; gap: 8px; margin-bottom: 24px; }
.tabs button {
  padding: 8px 24px;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-light);
}
.tabs button.active { background: var(--primary); border-color: var(--primary); color: #fff; }
.books { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
.book { cursor: pointer; transition: transform 0.15s; }
.book:hover { transform: translateY(-3px); }
.book p { color: var(--text-light); font-size: 13px; margin: 6px 0 12px; }
.progress-bar { height: 6px; background: var(--bg); border-radius: 999px; overflow: hidden; }
.fill { height: 100%; background: var(--success); border-radius: 999px; transition: width 0.3s; }
.empty { grid-column: 1 / -1; text-align: center; color: var(--text-light); padding: 48px; }
.back-btn { border: none; background: none; color: var(--primary); cursor: pointer; font-size: 14px; margin-bottom: 8px; }
.book-title { margin-bottom: 16px; }
.units { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
.unit { transition: transform 0.15s; }
.unit:hover { transform: translateY(-3px); }
.unit p { color: var(--text-light); font-size: 13px; margin: 4px 0 8px; }
</style>
