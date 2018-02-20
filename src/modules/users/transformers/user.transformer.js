import { transform } from 'transformobject'
import moment from 'moment-jalaali'
import config from 'src/config/app.config'

const miniUserRules = {
  id: '_id',
  fullName: 'fullName',
  avatar: 'avatar',
  username: 'username',
  isOnline: (obj) => {
    if (obj.lastOnline) {
      const tenMinutesAgo = moment().subtract(config.lastOnlineOffset, 'minutes')

      return moment(obj.lastOnline).isAfter(tenMinutesAgo)
    }

    return false
  }
};
const userProfileRules = {
  ...miniUserRules,
  isFriend: 'isFriend',
}
const selfProfileRules = {
  ...miniUserRules,
  coins: 'coins',
  powerUps: 'powerUps',
  friends: (obj) => obj.friends.map(r => transformUserProfile(r)),
  friendRequests: (obj) => obj.friendRequests.map((fr) => {
    fr.user = transformUserProfile(fr.user)
    return fr
  }),
}

export default (object) => {
  return transform(object, miniUserRules);
};

export function transformUserProfile(object) {
  return transform(object, userProfileRules);
}

export function transformSelfProfile(object) {
  return transform(object, selfProfileRules);
}
