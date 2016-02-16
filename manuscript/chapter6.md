# Testing our server

So far we've tested the server we wrote in a very primitive and limited manner.  We can issue some HTTP GET requests from any browser and get a few responses from our server.  We can even test the REST API, at least the `get` requests but we can't test much else unless we create actual HTML pages with `<form>` tags with any of the methods and input fields with suitable values.  Still, browsers transmit the form's contents url-encoded, not JSON-encoded so we can't really do much.

We can just keep going ahead, hoping for the best, and use the client, the one we haven't written so far, to do the testing.  The problem is, we are testing two previously un-tested elements at once.  If we find something doesn't work, which of them is at fault?  This can be harder if development is split in between two teams.

Testing the REST API is like a contract.  The server-side developers know what is required of their code and they can show it complies.  The client-side developers know that, once tested, the server-code can be trusted.

Moreover, software tends to have a life longer than we could expect.  Over that time, issues and bugs might show up and, in attempting to fix them, we might mess up something else.  It is really hard to try this kind of collateral damage because when we fix something and then manually test whether it is fixed we tend to forget or prefer to avoid testing everything else. So, the best thing to do is to automate testing so we can ensure all works as it had before.

Once the basic testing infrastructure is in place, adding further tests is easy.  The first step to fix an issue is to reproduce it, and a new test is the easiest way to do so.  Adding a test to our existing battery of tests is easy. Thus, testing also helps us fix new issues by reproducing it, and lets us know we fix it when it no longer fails.

Looking at our `pakage.json` file, we can see that the `npm init` command has already created [an entry](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-3-1/package.json#L8) for a script test.  It hasn't done such thing for any of the other possible scripts.  Moreover, the `npm test` command can be shortened to `npm t`.  These are indications that at least NPM takes testing seriously.  And so should we.

## Loading testing software

We will load several NodeJS packages that will help us in testing.  First of all, [Mocha](https://mochajs.org/), the basic testing framework.  The [Chai](http://chaijs.com/) package lets us make assertions, that is, ensure our expectations are fulfilled.  Finally, [Axios](https://www.npmjs.com/package/axios) allows us to create any kind of HTTP request.  We use NPM to install them:

```
npm i mocha --save-dev
npm i chai --save-dev
npm i axios --save
```

The `npm install` command can be shortened to `npm i`.  We have installed the first two packages with the `--save-dev` options so that they [are saved](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/package.json#L36-L42) into `package-json` as development dependencies along ESLint, in alphabetical order. Axios, however, was installed with the `--save` option since it is a package that we will end up using in production so it is a [regular dependency](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/package.json#L31).

```json
"devDependencies": {
  "chai": "^3.4.1",
  "eslint": "^1.10.3",
  "eslint-config-standard": "^4.4.0",
  "eslint-plugin-standard": "^1.3.1",
  "mocha": "^2.3.4"
}
```

We also need to replace that [test script](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/package.json#L9) in `package.json` with something useful.  

```json
"scripts": {
  "start": "node --use-strict server/index.js",
  "lint": "eslint . || exit 0",
  "test": "mocha"
}
```

It is customary to separate test files from those used in production code so our test files will go into a separate folder.  Unless we explicitly tell Mocha which script file to run, it will search for files using the pattern `./test/*.js` and run all the scripts it finds.

We will place all our test scripts into the [`/test` folder](https://github.com/Satyam/HowToDoATodoApp/tree/chapter-6-1/test) and will start with `server.js`.

Mocha will add serveral *global* methods such as `describe` and `it` so we first put a [comment for ESLint](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/test/server.js#L1) telling it about those we will be using so it won't complain about us using undeclared variables.  The `false` after each global name means that they are meant to be read-only.

```js
/*globals describe:false, it:false, before:false, after:false*/
```

Then we [load](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/test/server.js#L2-L4) the two NPM packages that will help us do the testing, `axios` and `chai`.  Chai offers several different syntaxes for writing our assertions, we will use the `expect` syntax.

```js
const axios = require('axios');
const chai = require('chai');
const expect = chai.expect;
```

To avoid having to repeat the connection configuration over and over again, Axios lets us create a [pre-configured http connection instance](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/test/server.js#L8-L13). Here we can appreciate the advantages of placing our configuration parameters in `package.json`, both the server and the server testing software can read the *port* number from the same location.

```js
const PORT = process.env.npm_package_myServerApp_port || 8080;

const http = axios.create({
  baseURL: `http://localhost:${PORT}`,
  responseType: 'json'
});
```

To write a test, we [start](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/test/server.js#L15) with a description and what should be expected.

```js
describe('Static pages test', function () {
  it('Get / should return home page', function () {
```

Both `describe` and `it` accept a string which will be printed as the tests are executed, in green for success, in red for failed ones.  As the second argument, both expect a callback function. We should not use *fat arrow* functions in Mocha because Mocha forces `this` within the callback to a value of its choice.

Mocha allows for synchronous or asynchronous tests.  All HTTP operations are asynchronous because we don't actually know when the server will respond.  If we don't tell Mocha that a test is asynchronous, it will assume the test is passed when the test returns without errors, even if the reply from the server is still to arrive.  

There are two ways to tell Mocha that a test is asynchronous.  If a test returns a `Promise`, Mocha will wait for its resolution and report on its success. This is great since Axios returns a Promise. We will explain the other mechanism later on.   

Each test file can contain any number of `describe` calls and each one of those any number of `it` calls or further `describe`. Each `describe` is a test suite and Mocha allows us to define setup and tear down operations that can be done for each suite. We will use those later on.   

Our first test is very simple, we will simply check that the server can respond with our [simple home page](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/test/server.js#L23-L28).

```js
return http.get('/')
  .then(response => {
    expect(response.status).to.equal(200);
    expect(response.headers['content-type']).to.contain('text/html');
    expect(response.data).to.contain('<title>How to do a Todo App</title>');
  });
```

We are sending an `http` `get` request on the root `'/'` and we expect the server to respond with a 200 status code, a content type of HTML and somewhere in the body to be that `<title>` tag. The [syntax](http://chaijs.com/api/bdd/) of the calls chained after `expect` is provided by Chai as a series of keywords that turn out quite readable.

Axios returns a `Promise`.  We hook to that `Promise` by chaining a call to `then` but we also return that same `Promise` so that Mocha itself can chain to it, wait for its completion and report on its success or failure.

For the last test, we have to somehow turn around the normal response of Mocha because we do [expect an error](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/test/server.js#L38-L48).  

```js
it('Get /xyz should return a "page not found" error', function () {
  return http.get('/xyz')
    .then(
      response => {
        throw new Error('Should not have found it');
      },
      response => {
        expect(response.status).to.equal(404);
      }
    );
});
```

The `then` method of a `Promise` actually accepts two callbacks, one for success, which is the one we usually use, and a second one for failure.  We listen to both outcomes.  In the successful callback, we throw an error which Mocha will report.  In the second, we check that the status code on the response is, indeed, 404.  Since the failure is caught and supposedly fixed (unless the status code is something else but 404), the `Promise` is now considered successful and that is what Mocha will report.

## Running the tests

We have to run both the server and the test.  To do that we may either open two terminal windows and run the server via `npm start` in one of them and then `npm t` (shorthand for `npm test`) in the other.  Alternatively, if the operating system allows it, we could run the server in the background doing `npm start &` and then `npm t`.

Unfortunately, we cannot simply chain one command after the other `npm start && npm t`  because `npm start` exits when the server may not yet be listening to requests, and the tests might fail. It might succeed, but it is a matter of chance and how fast the machine is.  

All these options are really messy.  What we want is for the tests to start and stop the web server when needed.  To do that, we first need to do some minor changes to our server code.

We need to `export` the server instance so our test has access to it. Before, [we had](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/index.js#L29-L32):

```js
http.createServer(app)
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
```

This created and set the server to listen to requests all at once.  We have to break that into two so we can [export the server](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/server/index.js#L8-L10).

```js
const server = http.createServer(app);

module.exports = server;
```

We now create the server instance and export it.  Later on, when the data file `data.json` has been read, we [start listening](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/server/index.js#L33-L37) but only if the script was executed directly and not loaded as a module.

```js
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}
```

In NodeJS, when `require.main`, that is the main module, that which has not been required by any other module is this very same `module` it means it was run from NodeJS.  Only then we call the `listen` method to set the server to listen for requests.  This prevents the server to start listening immediately when our tests start.

In our test script we [require the server](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/test/server.js#L6) as if it was just any other module.

```js
const server = require('../server/index.js');
/* Any of these would do just as well:
const server = require('../server');
const server = require('..');
*/
```

Since the server, when loaded as a module, will not start listening, we add these [two callbacks](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/test/server.js#L16-L21) to our test suite:

```js
before('Starting server', function (done) {
  server.listen(PORT, done);
});
after('Closing the server', function (done) {
  server.close(done);
});
```

Within each `describe`, Mocha will look for and execute `before` callbacks, then it will look for the `it` tests or further `describe` test suites and execute those and finally it will call the `after` callback, if there is any.  There are also `beforeEach` and `afterEach` that, if present, will be called not just once per test suite but for each and every individual test.  We are not using those here.

In our `before` callback we are telling our server to start listening.  It is the same `listen` method we used earlier in our web server which accepts a PORT and a callback to let us know when it is ready.  It is an asynchronous operation so we have to tell Mocha to wait until it is finished.  We cannot use the `Promise` mechanism because we have no `Promise` to return.  Instead we will use the `done` mechanism.  When Mocha detects that the test callbacks have accepted an argument, it assumes the test is async and waits for `done` to be called.  So, we call that `done` method once the server is ready to listen.  Likewise, we `close` the server `after` we are done with the tests.  `close` is also asynchronous so we accept the `done` argument and let `close` call it when it is done.

Now, with `npm start` we can run the server and with `npm t` we can run the tests, which will start the server as well. NodeJS allows us to have a script act as both an executable script and a library module.

Time to give it a try and, after that, make it fail. Change the test script to expect a different status code, content type or text within the file or ask for non existing files and see how Mocha reports that.  Change the server script, for example, comment out the [`express.static`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-1/server/index.js#L31) middleware or change the folder it points to.

Someone might have noticed that while we have dealt with the asynchronicity of the `listen` method of the server, we have not dealt with that of reading the data file.  There are a few ways to deal with that but, in the end, it really doesn't matter as the use of that `data.json` file is just an interim way to just get going with the parts of the application we really care about at this point.  Since it works anyway and, in the long run, it will be replaced, we won't deal with this issue right now.  It is noticeable in that the first test is somewhat slow and Mocha reports the delay in yellow as a warning or red as unacceptable.

## Testing the data server

Testing the REST API has made our `server.js` test script grow five-fold, even though we haven't tested everything that could possibly be tested.  Later on, we will see how to find out what we have checked and what not.  Most of the test code is quite repetitive, it usually goes like this:

```js
it('whatever the test ...', function () {
  return http.method(URL /* possible object with data: {descr: 'changed description'} */)
    .then(response => {
      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.contain('application/json');
      let data = response.data;
      // further tests on the data
    });
});
```

Most tests will call some `method` (`get`, `post`, `put` or `delete`) on the `http` object which is a pre-configured Axios instance such as the one we use for static pages:

```js
const http = axios.create({
  baseURL: `http://localhost:${PORT}`
});
```

Or the one we use to access the REST API, which already points to `/data/v1`

```js
const http = axios.create({
  baseURL: `http://localhost:${PORT}/data/v1`,
  responseType: 'json'
});
```

Depending on the *method* we may need to add further information, for example, both the POST and PUT methods need an object with the data to insert or modify, which Axios will take care to JSON-encode.

For all responses, we check whether the response status code is 200 and the content-type is JSON, except for DELETE operations which return no data.  This might not seem strictly necessary since it is to be expected that if one GET returns JSON, all GETs will.  However, testing doesn't happen that often and does not affect response times in production so, why not waste a little time now and spare us trouble later?  After all we are chaining plenty of `to`, `be` and other Chai *readability* methods to our `expect` assertions though they are completely useless, just to make our tests as clear as possible.

The [first few tests](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L62-L116) check for the data already contained in the `data.json` file. Since later testing relies on us being able to read the data we have inserted or changed, it makes sense to ensure we get GETs right.

For later tests, we [create](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L160-L173) a new project, [manipulate](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L183-L269) it and then [delete](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L175-L181) it.  Likewise, for tasks, we [create](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L225-L237) a new one, [manipulate](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L247-L267) it and then [delete](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L239-L245) it. For each kind of manipulation test, we repeat the creation and deletion so we have used the `beforeEach` to create the project or task to manipulate and the `afterEach` to delete it when done.

In all the tests we return the `Promise` that Axios creates for each operation so Mocha can check it.  Even the `beforeEach` and `afterEach` callbacks are checked for success.

When running the test script, the various tests are shown indented according to the context they are in, as marked by the `describe` enclosing it. It is interesting to see how Mocha makes it easy for us.  For example, when changing the completion status of a particular tasks within a project, Mocha would have gone through all these steps:

* [Start the server](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L12-L14)
  * [Create the pre-configured Axios connection](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L57-L60)
    * [Create a new project](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L160-L173)
      * [Create a new task within the newly created project](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L225-L237)
        * [Change the completion status](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L258-L267)
      * [Delete the task](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L239-L245)
    * [Delete the project](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L175-L181)
* [Stop the server](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L16-L18)

What are we missing? Plenty, for example:

* Add a second project and make sure it gets a different pid
* Add another task to a project and make sure it gets its own tid
* Do an actual GET on a changed project or task instead of relying on what the PUT method reports back
* Delete a project or task to check it actually fails
* Do a GET on a deleted project or tasks and check it fails
* Change the information on a project with tasks in it and make sure we don't mess with those tasks

Our tests have already paid off.  We were mishandling our tasks.  When creating a new project, we forgot to initialize the tasks list to an empty object. Later on, both when creating a new task or when deleting an existing one, we forgot that they go under the `tasks` member of the project object and not as part of the project itself. We got it right for changing it, but forgot on the other two operations. GitHub can [show us the changes](https://github.com/Satyam/HowToDoATodoApp/commit/c49beb49d6e651709439dc1b9e6a0e51541efc76#diff-33baa3b9cb45a92fc70513b61df48cd9) we did to `server/routes.js` to fix those errors, the green lines replacing the mistaken red lines.

That is what testing is for.
