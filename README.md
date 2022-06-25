# Functional JavaScript Programming
##### By Luis Atencio

Please begin the project with

```bash
$ yarn
```

to load all of the required functional libraries.

In this repo you will find:

* All code samples (as runnable unit tests) of code used in chapters
* JS targeted for browser
* Functional data types like Optional, Either, Maybe, etc.
* Access to some JavaScript functional libraries like lodash.js, rxjs, etc.

## Running the tests

### QUnit
Once [QUnit](https://api.qunitjs.com/) is installed, you can run each test with the QUnit CLI by specifying the chapter number.

```bash
$ npm run ch[01-08]
```
### Jest
Additionally, you may also run unit tests using the [Jest](https://facebook.github.io/jest/) test runner.
Disclaimer: This is not part of the book, but an extra feature courtesy of the JS community :-) 

To run all tests:

```bash
$ yarn test
```

To run a chapter test:

```bash
$ jest ch[01-08]
```

To run tests in `watch` mode:

```bash
$ jest --watchAll
```

And for code coverage:

```bash
$ yarn run cover
```
