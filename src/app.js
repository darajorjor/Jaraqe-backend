import Promise from 'bluebird'
import express from 'express'
import bodyParser from 'body-parser'
import busboyBodyParser from 'busboy-body-parser'
import i18n from 'i18n'
import methodOverride from 'method-override'
import path from 'path'
import chalk from 'chalk'
import helmet from 'helmet'
import WebSocket from 'ws'

import { connectionHandler } from 'src/modules/socket'
import ResponseBuilder from 'src/utils/helpers/responseBuilder'
import messages from 'src/constants/defaults/messages.default'
import config from 'src/config/app.config'

import errorHandler from 'src/utils/helpers/errorHandler'
import modulesList from 'src/modules'
import initWorkers from './workers'

global.Promise = Promise

i18n.configure({
  locales: ['fa'],
  defaultLocale: 'fa',
  queryParameter: 'lang',
  directory: path.join(__dirname, '/locales'),
  updateFiles: false,
  register: global,
  api: {
    __: 'translate',
  },
})

const app = express()
const server = require('http').Server(app)

app.use(helmet())
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }))
app.use(busboyBodyParser({ limit: '1mb' }))
app.use(methodOverride())
app.use(i18n.init)

app.use((request, response, next) => {
  try {
    response.messages = messages
    response.build = new ResponseBuilder(response)
    return next()
  } catch (error) {
    return next(error)
  }
})

modulesList.forEach((moduleName) => {
  const moduleRoutes = require(`./modules/${moduleName}/routers`)
  moduleRoutes.forEach((router) => {
    const moduleRouter = require(`./modules/${moduleName}/routers/${router}`)
    app.use(`/v1/${moduleName}`, moduleRouter)
  })
  console.log(chalk.green(`Module ${chalk.cyan(moduleName)} loaded.`))
})

const wss = new WebSocket.Server({ server })

wss.on('connection', connectionHandler(wss))
wss.on('listening', () => console.log(chalk.green('WebSocket listening')))
wss.on('error', (e) => {
  console.error('Websocket error ===>', e)
})

app.use(errorHandler)

server.listen(config.port, '0.0.0.0', () => {
  console.info(chalk.inverse(`Jaraqe-Backend-Core listeting on port: ${config.port}`))
})

initWorkers()