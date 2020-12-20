const fs = require('fs');
const path = require('path');

const schema = fs.readFileSync(path.resolve(path.join(__dirname, './schema.gql')));

module.exports = schema.toString();
