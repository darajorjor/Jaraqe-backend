import WordRepo from 'repositories/word.repository'
import messages from 'src/constants/defaults/messages.default'
import Wikipedia from 'src/utils/wikipedia'

export default {
  async getWordsInfo(wordIds) {
    const result = []
    await Promise.all(wordIds.map(async (wordId) => {
      let word = await WordRepo.findById(wordId)

      if (!word) {
        throw new Error(messages.WORD_NOT_FOUND)
      }

      if (!word.wikiChecked || (Math.abs(new Date() - word.wikiChecked) > (30 * 60 * 60 * 1000))) {
        word.wiki = await Wikipedia.query(word.word)
        word.wikiChecked = new Date()
        word = await word.save()
      }

      result.push(word.toObject())
    }))

    return result
  },
}