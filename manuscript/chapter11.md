# Modules, Imports and Exports

Only recently, with EcmaScript-2015 has JavaScript has built-in support for modules, at least in its syntax since no platform actually knows what to do with it.  Babel helpfully transpiles `import x from 'myModule'` into `const x = require('myModule')` which NodeJS understands but no browser would.

The only mechanism to load external modules into a browser is via the `<script>` tag which is far from perfect.  The biggest issue is that whatever gets loaded goes into the same global namespace as everything else. If you had complete control of what goes into the browser you could be careful of what gets loaded and avoid any name collisions, however, with applications getting ever more complex, this is hard. What if you are using [Lodash](https://lodash.com/) and some widget loads [Underscore](http://underscorejs.org/) both of which load as `window._` in your browser? The one that loads last would end up overwriting the other and, though they are more or less compatible, Lodash is a superset of Underscore and whatever incompatibility there might be in between them might ruin your application.

The beauty of the way NodeJS modules load, is that when you `require` a certain module, you tell it where you want it, both in name and scope, you say `const axios = require('axios');` because you want it to be called `axios` in whichever scope that `axios` variable is being declared and, if you wanted it called something else, you could do `const http = require('axios');`.  In browser-land, you don't have that option, you load Axios via `<script>` and it goes into `window.axios`, you have no control of name (axios) or scope (global).

This prevents the development of modular applications.  In our server script, we broke our simple app into several source files which *require*d one another each keeping its internals well hidden from each other exposing only what each explicitly exported.  Over time, several mechanisms to fix this were developed and nowadays, two module packagers are at the top, [Browserify](http://browserify.org/) and [WebPack](http://webpack.github.io/).

Inadvertently, we have been using WebPack all along. Remember earlier on that we mentioned there were different versions of Axios, one for NodeJS (which we used for our tests) and the browser version?  Our `node_modules/axios` folder contains two different folders, `dist` for the browser version and `lib` for the NodeJS version.  Looking at the first few lines in the code for the [browser version](https://github.com/mzabriskie/axios/blob/master/dist/axios.js) we can see it starts with `(function webpackUniversalModuleDefinition(root, factory) {` and later on we find a lot of lines preceded with `/******/`.  All those are added by WebPack. The Axios version on `/lib` is the original, non-packed version and we can see that the same code from [/lib/axios.js](https://github.com/mzabriskie/axios/blob/master/lib/axios.js#L1)   starts about line 60 something in [`/dist/axios.js`](https://github.com/mzabriskie/axios/blob/master/dist/axios.js#L64) after all the WebPack packaging handling stuff.

## WebPack

To install WebPack, we do as we've done so far:

```
npm i --save-dev webpack
```

We can change our code to use [`require`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-11-2/client/index.js#L1) just as we've done in the server-side code:

```js
const axios = require('axios');
axios.get('/data/v1/projects')
  .then(response => {
    document.getElementById('contents').innerHTML =
    `<h1>Projects:</h1><ul>${
      response.data.map(item =>
        `<li><a href="project.html?${item.pid}">${item.name}</a></li>`
      ).join('\n')
    }</ul>`;
    document.title = 'Projects';
  });
```

Which means we no longer need to load Axios separately in [`index.html`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-11-2/public/index.html) since our web-packaged code will already contain it:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>How to do a Todo App</title>
  </head>
  <body>
    <div id="contents"></div>
    <script src="//cdn.polyfill.io/v1/polyfill.min.js?features=Promise" defer async></script>
    <script src="lib/index.js"></script>
  </body>
</html>
```

We can add the following script to [`package.json`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-11-2/package.json#L11) to run this option:

```json
"scripts": {
  "webpack": "webpack client/index.js public/lib/index.js && webpack client/project.js public/lib/project.js"
}
```

So if we now do `npm run webpack` we will have our code packaged with Axios. If we look into the resulting files in `/public/lib` we can recognize our code right after the WebPack un-packager and then the code for Axios.

There are, however, some obvious problems with this.  If we keep adding separate pages to our app, the `script.webpack` command in `package.json` will keep getting larger.  Then, the packed code has not been transpiled so it won't work in older browsers.

WebPack can use what it calls *loaders*, utilities that process the code before it gets packed.  Babel has such a loader for WebPack, which we can use:

```
npm install --save-dev babel-loader babel-core
```

To tell WebPack what loaders it should use, we add a [configuration file](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-11-2/webpack.config.js) which, by default, is called `webpack.config.js`:

```js
module.exports = {
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      }
    ]
  }
};
```

Here, we are telling WebPack that for files whose filename match the given regular expression (in this case, they end with `.js`), it should use `babel-loader`.

We also need to configure Babel. Earlier on, we did it via an option in the NPM script:

```
babel client --presets es2015 --out-dir public/lib
```

We can also configure Babel via a configuration file called [`.babelrc`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-11-2/.babelrc):

```json
{
  "presets": ["es2015"]
}
```

After all this, if we do `npm run webpack`, we will get both JS files transpiled and packed.

That means we will no longer be using Babel standalone so we might as well drop `babel-cli`:

```
npm uninstall --save-dev babel-cli
```

We may also drop our earlier `script.build` option in `package.json` and rename `script.webpack` as `script.build`.

Now, we should make some numbers, the resulting `index.js` is 32.2kB in size, `project.js` is 32.4kB.  Most of it is due to Axios, a little bit is WebPack which is exactly the same for both.  The difference is in the pre-packaged sources, `/client/index.js` which is 341 bytes long while `/client/project.js` is 594 bytes long.

This might seem an extreme situation because we are doing so little in our code, but it is not that different from a real application.  We are using just two common libraries, Axios and WebPack.  In larger applications we would have more such common utilities, for example, standard UI components such as calendars, tabbed interfaces, menus and what not.

We are forcing our web pages to load two scripts which are basically the same.  With little effort, we could pack both our client scripts into the same bundle with Axios and WebPack and have our client do just one load. Once the script is in the browser's cache, all pages would benefit from that single download.

To do that, we must first convert our two separate scripts to loadable modules and to do that we have to export something.

```js
const axios = require('axios');
module.exports = function () {
  axios.get('/data/v1/projects')
    .then(response => {
      document.getElementById('contents').innerHTML =
      `<h1>Projects:</h1><ul>${
        response.data.map(item =>
          `<li><a href="project.html?${item.pid}">${item.name}</a></li>`
        ).join('\n')
      }</ul>`;
      document.title = 'Projects';
    });
};
```

We [export a function](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-11-3/client/index.js#L2) that, when called, will execute the very same code we had so far.  The code above is for `client/index.js` and we simply have to [do the same](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-11-3/client/project.js#L3) for `client/project.js`.

Now we have to glue them together which we do with [`client/glue.js`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-11-3/client/glue.js):

```js
const index = require('./index.js');
const project = require('./project.js');

if (/^\/(index\.html)?$/i.test(location.pathname)) {
  index();
} else if (/^\/project\.html$/i.test(location.pathname)) {
  project();
} else {
  document.getElementById('contents').innerHTML =
    `<h1>Page ${location.pathname} is not available</h1>`;
}
```

We require both modules then, depending on the path of the URL requested, we execute one or the other.  The path might be either '/' or `/index.html` for the default page or `/project.html`.  If it doesn't match any of the regular expressions for them, we simply show a message. The later should never happen since this script would be loaded by either of those HTML pages.

Now, instead of building two separate packages, we build just one which includes both options.  We can do that by using the [WebPack configuration](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-11-3/webpack.config.js) file `webpack.config.js`:

```js
module.exports = {
  entry: './client/glue.js',
  output: {
    path: __dirname + '/public/lib',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader'
      }
    ]
  }
};
```  

We are telling WebPack that the entry point for our app is `/client/glue.js` and our packaged file should be called `bundle.js` and will go into `/public/lib`.  WebPack loads the file that is the entry point, parses it and locates all its calls to the `request` function, then loads and parses those looking for their `require`s and so on until it packages all of the dependencies into `bundle.js`.

The [build script](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-11-3/package.json#L11) in `package.json` is now far simpler since all the information is now in the configuration file:

```json
"scripts": {
  "build": "webpack"
}
```

We also need to change both [`index.html`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-11-3/public/index.html) and [`project.html`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-11-3/public/project.html) because instead of each loading its own separate JavaScript file, they both load `bundle.js` which, with the glue and all, has grown to 33.3kB:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>How to do a Todo App</title>
  </head>
  <body>
    <div id="contents"></div>
    <script src="//cdn.polyfill.io/v1/polyfill.min.js?features=Promise" defer async></script>
    <script src="lib/bundle.js"></script>
  </body>
</html>
```

Not surprisingly, both HTML files are exactly the same, their content determined by the single JavaScript file `bundle.js` which decides what to show.  Unfortunately, the browser doesn't actually know the two files are alike, since each comes from a different URL it will load each HTML file separately.  Even if we told our Express server to send the same page, the browser would request them as if they were different things.  It would be good to be able to tell the browser to load it only once.

Also, the `glue.js` file, basically, what it does is checking for matches on pathname part of the URL, which is similar to what the Express server does with its routing component.

Fortunately, there is already software to do both things, client-side routing software can handle routes pretty much as Express does and will capture navigation requests and prevent them from generating unnecessary traffic.
