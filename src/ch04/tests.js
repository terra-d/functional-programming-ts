/**
 * Chapter 4 code listings
 * Author: Luis Atencio
 */

QUnit.module('Chapter 4');

const _ = require('lodash');
const R = require('ramda');

// Globally used functions throughout all code listings
const isEmpty = (s) => !s || !s.trim();
const isValid = (val) => !_.isUndefined(val) && !_.isNull(val);
const trim = (str) => str.replace(/^\s*|\s*$/g, '');
const normalize = (str) => str.replace(/\-/g, '');

QUnit.test('Chaining methods together', () => {
  const names = ['alonzo church', 'Haskell curry', 'stephen_kleene', 'John Von Neumann', 'stephen_kleene'];

  const result = _.chain(names)
    .filter(isValid)
    .map((s) => s.replace(/_/, ' '))
    .uniq()
    .map(_.startCase)
    .sort()
    .value();

  assert.deepEqual(result, ['Alonzo Church', 'Haskell Curry', 'John Von Neumann', 'Stephen Kleene']);
});

QUnit.test('Check Type tests', () => {
  const { checkType } = require('./helper');
  assert.equal(checkType(String)('Curry'), 'Curry');
  assert.equal(checkType(Number)(3), 3);
  assert.equal(checkType(Number)(3.5), 3.5);
  const now = new Date();
  assert.equal(checkType(Date)(now), now);
  assert.deepEqual(checkType(Object)({}), {});
  assert.throws(() => {
    checkType(String)(42);
  }, TypeError);
});

QUnit.test('Tuple test', () => {
  const { Tuple } = require('./helper');
  const StringPair = Tuple(String, String);
  const name = new StringPair('Barkley', 'Rosser');
  const [first, last] = name.values(); // In Node you need to use let
  assert.equal(first, 'Barkley');
  assert.equal(last, 'Rosser');
  assert.throws(() => {
    const fullname = new StringPair('J', 'Barkley', 'Rosser');
  }, TypeError);
});

QUnit.test('Extending the core language', () => {
  // Take the first N characters
  String.prototype.first = _.partial(String.prototype.substring, 0, _);
  let result = 'Functional Programming'.first(3); // -> 'Fun'
  assert.equal(result, 'Fun');

  // Convert any name into a Last, First format
  String.prototype.asName = _.partial(String.prototype.replace, /(\w+)\s(\w+)/, '$2, $1');
  result = 'Alonzo Church'.asName(); // -> 'Church, Alonzo'
  assert.equal(result, 'Church, Alonzo');

  String.prototype.explode = _.partial(String.prototype.match, /[\w]/gi);
  result = 'ABC'.explode(); // ->
  assert.deepEqual(result, ['A', 'B', 'C']);

  // Parses a simple URL
  String.prototype.parseUrl = _.partial(String.prototype.match, /(http[s]?|ftp):\/\/([^:\/\s]+)\.([^:\/\s]{2,5})/);
  result = 'http://example.com'.parseUrl(); // -> ['http', 'example', 'com']
  assert.deepEqual(result, ['http://example.com', 'http', 'example', 'com']);
});

QUnit.test('Composition', () => {
  const str = 'We can only see a short distance ahead but we can see plenty there that needs to be done';
  const explode = (str) => str.split(/\s+/);
  const count = (arr) => arr.length;
  const countWords = R.compose(count, explode);
  assert.equal(countWords(str), 19); // -> 19
});

QUnit.test('More composition', () => {
  const trim = (str) => str.replace(/^\s*|\s*$/g, '');
  const normalize = (str) => str.replace(/\-/g, '');
  const validLength = (param, str) => str.length === param;
  const checkLengthSsn = _.partial(validLength, 9);

  const cleanInput = R.compose(normalize, trim);
  const isValidSsn = R.compose(checkLengthSsn, cleanInput);
  let result = cleanInput(' 444-44-4444 '); // -> '444444444'
  assert.equal(result, '444444444');

  result = isValidSsn(' 444-44-4444 '); // -> true
  assert.ok(result);
});

QUnit.test('Composition with functional libraries', () => {
  // Given data:
  const students = ['Rosser', 'Turing', 'Kleene', 'Church'];
  const grades = [80, 100, 90, 99];

  const smartestStudent = R.compose(R.head, R.pluck(0), R.reverse, R.sortBy(R.prop(1)), R.zip);

  const result = smartestStudent(students, grades); // -> 'Turing'
  assert.equal(result, 'Turing');
});

QUnit.test('Composition as point-free functions', () => {
  // Given data:
  const students = ['Rosser', 'Turing', 'Kleene', 'Church'];
  const grades = [80, 100, 90, 99];

  const first = R.head;
  const getName = R.pluck(0);
  const { reverse } = R;
  const sortByGrade = R.sortBy(R.prop(1));
  const combine = R.zip;
  const result = R.compose(first, getName, reverse, sortByGrade, combine);
  assert.equal(result(students, grades), 'Turing');
});

QUnit.test('Show student program with currying and composition', () => {
  // Use the mock data from Chapter 1
  const { db } = require('../ch01/helper');

  const find = R.curry((db, id) => db.find(id));

  // findObject :: DB -> String -> Object
  const findObject = R.curry((db, id) => {
    const obj = find(db, id);
    if (obj === null) {
      throw new Error(`Object with ID [${id}] not found`);
    }
    return obj;
  });

  // findStudent :: String -> Student
  const findStudent = findObject(db);

  const csv = ({ ssn, firstname, lastname }) => `${ssn}, ${firstname}, ${lastname}`;

  // append :: String -> String -> String
  const append = R.curry((elementId, info) => {
    console.log(info);
    return info;
  });

  // showStudent :: String -> Integer
  const showStudent = R.compose(append('#student-info'), csv, findStudent, normalize, trim);

  const result = showStudent('44444-4444'); // -> 444-44-4444, Alonzo, Church
  assert.equal(result, '444-44-4444, Alonzo, Church');
});

QUnit.test('More point-free coding', () => {
  const runProgram = R.pipe(R.map(R.toLower), R.uniq, R.sortBy(R.identity));

  const result = runProgram(['Functional', 'Programming', 'Curry', 'Memoization', 'Partial', 'Curry', 'Programming']);
  assert.deepEqual(result, ['curry', 'functional', 'memoization', 'partial', 'programming']);
  // -> [curry, functional, memoization, partial, programming]
});
