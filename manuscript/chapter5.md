# REST

Representational State Transfer, [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) is the standard way in which plain data, that is, not formatted for human consumption, is requested and transfered in the Web.

Every piece of data in the web can have an URL (or more precisely an URI, but we won't dwell on the difference) and from previous chapters, we know how we can respond to any URL our server receives.

Once we identified the data, we need to tell the server what to do with it. We have the HTTP request codes for that.  In data handling terms we have four basic operations known by their initials: Create, Read, Update and Delete (CRUD).  These map one to one with the HTTP request methods we've already mentioned though, unfortunately, they don't result in any acronym we could use:

* Create: POST
* Read: GET
* Update: PUT
* Delete: DELETE

So, if we do a GET to our server for, say, `/employees` we will get a list of all employees, but if we ask for `/employees/123435` we will get more detailed information about an employee with that record number.  If we POST an employee record to `/employees` it means we want to create a record for a new hire.  The server will respond with the record number it assigned to that employee (assuming, as it is often the case, that it is the server that assigns the record identifier). If we do a DELETE on `/employees/123435` that record would be deleted while if we do a PUT along some information, for example, a new home address because the employee has moved, the record for that employee would get updated.  In theory this scheme can be stretched to absurd limits `/employees/12345/lname/2` might mean the second character of the last name of that particular employee which just serves to show how generic and flexible URIs can be though it would be impractical to stretch it that far.

REST requests can be further qualified with query parameters.  For example, a GET on `/employees?search=lname%3DSmith` instead of bringing up the list of all employees would only return the results of performing the database search for employees whose last name is Smith: `lname=Smith` (the %3D is the url-encoding of the equals sign).  

We might handle further qualifiers, for example, `/employees?search=lname%3DSmith&fields=fname,ZIPcode` would return the names and postal codes for all the Smiths in the database.

It is also important to know who is asking for the information.  Nobody wants their salaries disclosed to just about anyone.  So, beyond what the URL says, the server has to decide whether someone can access or change some particular piece of information.  Usually this is done through *cookies*.  In the previous chapter we have already seen how to [deal with cookies](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-4-4/server/index.js#L25-L36) using the `cookie-parser` middleware.  After the user is positively identified (logs in) we send as a cookie some temporary token that allows us to recognize that user during one particular session, and know his/her permissions.

Defining what URLs we support and the expected responses is a very important part of defining a project.  Many large web services companies have very well defined public APIs, for example [GitHub](https://developer.github.com/v3/repos/) or [Google](https://developers.google.com/gmail/api/v1/reference/), though some might adopt some [proprietary format](http://wiki.freebase.com/wiki/Mql).

Defining our API also allows us to split the responsibility of the project in between separate people, the server-side team dealing with responding to these requests and the client-side team taking care of requesting and presenting this information to the user and translating the user commands into server requests. The REST API is the contract in between these two teams.

## Defining our REST API

First, we have to separate our data requests from any other request our web-server might have to serve. Thus, the root for all our data requests will be `/data`.  This doesn't mean we have to create a folder of that name, it is simply a path our server will respond to.

Occasionally, it is a good idea to reflect on our own fallibility. We might get things wrong and if we define our API too rigidly, we might get in trouble. To be able to change our API in the future it is better to include a version number in our API requests so, if we ever have to change it, we change the version number. For a time, we can respond to requests in either format, both versions coexisting until everything gets updated and the old version finally gets dropped.  For this API we will then use the prefix `/data/v1`.

For our application, we will have a series of projects and for each project a series of tasks to perform.  This is just a twist on the popular TODO list application with one such TODO list for each of our projects.  This would be our API:

Method | URL | Description
-------|-----|----------
GET | `/projects` | Returns list of project ids, names and descriptions
GET | `/projects/:pid` | Returns name and description of the given project and its list of tasks, providing their id, description and completion status
GET | `projects/:pid/:tid` | Returns the task id, description and completion status for a particular task within a particular project
POST | `/projects` | Accepts name and description for new project, returns project id
POST | `/projects/:pid` | Accepts description and completion status for new task for given project, returns the id for the new task. Completion status defaults to false.
PUT | `/projects/:pid/:tid` | Updates the given task with the information in the body
DELETE |`/projects/:pid/:tid` | Deletes the given task
DELETE |`/projects/:pid` | Deletes the given project and all its tasks

The REST standard doesn't really force you to do things in any particular way.  For example, deleting a project should also delete all existing tasks or should it fail if the task list is not empty?  When creating a new record, which fields are mandatory and which have defaults?  That behavior has to be described.  

Optional query parameters should also be specified such as those that allow queries by field value or to enumerate the fields to be returned, as we commented earlier.

For the time being, we will store our information in memory.  This is certainly not practical for any real-life application, but it will help us concentrate on issues other than data storage. Our data comes from a [JSON file](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/data.json) which we will read and keep in memory.

We need to [load](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/index.js#L6) the [FileSystem](https://nodejs.org/docs/latest/api/fs.html) package which is included in the NodeJS distribution so we don't need to install it via NPM.

```js
const fs = require('fs');
```

We then use the [`readFile`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/index.js#L12) method to read the full file.  To compose the pathname to the file we use the [`path.join`](https://nodejs.org/docs/latest/api/path.html#path_path_join_path1_path2) method in a similar way we did when we set the folder to fetch static content from.

```js
fs.readFile(path.join(__dirname, 'data.json'), (err, data) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  global.data = JSON.parse(data);

  // ... rest of code

});
```

The `readFile` method is asynchronous so we have to provide a callback for it to tell us when the read has succeeded.  In most NodeJS async methods, the first argument is an error object which, if it is not `null`, means the operation has not succeeded.  If that is the case, we show the error and exit.  Otherwise, the second argument `data` will contain the full contents of the file.  Since it is in JSON, we parse it and save it to `global.data`.

As it name implies, [`global`](https://nodejs.org/docs/latest/api/globals.html) is NodeJS global object, available everywhere, much as the `window` object is in a browser.  Every property of `global` is accessible just by name, for example, there is `global.setTimeout` just like there is a `window.setTimeout` in the browser and both can be called by its name, `setTimeout`, the global name being implicit.  We have already used a couple of such properties.  Both `__dirname` and, to some extent, `require` are properties of `global`.

We can make our own properties globally accessible just by setting them as properties of `global`, we just have to make sure we are not colliding with an existing property.  Since we are going to use the data we've just read everywhere, it makes sense to make it globally accessible.

Our earlier server code has been trimmed of all those `app.get( ... ` routes we had put there to try out different features, which we don't need any more.  There is another change that might pass unnoticed, the earlier code is now contained [within the callback function](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/index.js#L13-L32).  This is because only if and when we succeed reading the `data.json` file it makes any sense to start the web server.  It would make no sense to start it if there is no data to serve.

The Express server has a default router which we have been using so far.  All those `app.get` we wrote earlier are registered with the default router which will dispatch each of the callbacks according to the path in the URL received.  When you have many routes sharing the very same prefix, in this case `/data/v1`, it is inefficient (and boring) to repeat it over and over again.  For these cases we can create an [additional router](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/index.js#L21-L23) that will respond to that prefix and will deal with the rest of the path.

```js
const dataRouter = express.Router();

app.use('/data/v1', dataRouter);

routes(dataRouter);
```

First, we request a new router instance from Express which we call `dataRouter`.  We tell our instance of the Express server to `use` that router to deal with paths starting with `/data/v1`.  Finally, we call `routes` and provide it with this router instance.

Where did `routes` came from?  It is a module we created ourselves. Earlier on [loaded it](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/index.js#L8) via:

```js
const routes = require('./routes.js');
```

The `routes` comes from the file [`./routes.js`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/routes.js) which we created ourselves.  When the `require` function gets a module name starting with `.` or `/` it will not search for that module in the usual places (`node_modules`) but will assume you are providing a full file name to a very specific file and load that one instead.

Loading modules in NodeJS is not the same as loading them in the browser via the `<script>` tag. In the browser, everything in the loaded file gets merged into whatever is already there, as if all those JavaScript files were concatenated together. This can get quite messy as all the variables declared in all files get into the same name space, possibly colliding with one another.

In NodeJS when you `require` another module, you only get to see whatever the loaded file exports.  In our sample, we [export a *fat arrow* function](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/routes.js#L2) which will receive our router instance.

```js
module.exports = router => {
```

Since what we exported is a function, on the other side, we can [execute it](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/index.js#L25):

```js
routes(dataRouter);
```

For example, we respond to the `/projects` path [like this](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/routes.js#L4-L10):

```js
router.get('/projects', (req, res) => {
  res.json(Object.keys(data).map(pid => ({
    pid: pid,
    name: data[pid].name,
    descr: data[pid].descr
  })));
});
```

We send the JSON reply (`res.json`) as an array produced by the `map` method of the Array instance that `Object.keys` returns.  This array will be the project ids of each of the projects.  We then use that `pid` to assemble each item in the response with the `pid` then the `name` and description `descr`.  Since `data` was set as a global [earlier](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/index.js#L17) we can use it freely here.

We can use `res.send` instead of `res.json` since when Express is requested to send an Object or an Array, it will JSON-encoded.  However, it is better to state our intent as clearly as possible.

We can try it out by starting our server via `npm start` and then, in a browser go to `http://localhost:8080/data/v1/projects` which will show in our browser more or less like this:

```json
[{"pid":"25","name":"Writing a Book on Web Dev Tools","descr":"Tasks required to write a book on the tools required to develop a web application"},{"pid":"34","name":"Cook a Spanish omelette","descr":"Steps to cook a Spanish omelette or 'tortilla'"}]
```

It might not look good but it is not meant to be seen by humans, it is meant for our client-side code to read.  

For our [second route](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/routes.js#L12-L19) `'/projects/:pid'` we need to access the `pid` which we do by using `req.params.pid`:

```js
router.get('/projects/:pid', (req, res) => {
  let prj = data[req.params.pid];
  if (prj) {
    res.json(prj);
  } else {
    res.status(404).send(`Project ${req.params.pid} not found`);
  }
});
```

If we find no actual project for that number, we respond with a regular `404` HTTP response code, however, in this case it is not a page that was not found but a specific project. We response very much the same way for the [next route](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/routes.js#L21-L33) whether the project or the task is not found.

For a POST operation, that is adding a new record, we have to receive data, not send it.  We cannot receive large amounts of data via the URL as we have been doing with the few parameters we have been using so far.  To be able to receive data we need to access it from the body.

We have access to `req.body` because we already loaded the `body-parser` middleware.  Since we are only going to use JSON on the REST data exchanges, we will [parse JSON](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/index.js#L19) only on the `/data` path.  We don't include the version part of the path since it is fair to assume that other versions would use the same data format.  Most middleware such as `body-parser` is quite versatile and tolerant.  If in a later version  we decide to use another data format, instead of failing, `body-parse` will let it go through, expecting that some later parser might deal with it.  Also, if we want to parse JSON on another path, we can add as many instances of `body-parser` elsewhere as needed.

To [create a new project](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-5-1/server/routes.js#L35-L41) we first try to create a new project id `pid`.  It might seem strange that we go through so much trouble to get a `pid` when we might as well push the new record into an Array of projects and figure out its position.  As it happens, we don't want to use an Array even though our indexes are numeric, because items within an array can move and what now has index 10 may become 9 after record 5 was deleted.  Though within JavaScript empty Array slots take no memory, there is no way to skip over empty slots in JSON.  We want our `pid`s and `tid`s to be permanent and not be just temporary indexes.  That is why we take so much trouble doing all this.  In an SQL database, we would use an auto-increment integer field, in a noSQL database, we would take whatever unique record identifier that the database generated for us.

```js
router.post('/projects', (req, res) => {
  let pid = Object.keys(data).length;
  while (pid in data) pid++;
  let prj = Object.assign({name: '', descr: ''}, req.body || {});
  data[pid] = prj;
  res.json({pid: pid});
});
```

We count how many keys our `data` object has and try that for our `pid`.  We check whether there is already a record with that key and if there is, we increment it.  

We build our new record using `Object.assign` to merge a couple of default values with the data coming from the client in `req.body`.  Since there might be no data (we might want to validate for that) we also default to an empty object.

We then store that project record into the array at the position given by our new `pid` and return that `pid` to the client.

For updating records via `put` we first locate the existing record (project or task) and use `Object.assign` to merge the new values from `req.body` into the existing record.  We return an error if the record does not exist.

For deleting we simply delete the whole entry.  We first try to locate the record to be deleted and return an error if not found.  We might have handled things differently.  We might not check for the existence of the record assuming that if not found it has already been deleted, which should be fine as that is what the user wanted.  We might have also returned the old record as it was before deletion though, being a potentially big piece of data, it might be a waste of bandwidth.  If the client code wanted it, it might have gotten it first.
