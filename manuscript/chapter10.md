# Client side

## The way not to do it

Perhaps the best way to learn why we do things in a certain way is to see what would happen if we did it otherwise.  This is our new [`index.html` file](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-10-1/public/index.html) that shows the list of projects in the database.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>How to do a Todo App</title>
  </head>
  <body>
    <div id="contents"></div>
    <script src="../node_modules/axios/dist/axios.js"></script>
    <script>
      axios.get('/data/v1/projects')
        .then(response => {
          document.getElementById('contents').innerHTML =
            `<h1>Projects:</h1><ul>${
              response.data.map(item =>
                `<li><a href="project.html?${item.pid}">${item.name}</a></li>`
              ).join('\n')
            }</ul>`;
          document.title = "Projects";
        });
    </script>
  </body>
</html>
```

In the body we create a `<div id="contents">` to put our page content in.  We then load Axios, our HTTP request library from `node_modules`. We added a [new route](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-10-1/server/index.js#L21) for static content to our Express server to let it access `node_modules`. Since the browser doesn't know about NPM and `package.json` we have to be very specific regarding the exact location of the file we are loading as the browser won't look for it.  As a matter of fact, our server-side NodeJS script would load the version in `axios/lib` while we load the one in `axios/dist`. They are slightly different and we will see why later.

The code in this page simply sends an HTTP GET request to `'/data/v1/projects'` using Axios, just as we have already done in our Mocha tests in earlier chapters. On receiving the response, we locate the `<div>` by its ID and set its `innerHTML` to the string we compose using ES2015 template strings. With the ability to interpolate any sort of expressions into the template placeholders and the ability to extend to multiple lines, this looks pretty much like using PHP jumping in and out of HTML to PHP mode or, in this case, from template string to JS expression.

We have done pretty much the same with [`project.html`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-10-1/public/project.html) with a different template and a different data request.  For `project.html` we [build the URL](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-10-1/public/project.html#L12) dynamically:

```js
axios.get(`/data/v1/projects/${window.location.search.substr(1)}`)
```

To try out this pages, we start the server as usual with `npm start` and then navigate to `http://localhost:8080` to get the project list and, by clicking on any of the projects, to each of the tasks list.

Depending on which browser we have and which version it is, this app may or may not work. EcmaScript 2015 is just starting to show up in some browsers and neither template strings or fat arrow functions might work. These are changes to the language itself, a pre-ES2015 browser will not understand the script. It certainly will not for most of our potential users.

## Polyfills

Older browsers will also lack Promises which Axios uses extensively. This is a different kind of error because this can be patched, it is a missing global object which can be added. It can also be a property within an existing object, such as `Object.keys` which can also be added. These are called *polyfills* and, if you check, for example, Mozilla's documentation, you [will see](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#Polyfill) such polyfills listed for each method recently added.

Thus, we can change our code to make it available to more browsers.  It doesn't take long, we just need to add a [couple of external scripts](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-10-2/public/project.html#L10-L12) and change something.

```html
<script
  src="//cdn.polyfill.io/v1/polyfill.min.js?features=Promise" defer async
></script>
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.min.js"
></script>
<script type="text/babel">
</script>
```

We simply added two extra external scripts.  The first one, from `polyfill.io` is from [FT Labs](http://cdn.polyfill.io/v1/docs/), the web development team at the Financial Times newspaper. It reads the `user-agent` header from the HTTP request which identifies which browser is making the request, for example, in the one I'm using right now, it shows:

```
User-Agent:Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.97 Safari/537.36
```

In this case, this strings identifies the browser as Google Chrome major version 48.  It then goes to its own [features table](http://cdn.polyfill.io/v1/docs/features/) and decides it doesn't need almost anything and returns less than 1k of polyfills.  On the other hand, if I go to my old laptop with IE9 the polyfills add up to almost 5k. In this case, the base URL has `?features=Promise` added because developers might not be using Promises at all or might have already been using their own polyfill for that so FT Labs polyfill service doesn't include it by default and you have to request it explicitly.

## Transpiling

As for the language issue, it is somewhat more complex because it is a change to the language itself, not just to a part of its built-in library.  To deal with that, we need a *transpiler*, a sort of compiler that instead of generating native machine code, it simply translates source code from one version of a language to a different version of the very same language.

Here we are using [Babel](http://babeljs.io/) which has become the standard.  We are loading the browser version of Babel to let it transpile on the client-side.  To let Babel know what it is expected to transpile, we have changed the `<script>` tag enclosing our code to signal it as of `type="text/babel"`. By default the type of `<script>` tags is `text/javascript` which will make the browser execute the code within.  However, if the `type` given is any other, the browser will do nothing.  That gives Babel a chance to do something about that code before the browser attempts to understand it.  Babel searches for all `<script type="text/babel">`, transpiles them and executes the resulting code.

This is what Babel ends up with for the code in [`project.html`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-10-2/public/project.html#L13-L25) in IE9 (Babel skips transpiling features that the browser supports natively so in my latest Chrome, Babel does nothing):

```js
function anonymous() {

'use strict';
axios.get('/data/v1/projects/' + window.location.search.substr(1)).then(function (response) {
  var prj = response.data;
  document.getElementById('contents').innerHTML = '<h1>' + prj.name + '</h1><p>' + prj.descr + '</p><ul>' + Object.keys(prj.tasks).reduce(function (prev, tid) {
    var task = prj.tasks[tid];
    return prev + ('<li><input type="checkbox" ' + (task.complete ? 'checked' : '') + ' /> &nbsp; ' + task.descr + '</li>');
  }, '') + '</ul>';
  document.title = 'Project ' + prj.pid + ': ' + prj.name;
});
}
```

All the fat arrow functions have been changed to regular functions and the template string replaced by a simple concatenation of small segments of string. If `this` had been used at any point within the fat arrow function, Babel would have provided a copy of the context of the enclosing function for the inner function to use. It is smart enough to know when it is not needed at all so in more modern browsers, it doesn't change the code at all.

However, even if not used, Babel is a hefty load. It doesn't make sense to force such a big download and hefty processing to the client.  To any client, some powerful, some not so much, some with good and high speed connections, some on a tablet on a 3G cell-phone network.

That is why the above mechanism has been deprecated by the developers of Babel.  I doubt that it has ever been used on a production environment at all. Instead, we will transpile off-line as part of the development process.

To do that, we will install the command-line version of Babel:

```
npm install --save-dev babel-cli
npm install babel-preset-es2015 --save-dev
```

This installs Babel and the presets to transpile EcmaScript 2015 and also saves the dependencies to `package.json` which we will also edit to add an [extra script](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-10-3/package.json#L11):

```json
"scripts": {
  "start": "node server/index.js",
  "lint": "eslint . || exit 0",
  "test": "mocha",
  "coverage": "istanbul cover node_modules/.bin/_mocha",
  "build": "babel client --presets es2015 --out-dir public/lib"
},
```

This will allow us to transpile every script found in the `client` folder, using the es2015 presets into the `lib` folder under the `public` folder which we already reserved for files meant for the browser, already converted to old-style JavaScript.

Thus, we need to separate the in-line scripts from the html files and place them in the `client` folder.  For example, [`client/project.js`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-10-3/client/project.js) looks like this:

```js
/* globals axios:false */
'use strict';
axios.get(`/data/v1/projects/${window.location.search.substr(1)}`)
  .then(response => {
    let prj = response.data;
    document.getElementById('contents').innerHTML =
      `<h1>${prj.name}</h1><p>${prj.descr}</p><ul>${
        Object.keys(prj.tasks).reduce((prev, tid) => {
          let task = prj.tasks[tid];
          return prev + `<li><input type="checkbox" ${
            task.complete ? 'checked' : ''
          } /> &nbsp; ${task.descr}</li>`;
        }, '')
      }</ul>`;
    document.title = `Project ${prj.pid}: ${prj.name}`;
  });
```

The first comment is for the benefit of ESLint so it knows about `axios` which is loaded and available as a global.  Except for that, the code is the same as it was in `projects.html`.

Now, if we do:

```
npm run build
```

Babel will create two files in `/public/lib` for each of the original JS file.  They look just like the one shown before produced by the in-browser transpiler plus the addition of a *sourcemap*, a cross-reference for debuggers to associate the code they are actually executing with the original code before transpiling.  This is a large encoded string enclosed within a comment.

We now have to [include it](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-10-3/public/project.html#L11) into the HTML page and drop the Babel in-line compiler:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>How to do a Todo App</title>
  </head>
  <body>
    <div id="contents"></div>
    <script src="../node_modules/axios/dist/axios.js"></script>
    <script src="//cdn.polyfill.io/v1/polyfill.min.js?features=Promise" defer async></script>
    <script src="/lib/project.js"></script>
  </body>
</html>
```

Finally, since the files in `/public/lib` are generated as the product of those in `/client`, we add them to [`.gitignore`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-10-3/.gitignore#L29) so they don't get uploaded into the GitHub repository. We also add that folder to [`.eslintignore`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-10-3/.eslintignore#L3) so they won't be linted, because they will fail.  We have also added a [`/client/.eslintrc.json`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-10-3/client/.eslintrc.json) to tell ESLint that the contents of that folder are meant to be run in a browser so it should expect to find well-known globals such as `window` or `document`.
