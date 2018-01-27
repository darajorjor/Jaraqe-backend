import mongoose from 'connections/mongo'

const WordSchema = new mongoose.Schema({
  word: {
    type: String,
    allowNull: false,
  },
  sourceDictionary: String,
  language: {
    type: String,
    allowNull: false,
  },
  wiki: [{
    _id: false,
    title: String,
    pageId: Number,
  }],
  wikiChecked: Date,
  definitions: [
    {
      _id: false,
      text: String
    },
  ],
}, { timestamps: false })

const Word = mongoose.model('Word', WordSchema);

export default Word;
