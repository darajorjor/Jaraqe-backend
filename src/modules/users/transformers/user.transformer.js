import { transform } from 'transformobject';

const miniUserRules = {
  id: '_id',
  fullName: 'fullName',
  avatar: 'avatar',
};
const userProfileRules = {
  ...miniUserRules,
  isFriend: 'isFriend',
}
const selfProfileRules = {
  ...miniUserRules,
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
