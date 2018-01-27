import uuid from 'uuid/v4'
import kueTypes from 'src/constants/enums/kueTypes.enum';
import notificationPriorities from 'src/constants/enums/notificationPriorities.enum';
import notificationTypes from 'src/constants/enums/notificationTypes.enum';
import kuePriorities from 'src/constants/enums/kuePriorities.enum';
import notificationDestinations from 'src/constants/enums/notificationDestinations.enum';
import { kueCreator } from 'src/dao/connections/kue';

export default async ({ userId, title, message, type, destination, priority, additionalData }) => {
  const validData = Object.prototype.hasOwnProperty.call(notificationDestinations, destination)
    && Object.prototype.hasOwnProperty.call(notificationTypes, type)
    && Object.prototype.hasOwnProperty.call(notificationPriorities, priority);

  if (!validData) {
    throw new Error('NOTIFICATION_DATA_IS_NOT_VALID');
  }

  return kueCreator.create(
    kueTypes.PUSH_NOTIFICATION,
    {
      userId,
      title,
      message,
      type,
      destination,
      priority,
      additionalData,
      notificationId: uuid(),
    },
  ).priority(kuePriorities.NORMAL)
    .attempts(1)
    .removeOnComplete(true)
    .save();
};
