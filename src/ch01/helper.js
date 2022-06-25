/**
 * Helper objects/functions
 * Author: Luis Atencio
 */
const { Person } = require('../model/Person.js');

const _students = {
  '444-44-4444': new Person('444-44-4444', 'Alonzo', 'Church'),
  444444444: new Person('444-44-4444', 'Alonzo', 'Church'),
};

module.exports = {
  // helper functions
};

// Helper objects
module.exports.db = {
  find(ssn) {
    return _students[ssn];
  },
};
