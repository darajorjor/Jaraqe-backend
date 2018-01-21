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
  mongodb: {
    host: process.env.MONGO_HOST,
    port: process.env.MONGO_PORT,
    database: process.env.MONGO_DATABASE,
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASS
  },
  get mongodbConnection() {
    if (this.mongodb.user && this.mongodb.pass)
      return `mongodb://${this.mongodb.user}:${this.mongodb.pass}@${this.mongodb.host}:${this.mongodb.port}/${this.mongodb.database}`
    else
      return `mongodb://${this.mongodb.host}:${this.mongodb.port}/${this.mongodb.database}`
  },
  instagramClientId: process.env.INSTAGRAM_CLIENT_ID,
  instagramClientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
}
