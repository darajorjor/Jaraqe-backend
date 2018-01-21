import UserRepo from 'repositories/user.repository'
import WordRepo from 'repositories/word.repository'
import GameRepo from 'repositories/game.repository'
import BoardRepo from 'repositories/board.repository'
import shuffleArray from 'src/utils/helpers/shuffleArray'
import boardDefaults from 'src/constants/defaults/board.default'
import messages from 'src/constants/defaults/messages.default'
import uuid from 'uuid/v4'
import { checkSiblingTiles } from '../../../utils/helpers/game.hepler'

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
          shouldPlayNext: true,
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
    debugger
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

    // check if letters are more than 1 if first turn
    if (letters.length === 1 && game.history.length < 1) {
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

    // check if at least one letter touches old letters
    // check validity with old characters
    const words = []
    function calcWord(arrOfLetters) {
      let totalPoints = arrOfLetters.reduce((total, i) => ({ point: total.point + i.point })).point
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
        score: totalPoints,
        wordPoint,
        wordBonus,
      }
    }
    function getWordFromLetters(arr, allInColumn, allInRow, sort) {
      let word = ''
      if (allInColumn) {
        if (sort) {
          arr.sort((a, b) => a.coordinates.row - b.coordinates.row).forEach((letter) => {
            word += letter.value
          })
        } else {
          arr.reverse().forEach((letter) => {
            word += letter.value
          })
        }
      } else if (allInRow) {
        if (sort) {
          arr.sort((a, b) => b.coordinates.col - a.coordinates.col).forEach((letter) => {
            word += letter.value
          })
        } else {
          arr.reverse().forEach((letter) => {
            word += letter.value
          })
        }
      }

      return word
    }
    if (game.history.length > 0) {
      function letterHandler(letter) {
        const { coordinates: { row, col } } = letter

        const { top, bottom, left, right } = checkSiblingTiles(filledBoard, row, col)
        let topWords = []
        if (top) topWords.push(top)
        let bottomWords = []
        if (bottom) bottomWords.push(bottom)
        let leftWords = []
        if (left) leftWords.push(left)
        let rightWords = []
        if (right) rightWords.push(right)

        if (top) {
          let rowIndex = row
          while (top) {
            let t = checkSiblingTiles(filledBoard, rowIndex - 1, col).top

            if (t) {
              rowIndex--
              topWords.push(t)
            } else {
              break
            }
          }
        }
        if (bottom) {
          let rowIndex = row
          while (bottom) {
            let t = checkSiblingTiles(filledBoard, rowIndex + 1, col).bottom

            if (t) {
              rowIndex++
              bottomWords.push(t)
            } else {
              break
            }
          }
        }
        if (left) {
          let colIndex = col
          while (left) {
            let t = checkSiblingTiles(filledBoard, row, colIndex - 1).left

            if (t) {
              colIndex--
              leftWords.push(t)
            } else {
              break
            }
          }
        }
        if (right) {
          let colIndex = col
          while (right) {
            let t = checkSiblingTiles(filledBoard, row, colIndex + 1).right

            if (t) {
              colIndex++
              rightWords.push(t)
            } else {
              break
            }
          }
        }

        return {
          topWords,
          leftWords,
          rightWords,
          bottomWords,
        }
      }

      if (letters.length === 1) {
        const letter = letters[0]
        const {
          topWords,
          bottomWords,
          leftWords,
          rightWords,
        } = letterHandler(letter)

        if (topWords.length === 0 && bottomWords.length === 0 && leftWords.length === 0 && rightWords.length === 0) {
          throw new Error(messages.SHOULD_TOUCH_OLD_TILES)
        }

        if (topWords.length !== 0 || bottomWords.length !== 0) {
          let columnLetters = [
            ...topWords,
            letter,
            ...bottomWords
          ]

          words.push({
            word: `${getWordFromLetters(topWords, true)}${letter.value}${getWordFromLetters(bottomWords, true)}`,
            letters: columnLetters,
            ...calcWord(columnLetters)
          })
        }

        if (rightWords.length !== 0 || leftWords.length !== 0) {
          let rowLetters = [
            ...rightWords,
            letter,
            ...leftWords
          ]
          words.push({
            word: `${getWordFromLetters(rightWords, false, true)}${letter.value}${getWordFromLetters(leftWords, false, true)}`,
            letters: rowLetters,
            ...calcWord(rowLetters)
          })
        }
      } else {
        let wordSuffix = []
        let wordPrefix = []
        let touchesOldTiles = false
        letters.forEach((letter) => {
          const {
            topWords,
            bottomWords,
            leftWords,
            rightWords,
          } = letterHandler(letter)

          if (topWords.length === 0 && bottomWords.length === 0 && leftWords.length === 0 && rightWords.length === 0) {
            return null
          }

          touchesOldTiles = true

          if (allInRow) {
            wordSuffix.push(...leftWords)
            wordPrefix.push(...rightWords)
            if (topWords.length === 0 && bottomWords.length === 0 ) {
              return null
            }
            let sideLetters = [
              ...topWords,
              letter,
              ...bottomWords
            ]

            if (topWords || bottomWords) {
              words.push({
                word: `${getWordFromLetters(topWords, true)}${letter.value}${getWordFromLetters(bottomWords, true)}`,
                letters: sideLetters,
                ...calcWord(sideLetters)
              })
            }
          } else if (allInColumn) {
            wordSuffix.push(...bottomWords)
            wordPrefix.push(...topWords)
            if (rightWords.length === 0 && leftWords.length === 0 ) {
              return null
            }
            let sideLetters = [
              ...rightWords,
              letter,
              ...leftWords
            ]

            if (leftWords || rightWords) {
              words.push({
                word: `${getWordFromLetters(rightWords, false, true)}${letter.value}${getWordFromLetters(leftWords, false, true)}`,
                letters: sideLetters,
                ...calcWord(sideLetters)
              }) // word here!
            }
          }
        })

        if (!touchesOldTiles) {
          throw new Error(messages.SHOULD_TOUCH_OLD_TILES)
        }

        let mainLetters = [
          ...wordPrefix,
          ...letters,
          ...wordSuffix
        ]

        words.push({
          word: `${wordPrefix.map(l => l.value)}${getWordFromLetters(letters, allInColumn, allInRow, true)}${wordSuffix.map(l => l.value)}`,
          letters: mainLetters,
          ...calcWord(mainLetters)
        }) // word here!
      }
    } else {
      words.push({
        word: getWordFromLetters(letters, allInColumn, allInRow, true),
        letters: letters,
        ...calcWord(letters)
      })
    }

    debugger

    return {
      letters,
      words,
      game,
    }
  },

  async checkWord(word) {
    console.log('Searching database for word: ', word)
    const findResult = await WordRepo.find(word)

    if (!findResult) {
      throw new Error(messages.WORD_NOT_IN_DICTIONARY)
    } else {
      console.log('Found ', findResult)
    }

    return findResult
  },

  async play({ userId, words, letters, game }) {
    const canPlay = game.players.find(p => p.userId.toString() === userId).shouldPlayNext

    if (!canPlay) {
      throw new Error(messages.NOT_YOUR_TURN)
    }

    if (words.length === 0) {
      throw new Error(messages.NOT_YOUR_TURN)
    }

    return game.play({
      userId,
      letters,
      words,
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