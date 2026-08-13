import { primaryBooks } from './primary/index.js'
import { juniorBooks } from './junior.js'
import { seniorBooks } from './senior.js'

export const books = [...primaryBooks, ...juniorBooks, ...seniorBooks]

export const stages = ['小学', '初中', '高中']

export function getBook(bookId) {
  return books.find((b) => b.id === bookId)
}

export function getUnit(bookId, unitId) {
  const book = getBook(bookId)
  return book?.units.find((u) => u.id === unitId)
}

export function wordKey(bookId, unitId, word) {
  return `${bookId}/${unitId}/${word[0]}`
}

const lookup = new Map()
for (const book of books) {
  for (const unit of book.units) {
    for (const word of unit.words) {
      lookup.set(wordKey(book.id, unit.id, word), {
        en: word[0],
        phonetic: word[1],
        cn: word[2],
        bookId: book.id,
        bookTitle: book.title,
        unitId: unit.id,
        unitTitle: unit.title,
      })
    }
  }
}

export function findWord(key) {
  return lookup.get(key)
}
