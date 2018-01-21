import Board from '../dao/models/board.model'

const board = new Board({
  pattern: [
    [null, null, null, 'TW', null, null, 'TL', null, 'TL', null, null, 'TW', null, null, null,],
    [null, null, 'DL', null, null, 'DW', null, null, null, 'DW', null, null, 'DL', null, null,],
    [null, 'DL', null, null, 'DL', null, null, null, null, null, 'DL', null, null, 'DL', null,],
    ['TW', null, null, 'TL', null, null, null, 'DW', null, null, null, 'TL', null, null, 'TW',],
    [null, null, 'DL', null, null, null, 'DL', null, 'DL', null, null, null, 'DL', null, null,],
    [null, 'DW', null, null, null, 'TL', null, null, null, 'TL', null, null, null, 'DW', null,],
    ['TL', null, null, null, 'DL', null, null, null, null, null, 'DL', null, null, null, 'TL',],
    [null, null, null, 'DW', null, null, null, '+', null, null, null, 'DW', null, null, null,],
    ['TL', null, null, null, 'DL', null, null, null, null, null, 'DL', null, null, null, 'TL',],
    [null, 'DW', null, null, null, 'TL', null, null, null, 'TL', null, null, null, 'DW', null,],
    [null, null, 'DL', null, null, null, 'DL', null, 'DL', null, null, null, 'DL', null, null,],
    ['TW', null, null, 'TL', null, null, null, 'DW', null, null, null, 'TL', null, null, 'TW',],
    [null, 'DL', null, null, 'DL', null, null, null, null, null, 'DL', null, null, 'DL', null,],
    [null, null, 'DL', null, null, 'DW', null, null, null, 'DW', null, null, 'DL', null, null,],
    [null, null, null, 'TW', null, null, 'TL', null, 'TL', null, null, 'TW', null, null, null,],
  ]
})

board.save()
  .then(() => {
    console.log('success')
  })