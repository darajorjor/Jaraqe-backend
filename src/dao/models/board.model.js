import mongoose from 'connections/mongo'

const BoardSchema = new mongoose.Schema({
  pattern: [[String]],
}, { timestamps: true })

const Board = mongoose.model('Board', BoardSchema);

export default Board;
