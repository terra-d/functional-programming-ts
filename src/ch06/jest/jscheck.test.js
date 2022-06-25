/**
  Chapter 6 mock code listings. These are not actual unit tests, but JSCheck tests.
  I'm using QUnit as the test running framework.
  Author: Luis Atencio
*/

describe('Chapter 6', () => {
  const R = require('ramda');
  const JSC = require('jscheck');
  const { Either } = require('../../model/monad/Either.js');

  test('Run JSCHeck', () => {
    // Functions to test
    const fork = (join, func1, func2) => (val) => join(func1(val), func2(val));

    const toLetterGrade = (grade) => {
      if (grade >= 90) return 'A';
      if (grade >= 80) return 'B';
      if (grade >= 70) return 'C';
      if (grade >= 60) return 'D';
      return 'F';
    };

    const computeAverageGrade = R.compose(toLetterGrade, fork(R.divide, R.sum, R.length));

    JSC.clear();
    JSC.on_report((str) => console.log(str));
    JSC.test(
      'Compute Average Grade',
      (verdict, grades, grade) => verdict(computeAverageGrade(grades) === grade),
      [JSC.array(JSC.integer(20), JSC.number(90, 100)), 'A'],
      (grades, grade) => `Testing for an ${grade} on grades: ${grades}`,
    );
    expect(0);
  });

  test('JSCheck Custom Specifier for SSN', () => {
    /**
     * Produces a valid social security string (with dashes)
     * @param param1 Area Number -> JSC.integer(100, 999)
     * @param param2 Group Number -> JSC.integer(10, 99)
     * @param param3 Serial Number -> JSC.integer(1000,9999)
     * @returns {Function} Specifier function
     */
    JSC.SSN = function (param1, param2, param3) {
      return function generator() {
        const part1 = typeof param1 === 'function' ? param1() : param1;
        const part2 = typeof param2 === 'function' ? param2() : param2;
        const part3 = typeof param3 === 'function' ? param3() : param3;
        return [part1, part2, part3].join('-');
      };
    };
    // Functions to test
    const validLength = (len, str) => str.length === len;

    const find = R.curry((db, id) => db.find(id));

    const checkLengthSsn = (ssn) => Either.of(ssn).filter(R.partial(validLength, [9]));

    JSC.clear();

    JSC.on_report((report) => console.log(`Report${str}`));

    JSC.on_pass((object) => assert.ok(object.pass));

    JSC.on_fail((object) => expect(object.pass || object.args.length === 9, `Test failed for: ${object.args}`).toEqual(true));

    JSC.test(
      'Check Length SSN',
      (verdict, ssn) => verdict(checkLengthSsn(ssn)),
      [JSC.SSN(JSC.integer(100, 999), JSC.integer(10, 99), JSC.integer(1000, 9999))],
      (ssn) => `Testing Custom SSN: ${ssn}`,
    );

    expect(0);
  });
});
