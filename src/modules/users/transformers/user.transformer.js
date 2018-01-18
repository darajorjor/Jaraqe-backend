import { transform } from 'transformobject';

const rules = {
  id: 'id',
  full_name: 'full_name',
  avatar: 'avatar',
};

export default (object) => {
  return transform(object, rules);
};
