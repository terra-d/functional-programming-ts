/**
  Chapter 7 code listings
  Author: Luis Atencio
*/

QUnit.module('Chapter 7');

// Installs memoization
require('./memoization');

const now = require('performance-now');
const R = require('ramda');
const { IO } = require('../model/monad/IO.js');

const rot13 = ((s) => s.replace(/[a-zA-Z]/g, (c) => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26))).memoize();

QUnit.test('Memoization test', () => {
  assert.equal(rot13('functional_js_50_off'), 'shapgvbany_wf_50_bss');
});

QUnit.test('Performance', () => {
  const start = () => now();
  const runs = [];
  const end = function (start) {
    const end = now();
    const result = (end - start).toFixed(3);
    runs.push(result);
    return result;
  };

  const test = function (fn, input) {
    return () => fn(input);
  };

  const testRot13 = IO.from(start)
    .map(R.tap(test(rot13, 'functional_js_50_off')))
    .map(end);

  testRot13.run();
  testRot13.run();
  assert.ok(runs[0] >= runs[1]);
});

/*
   The remaining code listings are based on previous functions that are memoized.
   Execution and results are exactly the same...
*/
