# Separating Concerns

Our [`routes.js`](https://github.com/Satyam/HowToDoATodoApp/blob/master/server/routes.js) file is a real mess.  It was useful so far because it allowed us to see in just one glimpse how a request could be handled but it mixed two separate concerns, those of handling the HTTP and the database connections.  As more complexity was added to the routes in some of the examples, they became really difficult to follow.

We fix this mess by separating the concerns.  The [`routes.js`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-1/server/routes.js) file deals with routing the HTTP requests to appropriate handlers and [`projects.js`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-1/server/projects.js) deals with actually handling the data for those requests.

Several clues indicate the split is a good thing.

* `routes.js`
  * no longer uses `db`, the global variable holding the database connection.
  * validates all incoming arguments and issues a `400 Bad request` HTTP Error.  The 4xx error codes are client-side errors and sending improper values is its concern.
  * converts incoming text values into proper internal data types (numbers and booleans)
  * sends `500 Internal Server Error` when an error comes from `projects.js`.  The 5xx error codes are for server-side errors and whatever the specific error might be, from an HTTP standpoint, it is a 5xx error.
* `projects.js`
  * it assumes that the data is present and validated
  * it is the only one accessing the database
  * knows nothing about HTTP error codes
  * knows nothing about where the data is located within the request

All the database functionality is contained within an object which is the [only export](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-1/server/projects.js#L6) of `projects.js`.  In each, each possible CRUD operation has a member that handles it, plus an [`init`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-1/server/projects.js#L7-L33) function to set everything up, basically, pre-compiling the SQL prepared statements.  All are asynchronous functions receiving a `done` callback function as their last or only argument.

All [data handling functions](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-1/server/projects.js#L35) expect the following arguments:

* `keys`: Object containing the key or index to locate the item to operate upon.  They are usually `pid` and/or `tid`.
* `data`: Object containing data associated to the request. They can be `name` and `descr` for projects, `descr` and `complete` for tasks.
* `options`: Object containing request options such as
  * `fields`: list of fields to return
  * `search`: name of field and value to look for in that field.
* `done`: callback function.

They all produce the same type of reply through the combination of the two arguments of the `done` callback function.  

* `done(null, data)`: success.  Requested data is returned.
* `done(err)`: error. The database handler produced some sort of error.  The second argument is irrelevant.
* `done(null, null)`: not found. The keys provided failed to locate any items.  This is usually an error and `routes.js` reports it as a `404 not found` HTTP error.  This is different from a request for a list of items that returns no items because that returns `done(null, [])` and it is not necessarily an error.

This is mostly handled by the [`processPrj`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-1/server/routes.js#L6-L12) function

```js
const processPrj = (op, res, keys, data, options) => {
  projects[op](keys, data, options, (err, data) => {
    if (err) return void res.status(500).send(err);
    if (data === null) return void res.status(404).send('Item(s) not found');
    res.json(data);
  });
};
```

It receives the name of the method within `projects.js` that should handle the operation, the `res` response object from Express and the `keys`, `data` and `options` object for each request, as described above. It calls the given method on the `projects` objects which is the result of [requiring `projects.js`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-1/server/routes.js#L4):

```js
const projects = require('./projects.js');
```

On receiving the callback call, it checks for errors and sends a 500 error.  If `err` is `null` it then checks whether `data` is `null` and if so it sends a 404 error and otherwise just sends the data.

A [typical database operation](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-1/server/projects.js#L70-L77) turns out to be quite simple:

```js
getTaskByTid: (keys, data, options, done) => {
  prepared.selectTaskByTid.get({$tid: keys.tid}, (err, task) => {
    if (err) return done(err);
    if (!task || task.pid !== keys.pid) return done(null, null);
    task.complete = !!task.complete;
    done(null, task);
  });
},
```

All operations receive the very same 4 arguments though depending on the operation, some will be empty.  Here, `getTaskByTid` calls the SQL prepared statement `selectTaskByTid` providing it with the arguments objects that will fill its placeholders, in this case only one `$tid` for the task Id.  On callback, it checks for errors and return immediately if any is found, it then checks whether a task item was actually returned and if so whether the `pid` on it matches the `pid` requested and in either case, it returns both null indicating that no record matched the requested keys.  Finally, it does a data type conversion on the `complete` field because SQLite does not have an actual  Boolean type but represents it as numbers 0 or not zero.  Just as the `routes.js` module dealt with type conversion on the data received in the HTTP request, it is the responsibility of the module dealing with the database to do the data type conversion of the values received from it to native JavaScript data types. Finally, it calls `done` with the data retrieved.

It is always a good rule that the first module receiving the information from a remote source (http client, database handler) is responsible for validating and converting the values to native data types.

Since all the routes had `/projects` as a prefix, just as we did with the `/data/v1` routes, we [create a sub-route](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-1/server/routes.js#L19-L23):

```js
module.exports = (dataRouter, done) => {
  const projectRouter = express.Router();
  dataRouter.use('/projects', projectRouter);

  projectRouter.get('/', (req, res) => {
  // ...
```

The `routes.js` module receives `dataRouter` which is the [sub-route handler](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-1/server/index.js#L17-L19) for requests starting with `/data/v1`.  We create a new sub-route `projectRouter` which handles `/projects` under the previous sub-route.  Thus, the route handler for GET on `/projects` under `dataRouter` now turns into a handler for GET of `/` under `projectRouter`.

Within each router, Express checks the routes sequentially in the order they were defined.  By creating sub-routes we turn this sequential list into a tree, which is faster to traverse.  It also allows us to plug any group of routes anywhere else in the tree with little effort should we ever need it.  Besides, we write less.

It might well be noted that in our database handlers, the arguments `keys`, `data` and `options` copy values from `req.params`, `req.body` and `req.query` respectively.  Though the values do flow in that direction, the reason why that is so is the inverse.  When defining the REST API, it is natural for the key values to make up part of the URL since, after all, they are the values that identify the item to locate, the *resource locator*.  It is also natural for the associated data for the item to go in the body or the options to go into the query part of the URL.  Thus, it is far from coincidence.  However, this is in no way enforced by none of the modules we have been using. It is just our own convention.

## Simplifying validation with middleware

We have already seen how flexible Express can be in the way we can match routes.  We have transformed a large sequential list of routes to a tree quite easily. Routes also allows us to use variable parts in routes and extract them as parameters.

Express is also flexible in the way we handle that route once it has been matched.  So far, we have used the pattern:

```js
router.method('route pattern', (req, res) => {
  // ...
});
```

However, Express allows any number of handlers to be chained after each route pattern.

```js
router.method('route pattern', handler1, handler2, /* .... */ (req, res) => {
  // ...
});
```

This can be very useful in validating the data received.  It is obvious from our `routes.js` file how we keep repeating the very same validation code over and over again.  We can simplify this by using chained handlers which is basically what middleware does.

All route handlers have three arguments, `req` and `res` which we have been using so far and `next` which we haven't even mentioned yet.

The third, `next`, argument is a function that when called tells Express to call the next handler in the chain and, if there are no further handlers for that route, to go back to route matching.

Handlers can add information to both `req` and `res` and each successive handler in the chain will see the changes the previous one has made on those objects.  That is what, for example, `body-parser` does.  It reads and parses the information received in the request body and places it in `req.body`. Then, it calls `next()` so Express continues matching routes.

This is our [`pid` validator](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-2/server/routes.js#L16-L21):

```js
const validatePid = (req, res, next) => {
  let pid = Number(req.params.pid);
  if (Number.isNaN(pid)) return send400(res);
  req.$valid.keys = {pid};
  next();
};
```

It converts the `:pid` parameter from string to number.  If it is `NaN` it means the conversion failed and sends back a 400 HTTP error. Otherwise, we store the converted `pid` into `req` in an object of our own called `$valid` under `keys`.  Finally, it calls `next` to chain into the next validator or the final handler.

The [`send400` function](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-2/server/routes.js#L6) sends our default response to invalid request data:

```js
const send400 = res => void res.status(400).send('Bad request');
```

When we return from sending the 400 response, we are not calling `next` because there is no point in continuing further down the chain. We only call `next` on a successful validation.

The choice of `req.$valid` is completely arbitrary.  It simply needs to be some property that doesn't collide with any existing property names.  Express does not use the `$` for its properties.  Traditionally, though variable names can start with an underscore `_` or a dollar sign `$`, they are somewhat reserved.  Identifiers starting with underscore are meant to signal a *private* member.  It doesn't meant they are really private in the sense of other languages that make them invisible to other modules, it just signals the intent to keep them private.  In other words, it signals that developers should not count on their contents.  A developer is expected to support the *public* interface of their modules.  If any public interface is broken, then you have a *backward compatibility* issue.  Developers are not expected to support their *private* interfaces and they signal those by using the underscore prefix.  If you use any private interface from a third party module, you do it at your own risk.

The dollar sign usually signaled temporary or auxiliary variables whose existence is ephemeral. Then came JQuery, but that is another story. So, using `$valid` under `req` should be quite safe.

Our validators all assume there is a `req.$valid` object.  To ensure that, we use another [chained handler](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-2/server/routes.js#L11-L14):

```js
const add$valid = (req, res, next) => {
  req.$valid = { };
  next();
};
```

We have to put this chained handler before any validators and we already have the [perfect place](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-2/server/routes.js#L76-L78) to do so.  

```js
module.exports = (dataRouter, done) => {
  const projectRouter = express.Router();
  dataRouter.use('/projects', add$valid, projectRouter);
  // ...
```

Our `projectRouter` sub-route handler is just another piece of middleware and any number of such handlers can be chained even when defining a new sub-route.  So, we add our `add$valid` middleware right in front of the sub-route handler so `req.$valid` will already be available for any handler below.

This makes all our routes [quite simple](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-2/server/routes.js#L104-L106), even boringly so:

```js
projectRouter.put('/:pid/:tid', validateTid, validateTaskData, (req, res) => {
  processPrj('updateTask', req, res);
});
```

To PUT (change) a task, we need to validate both the `tid` (which includes validating the `pid`) and the data to change.  If each of these validators succeed, each will call `next` until the chain falls into our own handler which calls `processPrj` with the name of the method to execute.  Note that the last handler in the chain does not call `next` because it will take care of the request and no further handlers need be concerned with it.  If it did call `next`, Express would continue the route matching process and with no further handlers matching this particular route, it would go all the way until the end and then send a `404 not found` reply, which is not good.

[`processPrj`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-2/server/routes.js#L67-L74) has not changed that much from the previous version.  Instead of expecting the `keys`, `data` and `options` arguments, it expects to find those same arguments within `req.$valid` so it uses those.

```js
const processPrj = (op, req, res) => {
  const valid = req.$valid;
  projects[op](valid.keys, valid.data, valid.options, (err, data) => {
    if (err) return void res.status(500).send(err);
    if (data === null) return void res.status(404).send('Item(s) not found');
    res.json(data);
  });
};
```

Can we go a little further?  `processPrj` receives `req` and `res` like all handlers. Can we make it a piece of middleware?  [Sure](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-3/server/routes.js#L67-L74):

```js
const processPrj = op => (req, res) => {
  const valid = req.$valid;
  projects[op](valid.keys, valid.data, valid.options, (err, data) => {
    if (err) return void res.status(500).send(err);
    if (data === null) return void res.status(404).send('Item(s) not found');
    res.json(data);
  });
};
```

We turned `processPrj` into a function that receives the single `op` argument and returns a function that is the actual handler that will eventually receive the `req` and `res` arguments and respond with the requested data.  The inner function will have access to `op` in the outer function via closure.

Let me write the above in pre-*fat arrow functions* if it makes it any clearer:

```js
const processPrj = function (op) {
  return function (req, res) {
    const valid = req.$valid;
    projects[op](valid.keys, valid.data, valid.options, (err, data) => {
      if (err) return void res.status(500).send(err);
      if (data === null) return void res.status(404).send('Item(s) not found');
      res.json(data);
    });
  }
};
```

A route in our list of route handlers end up quite succinct:

```js
projectRouter.put('/:pid/:tid', validateTid, validateTaskData, processPrj('updateTask'));
```

It is just a number of chained handlers each doing its part in the process.

Now we have much less code repetition than we had before, all our validation is concentrated each in one simple validator. Should we later change the `pid`s or `tid`s to something else instead of plain integers, for example, UUIDs such as `{3F2504E0-4F89-41D3-9A0C-0305E82C3301}` we can change it in a few places.

Our code coverage also increases.  Since there is less repetition, there are fewer repeated lines and branches that need to be separately tested with extra tests.  Now, with the same number of tests, we go through most of the code.  

Another interesting effect in our code coverage is that the column showing the number of times a certain line of code has been used increases since those fewer lines are used more times each.    

We haven't added any tests since doing SQL Injection but we certainly should, though they wouldn't add much for the purpose of this book. Please feel free to try on your own. Our validators should be thoroughly checked forcing errors and making sure they detect them.

To top this off, we will do further chaining of the JavaScript kind.  The `get`, `post`, `put` and `delete` methods are also chainable so all our routes definitions can be reduced to the [following]:

```js
projectRouter
  .get('/', validateOptions, processPrj('getAllProjects'))
  .get('/:pid', validatePid, processPrj('getProjectById'))
  .get('/:pid/:tid', validateTid, processPrj('getTaskByTid'))
  .post('/', validatePrjData, processPrj('addProject'))
  .post('/:pid', validatePid, validateTaskData, processPrj('addTaskToProject'))
  .put('/:pid', validatePid, validatePrjData, processPrj('updateProject'))
  .put('/:pid/:tid', validateTid, validateTaskData, processPrj('updateTask'))
  .delete('/:pid', validatePid, processPrj('deleteProject'))
  .delete('/:pid/:tid', validateTid, processPrj('deleteTask'));
```
