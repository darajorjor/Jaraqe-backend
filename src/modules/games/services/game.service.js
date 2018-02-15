import UserRepo from 'repositories/user.repository'
import WordRepo from 'repositories/word.repository'
import GameRepo from 'repositories/game.repository'
import BoardRepo from 'repositories/board.repository'
import shuffleArray from 'src/utils/helpers/shuffleArray'
import boardDefaults from 'src/constants/defaults/board.default'
import messages from 'src/constants/defaults/messages.default'
import uuid from 'uuid/v4'
import _ from 'lodash'
import { checkSiblingTiles } from 'src/utils/helpers/game.hepler'
import sendPush from 'src/utils/push'
import notificationTypes from 'src/constants/enums/notificationTypes.enum'
import notificationPriorities from 'src/constants/enums/notificationPriorities.enum'
import notificationDestinations from 'src/constants/enums/notificationDestinations.enum'
import statuses from 'src/constants/enums/status.enum'
import coinTransactionTypes from 'src/constants/enums/coinTransactions.enum'
import wordService from 'src/modules/words/services/word.service'

String.prototype.splice = function (idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem))
}

function sortHorizontally(a, b) {
  return b.coordinates.col - a.coordinates.col
}
function sortVertically(a, b) {
  return a.coordinates.row - b.coordinates.row
}
function calcGameScore(game) {
  game.players = game.players.map((player) => {
    let score = 0
    game.history.forEach((history) => {
      if (player.userId._id.toString() === history.player.toString()) {
        score += history.totalScore
      }
    })

    player.score = score
    return player
  })

  return game
}

export default {
  match(userId) {
    return UserRepo.matchGame(userId)
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

    return this.controlRacks(player, game.toObject())
  },

  async listGames({ userId, lastKey }) {
    const games = await GameRepo.list({ userId, lastKey })
    return Promise.all(games.map(async g => {
        return this.controlRacks(userId, await this.preTransformGame(g))
      })
    )
  },

  async getGame({ userId, gameId }) {
    let game = await GameRepo.get(gameId)

    return this.controlRacks(userId, await this.preTransformGame(game))
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
          arr.sort(sortVertically).forEach((letter) => {
            word += letter.value
          })
        } else {
          arr.reverse().forEach((letter) => {
            word += letter.value
          })
        }
      } else if (allInRow) {
        if (sort) {
          arr.sort(sortHorizontally).forEach((letter) => {
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
        if (top) topWords.push({
          ...top,
          coordinates: {
            row: row - 1,
            col,
          },
        })
        let bottomWords = []
        if (bottom) bottomWords.push({
          ...bottom,
          coordinates: {
            row: row + 1,
            col,
          },
        })
        let leftWords = []
        if (left) leftWords.push({
          ...left,
          coordinates: {
            row,
            col: col - 1,
          },
        })
        let rightWords = []
        if (right) rightWords.push({
          ...right,
          coordinates: {
            row,
            col: col + 1,
          },
        })

        if (top) {
          let rowIndex = row
          while (top) {
            let t = checkSiblingTiles(filledBoard, rowIndex - 1, col).top

            if (t) {
              rowIndex--
              topWords.push({
                ...t,
                coordinates: {
                  row: rowIndex - 1,
                  col,
                }
              })
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
              bottomWords.push({
                  ...t,
                  coordinates: {
                    row: rowIndex + 1,
                    col,
                  }
                }
              )
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
              leftWords.push({
                ...t,
                coordinates: {
                  row,
                  col: colIndex - 1,
                }
              })
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
              rightWords.push({
                ...t,
                coordinates: {
                  row,
                  col: colIndex + 1,
                }
              })
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
            if (topWords.length === 0 && bottomWords.length === 0) {
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
            if (rightWords.length === 0 && leftWords.length === 0) {
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

        mainLetters = _.uniqBy(mainLetters, 'id')

        if (allInColumn) {
          mainLetters = mainLetters.sort(sortVertically)
        } else if (allInRow) {
          mainLetters = mainLetters.sort(sortHorizontally)
        }

        const word = getWordFromLetters(mainLetters, allInColumn, allInRow, true)

        words.push({
          word,
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

    let playedGame = await game.play({
      userId,
      letters,
      words,
    })

    const nextPlayer = playedGame.players.find(pl => pl.shouldPlayNext)
    const otherPlayer = playedGame.players.find(pl => !pl.shouldPlayNext)
    await sendPush({
      userId: nextPlayer.userId.id,
      title: 'نوبت توئه!',
      message: `${otherPlayer.userId.fullName || otherPlayer.userId.userName} منتظرته، نوبتتو بازی کن`,
      type: notificationTypes.GAME,
      priority: notificationPriorities.HIGH,
      destination: notificationDestinations.GAME,
    })

    return this.controlRacks(userId, await this.preTransformGame(playedGame))
  },

  async preTransformGame(game) {
    const pattern = await game.fillBoard()
    game = game.toObject()
    game.board.pattern = pattern

    return calcGameScore(game)
  },

  controlRacks(userId, game) {
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

  async surrender({ userId, gameId }) {
    let game = await GameRepo.findById(gameId)

    const opponent = game.players.find(p => p.userId.toString() !== userId)
    game.winner = opponent.userId
    game.status = statuses.GAME.FINISHED

    let user = await UserRepo.findById(opponent.userId)
    let selfUser = await UserRepo.findById(userId)

    await user.addTransaction({
      amount: game.coinPrize,
      recordId: gameId,
      type: coinTransactionTypes.GAME,
    })

    await sendPush({
      userId: opponent.userId.toString(),
      title: `${selfUser.fullName} تسلیمت شد!`,
      message: 'ببین چی شد بازی',
      type: notificationTypes.GAME,
      priority: notificationPriorities.HIGH,
      destination: notificationDestinations.GAME,
    })

    return game.save()
  },

  async swapLetters({ gameId, userId, letters, isPlus }) {
    const game = await GameRepo.findOne({ _id: gameId })

    // is it his turn?
    if (!game.players.find(p => p.userId.toString() === userId).shouldPlayNext) {
      throw new Error(messages.NOT_YOUR_TURN)
    }

    // can he use isPlus?
    if (isPlus) {
      const user = await UserRepo.findById(userId)
      if (user.powerUps.swapPlus > 0) {
        user.powerUps.swapPlus--
      } else {
        throw new Error(messages.SWAPPLUS_NOT_AVAILABLE)
      }

      await user.save()
    }

    const shouldPlayNext = game.players.filter(p => p.userId.toString() !== userId)[0].userId
    let thePlayer
    game.players = game.players.map((player) => {
      if (player.userId.toString() === userId) { // update rack
        player.rack = player.rack.filter(l => !letters.map(i => i).includes(l.id))
        player.rack = wordService.controlLetters(game.letters, player.rack)
        thePlayer = player
      }

      if (!isPlus) {
        // change turn
        player.shouldPlayNext = player.userId.toString() === shouldPlayNext.toString();
      }

      return player
    })

    await game.save()

    return thePlayer.rack
  },
}