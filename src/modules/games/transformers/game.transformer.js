const transform = require('transformobject').transform
import transformUser from 'src/modules/users/transformers/user.transformer'

const rules = {
  id: '_id',
  players: (obj) => obj.players.map(player => {
    player.user = transformUser(player.userId)
    delete player.userId
    return player
  }),
  board: 'board',
  history: 'history',
  letters: 'letters',
  createdAt: 'createdAt',
}

export default (object) => {
  return transform(object, rules)
}
