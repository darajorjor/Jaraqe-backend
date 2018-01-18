import dotenv from 'dotenv'

dotenv.config()

export default {
  port: process.env.APP_PORT,
  postgres: {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  },
  instagramClientId: process.env.INSTAGRAM_CLIENT_ID,
  instagramClientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
}