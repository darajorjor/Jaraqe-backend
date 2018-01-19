import mongoose from 'connections/mongo'
import boardDefaults from 'src/constants/defaults/board.default'
import boardEnums from 'src/constants/enums/board.enum'
import uuid from 'uuid/v4'

const GameSchema = new mongoose.Schema({
  players: [{
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      allowNull: false,
    },
    score: {
      type: Number,
      default: 0,
    },
    timeLeft: Number,
    shouldPlayNext: {
      type: Boolean,
      default: false,
      allowNull: false,
    },
  }],
  board: {
    type: mongoose.Schema.ObjectId,
    ref: 'Board',
    allowNull: false,
  },
  history: [{
    player: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      allowNull: false,
    },
    lettersUsed: [{
      letterId: mongoose.Schema.ObjectId,
      letterValue: String,
      coordinates: {
        row: Number,
        col: Number,
      },
      bonus: {
        type: String,
        enum: Object.values(boardEnums.BONUSES)
      }
    }],
    wordId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Word',
      allowNull: false,
    },
    word: String,
    wordPoint: Number,
    time: Date,
  }],
  letters: [{
    _id: false,
    id: {
      type: String,
      default: uuid,
    },
    value: String,
    point: Number,
    isUsed: {
      type: Boolean,
      default: false,
    }
  }],
}, { timestamps: true })

GameSchema.pre('save', function (next) {
  if (this.isNew) {
    this.letters = boardDefaults.LETTERS.map(({ value, point }) => ({
      value,
      point
    }))
  }

  next()
})

const Game = mongoose.model('Game', GameSchema);

export default Game;

/**
 * players: [
 *   {
 *     user_id: UUID,
 *     score: Int,
 *     time_left: Int,
 *     should_play_next: Boolean,
 *   }
 * ],
 * board: Board,
 * history: [
 *   {
 *     player: user_id,
 *     letters_used: [
 *       {
 *         letterId: UUID,
 *         letterValue: String,
 *         coordinates: {
 *           row: 6,
 *           column: 12,
 *         },
 *         bonus: ENUM(TW, DW, TL, DL)
 *       }
 *     ],
 *     word: Word (in dictionary),
 *     wordPoint: Int,
 *     time: Date,
 *   }
 * ],
 * letters: [
 *   {
 *     id: UUID,
 *     value: String,
 *   }
 * ]
 *
 * =====================>
 * CLIENTS SEND:
 * {
 *   letters: [
 *     {
 *       id: UUID,
 *       coordinates: {
 *         row: 6,
 *         column: 12
 *       },
 *     }
 *   ]
 * }
 *
 * =====================>
 * CLIENTS RECEIVE - first turn:
 * {
 *   game: {
 *
 *   }
 * }
 *
 * */
