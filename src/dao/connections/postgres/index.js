import Sequelize from 'sequelize'
import config from 'src/config/app.config'

const sequelize = new Sequelize(
  config.postgres.database,
  config.postgres.username,
  config.postgres.password,
  {
    host: config.postgres.host,
    port: config.postgres.port,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'debug' ? console.log : false,
    pool: {
      min: 1,
      max: 10,
    },
  },
)

sequelize.authenticate().then(() => {
  console.log('Postgres Connection has been established successfully.')
}).catch((error) => {
  console.error('Unable to connect to the postgres database. error: ', error)
  throw new Error('postgres_connection_error')
})

export {
  Sequelize,
  sequelize,
}
