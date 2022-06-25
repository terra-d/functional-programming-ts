/**
  Chapter 2 code listings
  Author: Luis Atencio
*/

QUnit.module('Chapter 2');

const R = require('ramda');

const ValueObjects = require('../model/value_objects.js');

const { zipCode } = ValueObjects;
const { coordinate } = ValueObjects;

const { Student } = require('../model/Student.js');
const { Address } = require('../model/Address.js');

QUnit.test('Playing with immutable value objects', () => {
  const princetonZip = zipCode('08544', '3345');
  assert.equal(princetonZip.toString(), '08544-3345');

  const greenwich = coordinate(51.4778, 0.0015);
  assert.equal(greenwich.toString(), '(51.4778,0.0015)');

  const newCoord = greenwich.translate(10, 10).toString();
  assert.equal(newCoord.toString(), '(61.4778,10.0015)');
});

QUnit.test('Deep freeze object', () => {
  const { deepFreeze } = require('./helper');
  const address = new Address('US');
  const student = new Student('444-44-4444', 'Joe', 'Smith', 'Harvard', 1960, address);
  const frozenStudent = deepFreeze(student);

  assert.throws(() => {
    frozenStudent.firstname = 'Emmet'; // Expect: Cannot assign to read only property '_firstname' of object '#<Student>'
  }, TypeError);

  assert.throws(() => {
    frozenStudent.address.country = 'Canada'; // Expect: Cannot assign to read only property '_country' of object '#<Address>'
  }, TypeError);
});

QUnit.test('Playing with Lenses', () => {
  const z = zipCode('08544', '1234');
  const address = new Address('US', 'NJ', 'Princeton', z, 'Alexander St.');
  const student = new Student('444-44-4444', 'Joe', 'Smith', 'Princeton University', 1960, address);

  const zipPath = ['address', 'zip'];
  const zipLens = R.lensPath(zipPath);
  assert.deepEqual(R.view(zipLens, student), z);

  const beverlyHills = zipCode('90210', '5678');
  const newStudent = R.set(zipLens, beverlyHills, student);
  assert.deepEqual(R.view(zipLens, newStudent).code(), beverlyHills.code());
  assert.deepEqual(R.view(zipLens, student), z);
  assert.ok(newStudent !== student);
});

QUnit.test('Negation', () => {
  function negate(func) {
    return function () {
      return !func.apply(null, arguments);
    };
  }

  function isNull(val) {
    return val === null;
  }

  const isNotNull = negate(isNull);
  assert.ok(!isNotNull(null)); // -> false
  assert.ok(isNotNull({})); // -> true
});

QUnit.test('Immutable setters', () => {
  // thanks to feedback from ChernikovP
  class Address {
    constructor(street) {
      this.street = street;
    }
  }

  class Person {
    constructor(name, address) {
      this.name = name;
      this.address = address;
    }
  }

  const person = new Person('John Doe', new Address('100 Main Street'));

  const streetLens = R.lens(R.path(['address', 'street']), R.assocPath(['address', 'street']));

  const newPerson = R.set(streetLens, '200 Broadway Street', person);

  assert.ok(person instanceof Person); // true
  assert.ok(!(newPerson instanceof Person)); // false
  assert.ok(newPerson instanceof Object); // true
});
