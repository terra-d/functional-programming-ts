/**
  Chapter 8 code listings
  This JS file contains tests covering all of the sections of this chapter.
  Author: Luis Atencio
*/

QUnit.module('Chapter 8');

const R = require('ramda');
const Rx = require('rxjs/Rx');
const { Student } = require('../model/Student.js');
const { Address } = require('../model/Address.js');
const { Person } = require('../model/Person.js');

const { IO } = require('../model/monad/IO.js');

// Helper mock function to simulate an AJAX call
const getJSON = function (fakeUrl) {
  console.log(`Fetching data from URL: ${fakeUrl}`);
  return new Promise((resolve, reject) => {
    // Mock student data
    if (fakeUrl.indexOf('students') >= 0) {
      const s1 = new Student('111-11-1111', 'Haskell', 'Curry', 'Princeton', 1900, new Address('US'));
      const s2 = new Student('222-22-2222', 'Barkley', 'Rosser', 'Princeton', 1907, new Address('Greece'));
      const s3 = new Student('333-33-3333', 'John', 'von Neumann', 'Princeton', 1903, new Address('Hungary'));
      const s4 = new Student('444-44-4444', 'Alonzo', 'Church', 'Princeton', 1903, new Address('US'));

      resolve([s2, s3, s4, s1]);
    }
    // Mock grades for each student
    else {
      resolve([80, 70, 20, 40, 99, 100]);
    }
  });
};

QUnit.test('Generator 1', (assert) => {
  function* addGenerator() {
    let i = 0;
    while (true) {
      i += yield i;
    }
  }
  const adder = addGenerator();
  assert.equal(adder.next().value, 0);
  assert.equal(adder.next(5).value, 5);
});

QUnit.test('Generator 2', (assert) => {
  function* range(start, finish) {
    for (let i = start; i < finish; i++) {
      yield i;
    }
  }

  const r = range(0, Number.POSITIVE_INFINITY);
  assert.equal(r.next().value, 0);
  assert.equal(r.next().value, 1);
  assert.equal(r.next().value, 2);
});

QUnit.test('Generator 3', (assert) => {
  function range(start, end) {
    return {
      [Symbol.iterator]() {
        return this;
      },

      next() {
        if (start < end) {
          return { value: start++, done: false };
        }
        return { done: true, value: end };
      },
    };
  }

  const res = [];
  for (const num of range(0, 5)) {
    console.log(num);
    res.push(num);
  }
  assert.deepEqual(res, [0, 1, 2, 3, 4]);
});

QUnit.test('Fetching student data with async calls', (assert) => {
  const fork = (join, func1, func2) => (val) => join(func1(val), func2(val));

  const csv = (arr) => arr.join(',');

  getJSON('/students')
    .then(R.tap(() => console.log('Hiding spinner'))) // <- simulate a spinner being hidden on the site
    .then(R.filter((s) => s.address.country === 'US'))
    .then(R.sortBy(R.prop('_ssn')))
    .then(
      R.map((student) => getJSON(`/grades?ssn=${student.ssn}`)
        .then(R.compose(Math.ceil, fork(R.divide, R.sum, R.length)))
        .then((grade) => IO.of(R.merge({ _grade: grade }, student))
          // .map(console.log)
          .map(R.props(['_ssn', '_firstname', '_lastname', '_grade']))
          .map(csv)
          .map(console.log)
          .run()), // <- Print results to the console
      ),
    )
    .catch((error) => {
      console.log(`Error occurred: ${error.message}`);
    });
  assert.expect(0); // when run this code prints to the screen all of the output through the IO monad, so nothing to expect
});

QUnit.test('Rx test', (assert) => {
  const res = [];
  Rx.Observable.range(1, 3).subscribe(
    (x) => {
      console.log(`Next: ${x}`);
      res.push(x);
    },
    (err) => console.log(`Error: ${err}`),
    () => console.log('Completed'),
  );
  assert.deepEqual(res, [1, 2, 3]);
});

QUnit.test('Rx test 2', (assert) => {
  const res = [];
  Rx.Observable.of(1, 2, 3, 4, 5)
    .filter((x) => x % 2 !== 0)
    .map((x) => x * x)
    .subscribe((x) => {
      console.log(`Next: ${x}`);
      res.push(x);
    });
  assert.deepEqual(res, [1, 9, 25]);
});
