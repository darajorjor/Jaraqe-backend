import { Word } from 'models'
import sq from 'sqlite3'

let db = new sq.Database('./moin.db', sq.OPEN_READWRITE, (err => {
  if (err) {
    return console.error(err)
  }

  console.log('Connected to the moin database.');
}))

let count = 0
let errors = 0
db.serialize(() => {
  db.each(`SELECT * FROM moin_table`, (err, { word, meaning }) => {
    if (err) {
      console.error(err.message);
    }

    if (meaning) {
      const meanings = meaning.toUpperCase().split('<BR>').filter(Boolean)

      const w = new Word({
        word,
        sourceDictionary: 'MOIN',
        language: 'fa',
        definitions: meanings.map(m => ({ text: m }))
      })

      w.save()
        .then(() => {
          count++
          console.log(word, ' ', count)
        })
        .catch(() => {
          errors++
          console.error(word, ' Errored')
        })
    }
  });
});
