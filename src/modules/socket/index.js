import config from 'src/config/app.config'
import messages from 'src/constants/defaults/messages.default'
import redis, { sub } from 'connections/redis'
import uuid from 'uuid/v4'
import events from './events'
import controller from './controller'
import chatsSubscriber from './subscribers/chats.subscriber'
import gamesSubscriber from './subscribers/games.subscriber'

async function isAuthed(socketId) {
  return await redis.get(`sockets:${socketId}`)
}

export const connectionHandler = (wss) => {
  chatsSubscriber(wss)
  gamesSubscriber(wss)

  return (ws, req) => {
    ws.id = uuid()

    function send(data) {
      return ws.send(JSON.stringify(data))
    }

    console.log('A connection received')
    send({
      type: events.WHO_IS_THIS,
    })

    setTimeout(() => {
      if (!isAuthed(ws.id)) {
        ws.close(62, messages.TIMER_RAN_OUT)
      }
    }, config.socket.dummyConnectionTimeout)

    ws.on('message', async (message) => {
      console.log('Received a message', message)
      try {
        const parsedMessage = JSON.parse(message)

        let userId = await isAuthed(ws.id)
        if (parsedMessage.type !== events.ITS_ME && !userId) {
          return ws.close(1000, messages.UNAUTHORIZED)
        } else if (userId) {
          userId = JSON.parse(userId).userId
        }

        ws.userId = userId

        switch (parsedMessage.type) {
          case events.ITS_ME:
            if (!parsedMessage.session) {
              return ws.send(messages.NO_SESSION_SUPPLIED)
            }

            const userId = await controller.itsMe({ session: parsedMessage.session, socketId: ws.id })
              .catch(e => {
                switch (e.message) {
                  case messages.USER_NOT_FOUND:
                    return ws.send(messages.USER_NOT_FOUND)
                  default:
                    return null
                }
              })
            ws.userId = userId

            return send({
              type: events.WELCOME,
            })
          case events.CHAT:
            if (!parsedMessage.data) return null
            if (!parsedMessage.data.message) return null
            if (!parsedMessage.data.message.text) return null
            if (!parsedMessage.data.gameId) return null

            const { message: { text, _id }, gameId } = parsedMessage.data

            await controller.chat({ userId, gameId, text })

            return send({
              type: events.CHAT_SUBMITTED,
              messageId: _id, // send him back the id he sent us
            })
          case events.SEE_MESSAGES:
            if (!parsedMessage.data) return null
            if (!parsedMessage.data.gameId) return null

            return controller.seeMessages({ userId, gameId: parsedMessage.data.gameId })
          default:
            return null
        }
      } catch (e) {
        console.error(e)
        return send({
          type: events.ERROR,
          message: messages.SOMETHING_WENT_WRONG
        })
      }
    })
    ws.on('close', (code, reason) => {
      console.log(`Connection closed with code: ${code}. Reason: ${reason}`)
    })
    ws.on('error', (error) => {
      ws.close()
      console.error(`Connection error: `, error)
    })
    ws.on('open', () => {
      console.error(`Connection error: ${code}`)
    })
    ws.on('ping', (data) => {
      console.error('He pinged')
    })
    ws.on('pong', (data) => {
      console.error('He ponged')
    })
    ws.on('unexpected-response', (req, res) => {
      console.error('unexpected-response')
    })
  }
}