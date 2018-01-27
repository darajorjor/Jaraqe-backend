import Kue from 'kue';
import Redis from 'ioredis';
import appConfig from 'src/config/app.config';

const redisConf = {
  host: appConfig.redis.host,
  port: appConfig.redis.port,
  password: appConfig.redis.password,
};

const kueProcessor = Kue.createQueue({ redis: { createClientFactory: () => new Redis(redisConf) } });
const kueCreator = Kue.createQueue({ redis: { createClientFactory: () => new Redis(redisConf) } });

module.exports = { kueProcessor, kueCreator };
