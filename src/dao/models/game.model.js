import mongoose from 'connections/mongo'
import boardEnums from 'src/constants/enums/board.enum'
import statuses from 'src/constants/enums/status.enum'
import attachmentTypes from 'src/constants/enums/attachmentTypes.enum'
import uuid from 'uuid/v4'
import Board from './board.model'
import shuffleArray from '../../utils/helpers/shuffleArray'
import UserRepo from 'repositories/user.repository'
import config from 'src/config/app.config'
import wordService from 'src/modules/words/services/word.service'

const Message = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    allowNull: false,
  },
  message: {
    type: String,
    allowNull: false,
  },
  attachment: {
    type: {
      type: String,
      enum: Object.values(attachmentTypes),
    },
    url: String,
  },
  status: {
    type: String,
    enum: Object.values(statuses.CHAT),
    default: statuses.CHAT.PENDING,
  },
  time: {
    type: Date,
    default: new Date
  }
})

const GameSchema = new mongoose.Schema({
  coinPrize: {
    type: Number,
    allowNull: false,
    default: config.values.gameDefaultCoinPrize,
  },
  players: {
    type: [{
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
      }],
    }],
    default: [],
  },
  winner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  turnTime: {
    type: Number, // in minutes
    default: config.values.gameDefaultTurnTime,
  },
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
      _id: false,
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
    words: [{
      _id: false,
      id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Word',
        allowNull: false,
      },
      word: String,
      letters: [{
        _id: false,
        id: String,
        value: String,
        point: Number,
        letterBonus: {
          type: String,
          enum: Object.values(boardEnums.BONUSES)
        },
        coordinates: {
          row: Number,
          col: Number,
        },
      }],
      score: Number,
      wordPoint: Number,
      wordBonus: {
        type: String,
        allowNull: true
      },
    }],
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
    bonus: String,
    isUsed: {
      type: Boolean,
      default: false,
    }
  }],
  alerts: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      allowNull: false,
    },
    atHour: Number,
    turn: mongoose.Schema.ObjectId,
  }],
  messages: [Message],
  status: {
    type: String,
    enum: Object.values(statuses.GAME),
    default: statuses.GAME.ACTIVE,
  }
}, { timestamps: true })

GameSchema.methods = {
  async fillBoard() {
    const board = await Board.findById(this.board)
    const { pattern } = board.toObject()
    this.history.map((history) => {
      history.words.map((word) => {
        word.letters.map((letter) => {
          const { row, col } = letter.coordinates

          pattern[row][col] = {
            id: letter.id,
            point: letter.point,
            value: letter.value,
            bonus: pattern[row][col] ? pattern[row][col] : undefined,
            usedInWords: pattern[row][col] && pattern[row][col].id ? [
              ...pattern[row][col].usedInWords,
              word.id,
            ] : [word.id]
          }
        })
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
  async play({ userId, letters, words }) {
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
      words,
      totalScore: words.reduce((total, i) => ({ score: total.score + i.score }), { score: 0 }).score,
      time: new Date(),
    })

    // selecting next player
    const shouldPlayNext = this.players.filter(p => p.userId.toString() !== userId)[0].userId

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
      player.shouldPlayNext = player.userId.toString() === shouldPlayNext.toString()

      if (player.userId.toString() === userId) {
        player.shouldPlayNext = false
        player.rack = player.rack.filter(l => !letters.map(i => i.id).includes(l.id))
        player.rack = wordService.controlLetters(this.letters, player.rack)
      }

      return player
    })

    await Game.populate(this, { path: 'board' })
    await Game.populate(this, { path: 'players.userId' })

    return this.save()
  },
  async chat({ userId, text }) {
    this.messages.push({
      sender: userId,
      message: text,
    })

    const savedGame = await this.save()

    const lastMessage = savedGame.messages[savedGame.messages.length - 1].toObject()
    lastMessage.sender = await UserRepo.findById(lastMessage.sender)

    return lastMessage
  },
  async seeMessages(userId) {
    this.messages = this.messages.map(i => {
      if (i.sender.toString() !== userId) {
        if (i.status === statuses.CHAT.PENDING) {
          i.status = statuses.CHAT.SEEN
        }
      }

      return i
    })

    return this.save()
  },
  async logAlert({ user, atHour, turn }) {
    if (!this.alerts.find(a => (a.atHour === atHour && a.turn.toString() === turn.toString()))) {
      this.alerts.push({
        user,
        atHour,
        turn,
      })

      return this.save()
    }

    return true
  },
}

const Game = mongoose.model('Game', GameSchema)

export default Game
