import config from 'src/config/app.config'
import { minute } from 'src/utils/cron'
import usersWorker from './users.worker'

export default function init() {
  minute(usersWorker.run, 1)
}
