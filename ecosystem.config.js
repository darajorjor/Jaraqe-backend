module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'core',
      interpreter: 'node',
      script: 'build/app.js',
      // instances: 0,
      // exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        APP_PORT: 3000,
        APP_URL: 'http://localhost:3000/v1',
        MONGO_HOST: 'localhost',
        MONGO_PORT: 27017,
        MONGO_DATABASE: 'jaraqe',
        MONGO_USER: '',
        MONGO_PASS: '',
        INSTAGRAM_CLIENT_ID: 'dae2183232d44dbdb2f052f7a4c0d7a9',
        INSTAGRAM_CLIENT_SECRET: 'a327d6bb0b4a4995b50c74e07486cfe9',
      }
    },
  ],
};
