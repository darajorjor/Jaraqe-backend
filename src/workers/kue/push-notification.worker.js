import Promise from 'bluebird';
import onesignal from 'node-opensignal-api';
import { kueProcessor } from 'connections/kue';
import kueTypes from 'src/constants/enums/kueTypes.enum';
import notificationPriorities from 'src/constants/enums/notificationPriorities.enum';
import config from 'src/config/app.config';

const { apiKeys, appIds } = config.onesignal;
const onesignalClient = onesignal.createClient();

onesignalClient.notifications.create = Promise.promisify(onesignalClient.notifications.create);

kueProcessor.process(kueTypes.PUSH_NOTIFICATION, async (job, done) => {
  const {
    userId,
    title,
    message,
    type,
    destination,
    priority,
    additionalData,
    notificationId,
  } = job.data;

  const pushNotification = {
    app_id: null,
    headings: {
      en: title,
    },
    contents: {
      en: message,
    },
    tags: [{
      key: 'user_id',
      relation: '=',
      value: userId,
    }],
    content_available: true,
    data: {
      notificationId,
      type,
      destination,
      additionalData,
    },
    ios_badgeType: 'Increase',
    ios_badgeCount: 1,
  };

  switch (priority) {
    case notificationPriorities.HIGH:
      pushNotification.priority = 10;
      break;
    case notificationPriorities.LOW:
      pushNotification.priority = 1;
      break;
    default:
      pushNotification.priority = 5; // MEDIUM
      break;
  }

  for (let it = 0; it < apiKeys.length; it += 1) {
    pushNotification.app_id = appIds[it];
    onesignalClient.notifications.create(apiKeys[it], pushNotification)
      .catch((error) => {
        console.error('Send Push Notification Error: ', error);
      });
  }

  done();
});
