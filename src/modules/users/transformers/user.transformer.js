import { transform } from 'transformobject';

const rules = {
  id: '_id',
  fullName: 'fullName',
  avatar: 'avatar',
};

export default (object) => {
  return transform(object, rules);
};
