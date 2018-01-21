import mongoose from 'connections/mongo'
import boardEnums from 'src/constants/enums/board.enum'
import uuid from 'uuid/v4'
import Board from './board.model'
import shuffleArray from '../../utils/helpers/shuffleArray'

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
    rack: [{
      _id: false,
      id: String,
      value: String,
      point: Number
    }]
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
      letterId: String,
      letterValue: String,
      letterPoint: Number,
      letterBonus: {
        type: String,
        enum: Object.values(boardEnums.BONUSES)
      },
      coordinates: {
        row: Number,
        col: Number,
      },
    }],
    wordId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Word',
      allowNull: false,
    },
    word: String,
    wordPoint: Number,
    wordBonus: {
      type: String,
      allowNull: true
    },
    totalScore: Number,
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

GameSchema.methods = {
  async fillBoard() {
    const board = await Board.findById(this.board)
    const { pattern } = board.toObject()
    this.history.map((history) => {
      history.lettersUsed.map((letter) => {
        const { row, col } = letter.coordinates

        pattern[row][col] = {
          id: letter.letterId,
          point: letter.letterPoint,
          value: letter.letterValue,
        }
      })
    })

    function isFull(tile) {
      return tile && tile.value
    }

    return pattern.map((row, rowIndex) => {
      return row.map((column, columnIndex) => {
        if (column && column.value) {
          column.options = {
            right: isFull(pattern[rowIndex] ? pattern[rowIndex][columnIndex + 1] : false),
            left: isFull(pattern[rowIndex] ? pattern[rowIndex][columnIndex - 1] : false),
            top: isFull(pattern[rowIndex - 1] ? pattern[rowIndex - 1][columnIndex] : false),
            bottom: isFull(pattern[rowIndex + 1] ? pattern[rowIndex + 1][columnIndex] : false),
          }
        }

        return column
      })
    })
  },
  async play({ userId, letters, word, wordBonus, wordPoint, score }) {
    // add history
    this.history.push({
      player: userId,
      lettersUsed: letters.map(l => ({
        letterId: l.id,
        letterValue: l.value,
        letterPoint: l.point,
        letterBonus: l.bonus,
        coordinates: l.coordinates,
      })),
      wordId: word._id,
      word: word.word,
      wordPoint,
      wordBonus,
      totalScore: score,
      time: new Date(),
    })

    const shouldPlayNext = this.players.filter(p => p.userId !== userId)[Math.floor(Math.random() * this.players.length)].userId

    // use letters
    this.letters = this.letters.map((letter) => {
      letters.forEach(l => {
        if (l.id === letter.id) {
          letter.isUsed = true
        }
      })

      return letter
    })

    // change turn
    this.players = this.players.map((player) => {
      if (player.userId.toString() === shouldPlayNext.toString()) {
        player.shouldPlayNext = true
      }

      if (player.userId.toString() === userId) {
        player.shouldPlayNext = false
        player.rack = player.rack.filter(l => !letters.map(i => i.id).includes(l.id))
        player.rack.push(...shuffleArray(this.letters.filter(l => !l.isUsed)).splice(0, (7 - player.rack.length)))
      }

      return player
    })

    return this.save()
  },
}

const Game = mongoose.model('Game', GameSchema);

export default Game;
