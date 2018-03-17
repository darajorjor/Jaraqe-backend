import { sub } from 'connections/redis'
import events from 'src/modules/socket/events'
import GameRepo from 'repositories/game.repository'

export default function (wss) {
  sub.psubscribe('games:*')
  sub.on('pmessage', async function (pattern, channel, message) {
    const gameId = channel.split(':')[1]
    const game = await GameRepo.findById(gameId)
    if (!game) return null

    const clients = Array.from(wss.clients)

    clients.map((client) => {
      if (game.players.map(i => i.userId.toString()).includes(client.userId)) {
        client.send(JSON.stringify({
          type: events.PLAY_GAME,
          data: JSON.parse(message)
        }))
      }
    })
  })
}