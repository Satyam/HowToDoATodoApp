# Switching to SQL

Our server has been working from data stored in memory, a solution workable only for the smallest data set.  To go any further we should go to some more serious data management system. We have to switch to SQL.

Out of the many SQL variants, we will use [SQLite](https://www.sqlite.org) for its simplicity. It still falls short of any large-scale database management system or DBMS like the popular and also free [MySQL](http://www.mysql.com/) or some larger ones, but for the purpose of this book, it has the benefit of requiring no other installation than using NPM to load the corresponding package. SQLite manages its databases out of a simple file.  Opening a database simply means telling the SQLite driver which file to use. It is also so small that many applications use it to store its own data. For example, [Mozilla Thunderbird](https://www.mozilla.org/en-US/thunderbird/), a popular Open Source eMail client, creates several files with extension `.sqlite` that are SQLite databases just to hold configuration information.

Moreover, SQLite can use both temporary files or memory store.  Both are valid through the duration of the application execution, which is all we need for the purpose of this book.

In our earlier version, we loaded the content of the `data.json` file in memory and handled all the data as a big global `data` object. Except for loading the `data.json` file into memory, all data operations where synchronous.  Now, using SQL, all our operations are asynchronous and the purpose of this chapter is to explore that more thoroughly.

To load SQLite we follow the usual procedure. First, we use `npm i --save sqlite3` to download the package from the NPM registry.  Since we will use SQL in production, we use the `--save` option instead of `--save-dev` so it will be saved as a regular dependency in `package.json`.  Then, in our `server/index.js` file we add `const sqlite3 = require('sqlite3');` to load it as we have done with all the packages.

So far the only asynchronous operation we have seriously dealt with has been put the HTTP server to listen.  We have ignored reading the `data.json` file, which is also an asynchronous operation because we were going to drop it.  We are now dropping it but have added some more asynchronous operations.  Now, we have the  [following](https://github.com/Satyam/HowToDoATodoApp/blob/master/server/index.js#L23-L48):

* Connect to the SQL database
* Load the `data.sql` file containing the database setup
* Make SQLite execute that file
* Setup some SQL *Prepared Statements*
* Set the HTTP server to listen to requests

```js
const webServer = {
  start: done => {
    /* globals db:false */
    global.db = new sqlite3.Database(':memory:', err => {
      if (err) return done(err);
      fs.readFile(path.join(__dirname, 'data.sql'), 'utf8', (err, data) => {
        if (err) return done(err);
        db.exec(data, err => {
          if (err) return done(err);
          routes(dataRouter, err => {
            if (err) return done(err);
            server.listen(PORT, () => {
              console.log(`Server running at http://localhost:${PORT}/`);
              done();
            });
          });
        });
      });
    });
  },
  stop: done => {
    server.close(done);
  }
};

module.exports = webServer;
```

To make all those operations available both to run the server regularly via `npm start` or to test it via `npm t` or `npm run coverage` we create a `webServer object` containing a `start` and a `stop` function.  We export that `webServer` object for the benefit of our test script.

In the `start` method, we create a `new sqlite3.Database` which will be store in memory.  We could use an actual file or pass an empty string which will tell SQLite to create a temporary file, but we don't really have that much data. We make that `db` instance global by assigning it to `global.db`.

Then, we use the FileSystem `fs` module to read `data.sql` which contains standard SQL statements to create and populate the tables to store our data.  Once read, we tell the `db` to execute `db.exec` all those statements at once.  

We need to do some further setup in `server/routes.js` which is also asynchronous so we have added an extra argument to `routes`, we give it the router instance and now we also add a callback so it can tell us when it is done.

Finally, we set our HTTP server to listen.

We do each operation sequentially. Each asynchronous operation takes a callback function whose first argument is an error object.  So, to proceed with each step we first check that the previous step has had no errors.  If `err` is not null, we call `done(err)` to notify our caller that there has been an error.  We used a shortcut, we might have written this like this:

```js
if (err) {
  done(err);
  return;
}
```

But we know that `done` does not return anything, thus, we are free to write:

```js
if (err) return done(err);
```

Since `done` returns `udnefined` and a solitary `return` is like `return undefined`, our shortcut works just the same.  We have not used this kind of shortcut elsewhere where we don't know what the callback might return.

For `close` we simply close the HTTP server.  Since the database is a temporary one in memory, it really doesn't matter if we close it or not.

To [start the server](https://github.com/Satyam/HowToDoATodoApp/blob/master/server/index.js#L50-L57) in production mode using `npm start`, we have:

```js
if (require.main === module) {
  webServer.start(err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
}
```

Once again, we check if this module is the main and, if so, we call `webServer.start` to get everything up and running.  We provide a callback function which `start` would receive as the `done` argument that, if it does receive an error, it shows it in the console and exits with an error code.

We have made the function which is the [default export](https://github.com/Satyam/HowToDoATodoApp/blob/master/server/routes.js#L3-L27) of `server/routes.js` an asynchronous one by adding just one more argument to it, the `done` callback. We had to do this because all SQL operations are asynchronous so at initialization time, when we setup the *prepared statements* we can let our caller know when we are done or otherwise signal an error.

A prepared statement is an optimization present in most varieties of SQL which allows the SQL engine to pre-compile and possibly optimize an SQL statement for future execution. For example, `selectAllProjects` contains the prepared statement `'select * from projects'`.

```js
module.exports = (router, done) => {
  const selectAllProjects = db.prepare(
    'select * from projects',
    err => {
      if (err) return done(err);
    }
  );
  const selectProjectByPid = db.prepare(
    'select * from projects where pid = $pid',
    err => {
      if (err) return done(err);
    }
  );
  // ...
```

Prepared statements can have variable parts which will be filled in when they are executed.  Variable parts can be represented in various ways, we have opted to use an identifier preceded by a `$` sign.  Thus when we want to execute `selectProjectByPid`, we have to provide an actual value for `$pid`.

Now, in response to a [request for `/projects`](https://github.com/Satyam/HowToDoATodoApp/blob/master/server/routes.js#L29-L37), we ask the `selectAllProjects` prepared statement to give us `all` the projects it can find.  We provide it with a callback that will receive an error, if any, and an array containing all the projects.  If we get an error, we reply with a 500 HTTP error code along the text of the error or otherwise we send back those projects JSON-encoded.

```js
router.get('/projects', (req, res) => {
  selectAllProjects.all((err, prjs) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(prjs);
    }
  });
});
```

We use a 500 error code here instead of the 404 we have used so far because the only reason for an error is a serious server-side error which fits the error standard description "500: Internal Server Error".  It is important to use the correct HTTP error code.

Creating a new project via a [POST to `/projects`](https://github.com/Satyam/HowToDoATodoApp/blob/master/server/routes.js#L81-L92) uses parameters:

```js
router.post('/projects', (req, res) => {
  createProject.run({
    $name: req.body.name,
    $descr: req.body.descr
  }, function (err) {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({pid: this.lastID});
  });
});
```

Here we run the `createProject` prepared statement filling in the `$name` and `$descr` variables with the corresponding information from the body of the request.  If there is an error, we report it back to the client with a 500 error code, otherwise, we get the `pid` of the newly inserted record which SQLite stores in `this.lastID`.  SQLite has two such variables `lastID` which represents the row ID of the last record inserted and `changes` which returns a count of the number of records affected in an insert, update or delete statement.  There is only one copy of each per connection so they must be read immediately after the SQL operation and before any new operation is attempted.  Different SQL engines have different names for these variables but they are always there in one way or another.

We are not using any shortcut to return when an error is found.  The following may work, but it is not safe:

```js
if (err) return res.status(500).send(err);
```

If we did this, we would be returning a copy of `res` but we don't know what the Express router might do with that.  We might use:

```js
if (err) return void res.status(500).send(err);
```

But it lacks clarity, which is important for maintainability, unless the practice is standardized across the organization. One-off hacks are never a good idea but if it becomes standard practice, it would be Ok (and it would allow us to improve our coverage statistics).

## Building SQL statements dynamically

We can't use SQL prepared statements everywhere. In an update, what is it we are updating? In a project, we might independently update the project name or its description.  In a task we might change the description or its completion status. This would require three prepared statements, one with both SQL field names and another two, each for a separate field.  This is not acceptable.  With more fields the situation would be even worst. So, we [build it dynamically](https://github.com/Satyam/HowToDoATodoApp/blob/master/server/routes.js#L118-L127) by concatenating as many fields as values arrive in the request body:

```js
router.put('/projects/:pid', (req, res) => {
  let sql = 'update projects set ' +
    Object.keys(req.body).map(column => `${column} = $${column}`).join(',') +
   ' where pid = $pid';

  db.run(sql, {
    $name: req.body.name,
    $descr: req.body.descr,
    $pid: req.params.pid
  }, function (err) {
```

Since we have no prepared statement, we ask the `db` to `run` the `sql` statement we have just built. We then provide the parameters to fill into the placeholders in the statement. If either of `name` or `descr` is `undefined` it will not show in the parameter list, but neither will it be in the statement so SQLite won't be expecting it.

## Regular anonymous functions vs. fat arrow functions

Our use of regular anonymous functions like in the code above and fat arrow functions might seem capricious but it is not so. Fat arrow functions are the preferred choice because of their compact syntax and the way they handle `this`, which has always been an inconvenience in JavaScript.  Regular functions have their `this` either undefined or set to the global object. This was a problem for callbacks because they lost track of the `this` from the object instance they were contained in.  In contrast, fat arrow functions retain the `this` of their containing object.  

Many developers have turned this *issue* into an advantage. Both Mocha and the SQLite driver set the context (the value of `this`) to a value of their choice which gives access to properties or methods useful to the callback.  Within an `it` test in Mocha, `this.timeout(nnn)` allows delays in tests.  In `sqlite3`, `this.lastID` and `this.changes` are accessible to the callback of the SQL operations.  If we were to use fat arrow functions, the `this` that those utilities give us would be lost.

## Testing the changes

We won't go through all of the changes in `routes.js`, it is basically SQL data handling.  Once all the changes are done, we have to check them and we have two ways of doing so.  First, ESLint.  If we run `npm run lint` we get thousands of errors. As it turns out, they come from the files produced by Istanbul.  We must add a [`.eslintignore` file](https://github.com/Satyam/HowToDoATodoApp/blob/master/.eslintignore) which, just as `.gitignore` lists the file patterns of files or folders to ignore.  By adding that file, we get a clean run on our code.

Then, we need to run the tests via `npm t`.  These don't come good. A few are simple to fix.  With `data.json`, when we asked for an invalid `pid` or `tid` we could easily tell them apart.  We could do the same with SQL but it would be wasteful so, instead of our earlier `Project nnn not found` and `Task nnn not found` we sometimes have `Task nnn in project nnn not found` so we have to [change the check](https://github.com/Satyam/HowToDoATodoApp/commit/f8e3e849f71f4b702067a1539ca17c73af661c83#diff-ad3c25167d0354b9b277e3ab6f375274L139) for that.  This is not a big deal of a change since the message is informative but it hardly matters to our client software which will simply check for the 404 error.

Another source of errors is that we now have unique `tid`s.  Earlier, we could have the same `tid` on different projects.  Now we can't so, for example, the test that asked for `/projects/34/2` [now has to ask](https://github.com/Satyam/HowToDoATodoApp/commit/f8e3e849f71f4b702067a1539ca17c73af661c83#diff-ad3c25167d0354b9b277e3ab6f375274L107) for `/projects/34/5`.  Once again, not a big issue.

There is, however, one big problem.  On updates we used to return the updated record, for the record (sorry, couldn't resist). This is easy when the data is in memory, but it requires one more SQL operation. Is that saving worth against
changing the behavior?

This is not an unusual decision to take at an earlier stage as we are now at. The other differences detected by our test were backward-compatible, this one is not, though it is hard to see an application that would complain about it.  So, we opt to accept the change and [drop that assertion](https://github.com/Satyam/HowToDoATodoApp/commit/f8e3e849f71f4b702067a1539ca17c73af661c83#diff-ad3c25167d0354b9b277e3ab6f375274L290) from our tests.  We will not be providing the changed record on our updates, if you want it, you can always ask for it, which is what we do in our tests.

This is not such a simple decision, we are taking this alternative just for the purpose of showing how it is done, but in practice, we would have to evaluate always making a second SQL query all within the server against sometimes making a second HTTP request all the way from the client. Most of the time,a second query is unnecessary, however, SQL databases have *computed fields* values that are the result of a calculation on other fields so that when you update the record you want to check the value of that calculation.  We just have to remember that the solution taken here is not meant to be a general rule, there are other considerations to evaluate.

The important lesson here is that to do this properly, we need to change the [version number](https://github.com/Satyam/HowToDoATodoApp/blob/master/package.json#L3) in `package.json`  from `"version": "0.1.0"` to:

```json
"version": "0.2.0"
```

Whenever we change the first non-zero number part in our version, it means there has been a compatibility change.  If our module were to be listed as a dependency in some other `package.json` like this:

```json
"dependencies": {
  "how_to_do_a_todo_app": "^0.1.0"
}
```

it would load any version `0.1.0` or later, such as `0.1.1` or `0.1.999999` but it would never load `0.2.0` because when the first non-zero number changes, it means there is a compatibility issue.

It was our tests that allowed us to discover this issue.  We should always do tests.

## Handling Query Parameters

Our REST API can contain query modifiers such as search conditions or which fields to return. To handle those cases we need to build the SQL statement dynamically.  However, since those modifiers are usually an exception, we will still use the generic SQL prepared statement for the usual condition and a built one for the exceptional cases.

```js
router.get('/projects', (req, res) => {
  let cb = (err, prjs) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(prjs);
    }
  };
  if (Object.keys(req.query).length === 0) {
    selectAllProjects.all(cb);
  } else {
    let sql = 'select ' +
      (req.query.fields || '*') +
      ' from projects' +
       (req.query.search
         ? ' where ' + req.query.search.replace(/([^=]+)=(.+)/, '$1 like "%$2%"')
         : ''
       );
    db.all(sql, cb);
  }
});
```

We changed the [route handler](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-8-2/server/routes.js#L29-L49) for the GET on `/projects` to handle query parameters.  Since one way or another we are going to use the same callback for queries with or without parameters, we first define the [callback function](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-8-2/server/routes.js#L30-L36) `cb`.  
We [check](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-8-2/server/routes.js#L37) if there are any query parameters.  Express already parses the query parameters and places them in an object at `req.query`. If there are none, it will give us an empty object.

If there are no keys in `req.query` we use the `selectAllProjects` prepared statement, otherwise, we [build the SQL statement](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-8-2/server/routes.js#L40-L46) into `sql`.  If there is a `fields` key, we expect it to be a comma separated list of fields to list, such as `name,descr` and we concatenate that list, otherwise, we ask for all fields `'*'`.

If there is a `search` key, we assemble an SQL `where` clause.  We expect the search to be of the form `field=value` which we translate, via a regular expression, into `field like "%value%"` which is an SQL  *wildcard* search for that value anywhere within the field. This is just an example of how a search could be translated, many others would be just as good.  The REST API we are dealing with is not meant for direct human consumption so its syntax could be far more complex and/or cryptic,  after all, there will be client-side software to translate it from the user request.

As expected, we then [test it](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-8-2/test/server.js#L90-L144).

## SQL Injection

The previous example shows us the danger of relying on information coming from a remote client to build an SQL statement.

```js
it('SQL injection ', function () {
  return http.get('/projects?fields=* from sqlite_master;select *')
    .then(response => {
      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.contain('application/json');
      let data = response.data;
      expect(data).to.be.an.instanceof(Array);
      console.log(data);
    });
});
```

Our server code accepts two query parameters, `fields` and `search`.  The first is expected to contain a comma-separated list of field names such as `/projects?fields=name,pid` but what if it doesn't? In the [example](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-8-3/test/server.js#L117-L126) above we cheated the server and injected an extra SQL statement for the server to execute.  When that request is executed, the server will produce:

```sql
select * from sqlite_master;select * from projects
```

Many database engines can return the result of two queries at once or will return one or the other.  In this case, SQLite returns the first and ignores the second. The table `sqlite_master` is an internal table within SQLite that actually contains the information about all the other elements in the database.

```js
[ { type: 'table',
    name: 'projects',
    tbl_name: 'projects',
    rootpage: 2,
    sql: 'CREATE TABLE projects (\n  pid INTEGER PRIMARY KEY,\n  name TEXT,\n  descr TEXT\n)' },
  { type: 'table',
    name: 'tasks',
    tbl_name: 'tasks',
    rootpage: 3,
    sql: 'CREATE TABLE tasks (\n  tid INTEGER PRIMARY KEY,\n  pid INTEGER,\n  descr TEXT,\n  complete TINYINT,\n  FOREIGN KEY (pid) REFERENCES projects(pid)\n)' } ]
```

It lists the only two elements we have created, the two tables `projects` and `tasks` and the SQL statements used for the creation of each, listing the fields and constraints for each.

We could then issue a HTTP GET request to  `'/projects?fields=* from projects;select *'` or any other table we had.

This process is called SQL Injection and it is one of the main exploits to steal data from servers. We should [always check](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-8-4/server/routes.js#L40-L47) the data received.

```js
if (req.query.fields && !/^\s*\w+\s*(,\s*\w+\s*)*$/.test(req.query.fields)) {
  res.status(400).send('Bad request');
  return;
}
if (req.query.search && !/^\s*\w+\s*=\s*\w[\w\s]*$/.test(req.query.search)) {
  res.status(400).send('Bad request');
  return;
}
```

[Our test](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-8-4/test/server.js#L117-L127) now shows that trying to inject anything unexpected fails.

We should never trust the information coming from a remote source.  It might not actually be a user on a browser.
