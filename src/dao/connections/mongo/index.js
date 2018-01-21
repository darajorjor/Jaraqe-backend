import mongoose from 'mongoose'
import config from 'src/config/app.config'
import chalk from 'chalk'

try {
  mongoose.connect(config.mongodbConnection);
} catch (error) {
  console.log(chalk.red(error));
  console.log(chalk.yellow(`now trying to createConnection to ${config.mongodbConnection} ...`));
  mongoose.createConnection(config.mongodbConnection);
}

mongoose.connection.on('error', (error) => {
  // console.log(error);
  console.log(chalk.red(error));
  throw new Error(`unable to connect to database: ${config.mongodbConnection}`);
});

mongoose.Promise = require('bluebird');

if (process.env.NODE_ENV === 'development') {
  /*mongoose.set('debug', (collectionName, method, query, doc) => {
    console.info(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });*/
}

export default mongoose;