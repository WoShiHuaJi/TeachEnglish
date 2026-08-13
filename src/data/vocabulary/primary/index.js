// 人教版小学英语单词汇总（一年级起点新起点 + 三年级起点 PEP）
import { grade12Books } from './grade12.js'
import { grade3Books } from './grade3.js'
import { grade4Books } from './grade4.js'
import { grade5Books } from './grade5.js'
import { grade6Books } from './grade6.js'

export const primaryBooks = [
  ...grade12Books,
  ...grade3Books,
  ...grade4Books,
  ...grade5Books,
  ...grade6Books,
]
