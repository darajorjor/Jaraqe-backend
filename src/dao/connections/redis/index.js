import Redis from 'ioredis';
import appConfig from 'src/config/app.config';

const redis = new Redis({
  host: appConfig.redis.host,
  port: appConfig.redis.port,
  password: appConfig.redis.password,
});

export const sub = new Redis({
  host: appConfig.redis.host,
  port: appConfig.redis.port,
  password: appConfig.redis.password,
})

export default redis;
