import UserRepo from 'repositories/user.repository'
import WordRepo from 'repositories/word.repository'
import GameRepo from 'repositories/game.repository'
import BoardRepo from 'repositories/board.repository'
import shuffleArray from 'src/utils/helpers/shuffleArray'
import boardDefaults from 'src/constants/defaults/board.default'
import messages from 'src/constants/defaults/messages.default'
import uuid from 'uuid/v4'

export default {
  match(userId) {
    return UserRepo.findOne({ _id: { $ne: userId } })
  },

  async startGame({ player, player2 }) {
    const selectedBoard = await BoardRepo.selectBoard()
    const letters = boardDefaults.LETTERS.map(({ value, point }) => ({
      id: uuid(),
      value,
      point
    }))
    const shuffledLetters = shuffleArray(letters)
    const game = await GameRepo.createGame({
      players: [
        {
          userId: player,
          rack: shuffledLetters.splice(0, 7),
        },
        {
          userId: player2.toString(),
          rack: shuffledLetters.splice(0, 7),
        },
      ],
      board: selectedBoard.id,
      letters,
    })

    return this.transformGame(player, game.toObject())
  },

  async listGames({ userId, lastKey }) {
    const games = await GameRepo.list({ userId, lastKey })
    return Promise.all(games.map(async g => {
        const pattern = await g.fillBoard()
        g = g.toObject()
        g.board.pattern = pattern
        return this.transformGame(userId, g)
      })
    )
  },

  async validateLetters({ userId, gameId, letters }) {
    const game = await GameRepo.findOne({ _id: gameId })
    let wordBonus = null
    // check if the letters are in the player's rack
    const player = game.players.find((player) => player.userId.toString() === userId)

    if (!player) {
      throw new Error(messages.NOT_YOUR_GAME)
    }

    const { rack } = player

    let valid = true
    letters = letters.map((letter) => {
      let found = false
      rack.forEach((rackLetter) => {
        if (rackLetter.id === letter.id) {
          found = true
          letter.value = rackLetter.value
          letter.point = rackLetter.point
        }
      })

      if (!found) {
        valid = false
      }

      return letter
    })

    if (!valid) {
      throw new Error(messages.LETTER_NOT_VALID)
    }

    // check if the letters position is valid and not taken
    const filledBoard = await game.fillBoard()

    letters = letters.map((letter) => {
      const { coordinates: { row, col } } = letter

      if (filledBoard[row][col] && typeof filledBoard[row][col] === 'object') {
        valid = false
      }

      if (filledBoard[row][col] && typeof filledBoard[row][col] === 'string') {
        switch (filledBoard[row][col]) {
          case 'TW':
            wordBonus = 'TW'
            break
          case 'DW':
            wordBonus = 'DW'
            break
          case 'TL':
            letter.point *= 3
            letter.bonus = 'TL'
            break
          case 'DL':
            letter.point *= 2
            letter.bonus = 'DL'
            break
        }
      }

      return letter
    })

    if (!valid) {
      throw new Error(messages.LETTER_NOT_VALID)
    }

    // check if at least one letter touches old letters
    if (game.history.length > 0) {
      //TODO
    }


    // check if letters are more than 1
    if (letters.length === 1) {
      throw new Error(messages.LETTER_NOT_VALID)
    }

    // check if letters are together in the same line
    let firstRow = letters[0].coordinates.row
    let firstCol = letters[0].coordinates.col

    let allInRow = true
    let allInColumn = true
    letters.forEach(({ coordinates: { row, col } }) => {
      if (row !== firstRow) {
        allInRow = false
      }
      if (col !== firstCol) {
        allInColumn = false
      }
    })

    if (!allInColumn && !allInRow) {
      throw new Error(messages.LETTER_NOT_VALID)
    }


    // calculating score
    let totalPoints = letters.reduce((total, i) => ({ point: total.point + i.point })).point
    const wordPoint = totalPoints

    switch (wordBonus) {
      case 'TW':
        totalPoints *= 3
        break
      case 'DW':
        totalPoints *= 2
        break
    }

    return {
      letters,
      direction: allInColumn ? 'vertical' : 'horizontal',
      score: totalPoints,
      game,
      wordPoint,
      wordBonus
    }
  },

  async checkWord(direction, letters) {
    let word = ''
    switch (direction) {
      case 'horizontal':
        letters.sort((a, b) => b.coordinates.col - a.coordinates.col).forEach((letter) => {
          word += letter.value
        })
        break
      case 'vertical':
        letters.sort((a, b) => a.coordinates.row - b.coordinates.row).forEach((letter) => {
          word += letter.value
        })
        break
    }

    const findResult = await WordRepo.find(word)

    if (!findResult) {
      throw new Error(messages.WORD_NOT_IN_DICTIONARY)
    }

    return findResult
  },

  async play({ userId, word, score, letters, game, wordBonus, wordPoint }) {
    const canPlay = game.players.find(p => p.userId.toString() === userId).shouldPlayNext

    if (!canPlay) {
      throw new Error(messages.NOT_YOUR_TURN)
    }

    return game.play({
      userId,
      letters,
      word,
      wordBonus,
      wordPoint,
      score,
    })
  },

  transformGame(userId, game) {
    game.players = game.players.map((player) => {
      if (player.userId._id) {
        if (player.userId._id.toString() !== userId) { // populated
          delete player.rack
        }
      } else {
        if (player.userId.toString() !== userId) { // not populated
          delete player.rack
        }
      }

      return player
    })

    return game
  },

}