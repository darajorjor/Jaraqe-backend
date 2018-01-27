const transform = require('transformobject').transform

const rules = {
  token: 'token',
}

export default (object) => {
  return transform(object, rules)
}
