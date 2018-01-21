import { Word } from 'models'

(async () => {
  const words = await Word.find()

  await Promise.all(words.map(async (word) => {
    word.word = word.word.replace('آ', 'ا')

    await word.save()
  }))

  console.log('success')
})()