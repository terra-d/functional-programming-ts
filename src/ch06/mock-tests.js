/**
  Chapter 6 mock code listings
  Author: Luis Atencio
*/

const _ = require('lodash');
const R = require('ramda');
const sinon = require('sinon');

const { Either } = require('../model/monad/Either.js');
const { Student } = require('../model/Student.js');

const fork = (join, func1, func2) => (val) => join(func1(val), func2(val));

const studentStore = require('../ch01/helper').db;
// Global mock object shared on all tests
let mockContext;

QUnit.module('Chapter 6 mock tests', {
  // Depending on the version of QUnit, these methods were called : beforeEach and afterEach
  setup() {
    mockContext = sinon.mock(studentStore);
  },
  teardown() {
    mockContext.verify();
    mockContext.restore();
  },
});

const find = R.curry((db, id) => db.find(id));

const safeFindObject = R.curry((db, id) => {
  const obj = find(db, id);
  if (obj) {
    return Either.of(obj);
  }
  return Either.left(`Object not found with ID: ${id}`);
});

QUnit.test('showStudent: findStudent returning null', (assert) => {
  mockContext.expects('find').once().returns(null);

  const findStudent = safeFindObject(studentStore);
  assert.ok(findStudent('xxx-xx-xxxx').isLeft);
});

QUnit.test('showStudent: findStudent returning valid object', (assert) => {
  mockContext.expects('find').once().returns(new Student('444-44-4444', 'Alonzo', 'Church', 'Princeton'));

  const findStudent = safeFindObject(studentStore);
  assert.ok(findStudent('444-44-4444').isRight);
});
