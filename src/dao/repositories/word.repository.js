import { Word } from 'models'

export default {
  find(word) {
    return Word.findOne({ word })
  },
  findById(id) {
    return Word.findById(id)
  },
}
