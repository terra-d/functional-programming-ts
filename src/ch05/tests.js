/**
  Chapter 5 code listings
  Author: Luis Atencio
*/

QUnit.module('Chapter 5');

// Functional Libraries used in this chapter
const _ = require('lodash');
const R = require('ramda');

// Monads/functors used
const { Wrapper } = require('../model/Wrapper.js');
const { wrap } = require('../model/Wrapper.js');
const { empty } = require('../model/Empty.js');
const { Maybe } = require('../model/monad/Maybe.js');
const { Either } = require('../model/monad/Either.js');
const { IO } = require('../model/monad/IO.js');

// Models used
const { Student } = require('../model/Student.js');
const { Address } = require('../model/Address.js');
const { Person } = require('../model/Person.js');

QUnit.test('Simple Wrapper test', () => {
  const wrappedValue = wrap('Get Functional');
  assert.equal(wrappedValue.map(R.identity), 'Get Functional'); // -> 'Get Functional'
});

QUnit.test('Simple functor test', () => {
  const plus = R.curry((a, b) => a + b);
  const plus3 = plus(3);
  const plus10 = plus(10);
  const two = wrap(2);
  const five = two.fmap(plus3); // -> Wrapper(5)
  assert.equal(five.map(R.identity), 5); // -> 5

  assert.equal(two.fmap(plus3).fmap(plus10).map(R.identity), 15); // -> Wrapper(15)
});

QUnit.test('Simple find with wrapper', () => {
  // Use helper DB created in chapter 1
  const { db } = require('../ch01/helper');

  const find = R.curry((db, id) => db.find(id));

  const findStudent = R.curry((db, ssn) => wrap(find(db, ssn)));

  const getAddress = (student) => wrap(student.fmap(R.prop('firstname')));

  const studentAddress = R.compose(getAddress, findStudent(db));

  assert.deepEqual(studentAddress('444-44-4444'), wrap(wrap('Alonzo')));
});

QUnit.test('Simple empty container', () => {
  const isEven = (n) => Number.isFinite(n) && n % 2 == 0;
  const half = (val) => (isEven(val) ? wrap(val / 2) : empty());
  assert.deepEqual(half(4), wrap(2)); // -> Wrapper(2)
  assert.deepEqual(half(3), empty()); // -> Empty
});

QUnit.test('Simple empty container', () => {
  const WrapperMonad = require('../model/monad/Wrapper.js').Wrapper;

  const result = WrapperMonad.of('Hello Monads!').map(R.toUpper).map(R.identity); // -> Wrapper('HELLO MONADS!')

  assert.deepEqual(result, new WrapperMonad('HELLO MONADS!'));
});

QUnit.test('Simple Maybe Test', () => {
  let result = Maybe.of('Hello Maybe!').map(R.toUpper);
  assert.deepEqual(result, Maybe.of('HELLO MAYBE!'));

  const { Nothing } = require('../model/monad/Maybe.js');
  result = Maybe.fromNullable(null);
  assert.deepEqual(result, new Nothing(null));
});

QUnit.test('Maybe to extract a nested property in object graph', () => {
  const address = new Address('US');
  const student = new Student('444-44-4444', 'Joe', 'Smith', 'Harvard', 1960, address);

  const getCountry = (student) => student.map(R.prop('address')).map(R.prop('country')).getOrElse('Country does not exist!');

  assert.equal(getCountry(Maybe.fromNullable(student)), address.country);
});

QUnit.test('Maybe to extract a missing nested property in object graph', () => {
  const student = new Student('444-44-4444', 'Joe', 'Smith', 'Harvard', 1960, null);

  const getCountry = (student) => student.map(R.prop('address')).map(R.prop('country')).getOrElse('Country does not exist!');

  assert.equal(getCountry(Maybe.fromNullable(student)), 'Country does not exist!');
});

QUnit.test('Simple Either monad test', () => {
  // Use helper DB created in chapter 1
  const { db } = require('../ch01/helper');

  const find = R.curry((db, id) => db.find(id));

  const { Left } = require('../model/monad/Either.js');

  const safeFindObject = R.curry((db, id) => {
    const obj = find(db, id);
    if (obj) {
      return Either.of(obj);
    }
    return Either.left(`Object not found with ID: ${id}`);
  });

  const findStudent = safeFindObject(db);
  let result = findStudent('444-44-4444').getOrElse(new Student());
  assert.deepEqual(result, new Person('444-44-4444', 'Alonzo', 'Church'));

  result = findStudent('xxx-xx-xxxx');
  assert.deepEqual(result, Either.left('Object not found with ID: xxx-xx-xxxx'));

  assert.throws(() => {
    console.log(result.value);
  }, TypeError);
});

// Common code used in the next unit tests

// Use helper DB created in chapter 1
const { db } = require('../ch01/helper');

// validLength :: Number, String -> Boolean
const validLength = (len, str) => str.length === len;

const find = R.curry((db, id) => db.find(id));

// safeFindObject :: Store, string -> Either(Object)
const safeFindObject = R.curry((db, id) => {
  const val = find(db, id);
  return val ? Either.right(val) : Either.left(`Object not found with ID: ${id}`);
});

// checkLengthSsn :: String -> Either(String)
const checkLengthSsn = (ssn) => (validLength(9, ssn) ? Either.right(ssn) : Either.left('invalid SSN'));

// finStudent :: String -> Either(Student)
const findStudent = safeFindObject(db);

// csv :: Array => String
const csv = (arr) => arr.join(',');

const trim = (str) => str.replace(/^\s*|\s*$/g, '');
const normalize = (str) => str.replace(/\-/g, '');
const cleanInput = R.compose(normalize, trim);

QUnit.test('Using Either in show Student', () => {
  const showStudent = (ssn) => Maybe.fromNullable(ssn)
    .map(cleanInput)
    .chain(checkLengthSsn)
    .chain(findStudent)
    .map(R.props(['ssn', 'firstname', 'lastname']))
    .map(csv)
    .map(R.tap(console.log)); // -> Using R.tap to simulate the side effect (in the book we write to the DOM)

  let result = showStudent('444-44-4444').getOrElse('Student not found!');
  assert.equal(result, '444-44-4444,Alonzo,Church');

  result = showStudent('xxx-xx-xxxx').getOrElse('Student not found!');
  assert.equal(result, 'Student not found!');
});

QUnit.test('Monads as programmable commas', () => {
  // map :: (ObjectA -> ObjectB), Monad -> Monad[ObjectB]
  const map = R.curry((f, container) => container.map(f));
  // chain :: (ObjectA -> ObjectB), M -> ObjectB
  const chain = R.curry((f, container) => container.chain(f));

  const lift = R.curry((f, obj) => Maybe.fromNullable(f(obj)));

  const trace = R.curry((msg, obj) => console.log(msg));

  const showStudent = R.compose(
    R.tap(trace('Student printed to the console')),
    map(R.tap(console.log)), // -> Using R.tap to simulate the side effect (in the book we write to the DOM)

    R.tap(trace('Student info converted to CSV')),
    map(csv),

    map(R.props(['ssn', 'firstname', 'lastname'])),

    R.tap(trace('Record fetched successfully!')),
    chain(findStudent),

    R.tap(trace('Input was valid')),
    chain(checkLengthSsn),
    lift(cleanInput),
  );

  const result = showStudent('444-44-4444').getOrElse('Student not found!');
  assert.equal(result, '444-44-4444,Alonzo,Church');
});

QUnit.test('Complete showStudent program', () => {
  // map :: (ObjectA -> ObjectB), Monad -> Monad[ObjectB]
  const map = R.curry((f, container) => container.map(f));
  // chain :: (ObjectA -> ObjectB), M -> ObjectB
  const chain = R.curry((f, container) => container.chain(f));

  const lift = R.curry((f, obj) => Maybe.fromNullable(f(obj)));

  const liftIO = function (val) {
    return IO.of(val);
  };

  // For unit testing purposes, this could be replaced with R.tap
  const append = R.curry((elementId, info) => {
    console.log(`Simulating effect. Appending: ${info}`);
    return info;
  });

  const getOrElse = R.curry((message, container) => container.getOrElse(message));

  const showStudent = R.compose(
    map(append('#student-info')),
    liftIO,
    getOrElse('unable to find student'),
    map(csv),
    map(R.props(['ssn', 'firstname', 'lastname'])),
    chain(findStudent),
    chain(checkLengthSsn),
    lift(cleanInput),
  );

  const result = showStudent('444-44-4444').run();
  assert.equal(result, '444-44-4444,Alonzo,Church');

  const result2 = showStudent('xxx-xx-xxxx').run();
  assert.equal(result2, 'unable to find student');
});
