# Client-side Routing

In our latest version of [`glue.js`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-11-3/client/glue.js) we used regular expressions to match the URL of the page requested to the routes we are handling so as to run either of our rendering scripts.  Basically, it is the equivalent of what we've been doing in the server thanks to Express.  There is client software to do the same on the client.  This is our [routes configuration](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-1/client/glue.js#L11-L19):

```js
const routeConfig = {
  path: '/',
  component: App,
  indexRoute: { component: Index },
  childRoutes: [
    { path: 'index', component: Index },
    { path: 'project/:pid', component: Project }
  ]
};

```

It is easy to relate the array of routes under the `childRoutes` property, they are basically the same as we had before with some minor differences. They lack the `.html` ending and the `pid` is part of the route path instead of a query parameter.  As a matter of fact, in the earlier example, it was the `project.js` module the one that read the `pid`.  Here it is more like in Express, where the router picks it up from the route itself. Likewise, route matching is sequential within an array so the order is important.

Routes in the client work somewhat different than in the server. In the server routes result in running some piece of script that sends a stream of HTML code, images, JSON data, images or any other sequential collection of bytes with a single call to `res.send()` or its variations.

Routes in the client are meant to affect a two-dimensional screen where each part of the route might influence a particular section of it.  For example, most web pages will have a standard look, starting with an enclosing frame with the basic color scheme, the company logo, a copyright sign and so on.  Within that frame there might be other standard sections such as a header or footer, perhaps a menu or tabbed interface and finally, there will be one or more sections that are totally dependent on the route.  For example, a mail-client program will have a central section that contains the list of folders for the `/`, a list of messages in the inbox for `/inbox` or a particular message for `/inbox/de305d54-75b4-431b-adb2-eb6b9e546014`.

That is why client-side routes are hierarchical and why our routes from the previous example are `childRoutes` within the root route.  Each fragment in the path of a route might affect a separate part of the screen, each rendered by a separate `component`. For our previous routes we include the `Index` and `Project` components which are React versions of the former [`index.js`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-1/client/index.js) and [`project.js`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-1/client/project.js), as we will soon see.  For our overall frame, we have an `App` component which is quite simple indeed:

```js
const App = props => props.children;
```

Basically, what it says is that the frame should just return whatever the children produce.  Of course it usually is something more elaborate, some frame, logo or some such, but right now, this should suffice.

With the `indexRoute` option we are also telling the router that when no route is specified, the `Index` component should be shown.  In other words, we are defaulting to showing the `Index` component whether we explicitly ask for it with `/index` or not.

## React Router

We are using [React Router](https://www.npmjs.com/package/react-router) which works along [React](https://facebook.github.io/react/) so we first have to install those.

```
npm i --save react react-dom react-router history
```

We install these with the `--save` option, not `--save-dev` because they are part of the production code, not just development tools, and so they go into the [`dependencies`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-2/package.json#L39-L42) section of `package.json`. Besides React and React Router, we are installing `react-dom` which contains the parts of React specific to browsers as opposed to other possible environments such as smart-phones or future platforms, and `history` which complements the router by letting it manipulate the browser history and respond to the *back* and *forward* buttons.

We can then [use](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-2/package.json#L39-L42) those packages into our script:

```js
import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
```

The magic of Babel transpiling allows us to use both the new ES2015 `import` statement and the CommonJS `require` function.  The new `import` statement allows us to import whole packages such as `React` or just one or more named exports within a package such as `render` from `react-dom` or `Router` from `react-router` (actually, it is ES6 *destructuring* that lets us pick the pieces we want, more on that later).

With all these pieces, we must put this `routeConfig` to [work](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-1/client/glue.js#L21-L30):

```js
render(
  React.createElement(
    Router,
    {
      routes: routeConfig,
      history: createBrowserHistory()
    }
  ),
  document.getElementById('contents')
);
```

We are asking React to `render` a new React element provided by `Router` into the `<div id="contents">` we have on our `index.html` page.  This will not be a visible DOM element itself, it will produce the DOM elements we will eventually see in the web page. We provide this `Router` element with two configuration elements, the `routes` that it should process and which `history` manager it should use.  The `history` package provides with several means to handle history but the only one that is worth serious consideration in production is `browserHistory`.  It is not the default because it requires some support from the server. We need to add an [extra route](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-1/server/index.js#L21-L25) to our Express server:

```js
app.use(express.static(path.join(__dirname, '../public')));

app.get('*', function (request, response) {
  response.sendFile(path.join(__dirname, '../public', 'index.html'));
});
```

Thanks to our client-side router, our application will be able to respond to several *virtual* URLs which don't actually exist on the server side.  At any time, the user might save one of those URLs or copy and paste them into an e-mail to pass them on to someone else.  What happens when any of those URLs are requested?  If the user had started the application from the home page, all routing would be handled by the client but, if out of the blue, the user requests one of those virtual URLs, the request will go straight to the server, but there is no actual file there to be sent back to the user.   That is why we have to add this route.  We add it at the very end of the list.

So far, if the URL requested was for any of the known paths such as `/data/v1/projects` there was a piece of script to handle it, otherwise it felt through and got to that `express.static` middleware which tried to find a file that mapped to the requested path.  Then, if no file was found, a 404 Not found error would be sent.  Actually, it is not the `express.static` middleware that replies in that way.  If the file is found, the middleware will send it, if it doesn't, it calls the `next()` callback.  It is Express itself, not the static files middleware that, when reaching the end of the list of routes and route patterns, has nowhere else to look for and sends the 404 reply. All this means is that you can add further routes after `express.static`.  

The wildcard `'*'` route means that for absolutely any leftover route the file `/public/index.html` will be sent.  That will load and run our application and then the client-side router will deal with that route.

This also means that our client-side App must deal with the 404 Not found condition on its own because the server will never send that error on its own. We do this by adding a wildcard route at the end of the child routes:

```js
childRoutes: [
  { path: 'index', component: Index },
  { path: 'project/:pid', component: Project },
  { path: '*', component: NotFound }
]
```

Since the routes are matched in sequence, the last wildcard catches any route that failed to match and it shows the `NotFound` component, which is simply declared this:

```js
const NotFound = () => (<h1>Not found</h1>);
```

That line of JavaScript doesn't look right, the `<h1>Not found</h1>` part should be quoted or something since it is not JavaScript but HTML. Any linter would signal it as an error and Babel would not be able to transpile it as we have configured it so far.   Actually, that is JSX and we will use it more extensively.

## JSX

[JSX](https://facebook.github.io/jsx/) is an extension to JavaScript designed by Facebook to embed HTML into plain JavaScript.  It is not a proposal for future JavaScript versions nor it is meant to be included in any browser but to be transpiled.

> If I may take a moment to brag about it, back towards the end of 2008 I made a proposal to embed HTML into PHP. I called it [PHT](http://www.satyam.com.ar/pht/) which resulted from a merger of the letters in PHp and HTml.  It was an extension to the [PHP Compiler](http://phpcompiler.org/) which could generate native code but could also serve as a transpiler.  I used is as a transpiler to create regular PHP out of PHT code.  Mechanisms to publish and make open source contributions back then were not widely available, no GitHub or any such popular sharing mechanisms, so the idea faded away.

JSX is based on the fact that the less-than sign `<` is a binary operator in JavaScript so it could not possibly be found at the start of an expression.  The JSX transpiler catches those unary `<` and takes care of dealing with what follows. If we are not sure whether the transpiler would consider a `<` to be a *less than* operator or JSX, we just open a parenthesis right before it, like in `(<h1> ...)` because that ensures the start of a new expression.

None of our code lints or compiles as it is.  We need [some help](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-2/package.json#L45) in dealing with JSX:

```
npm i --save-dev babel-preset-react eslint-config-airbnb eslint-plugin-react
```

We are installing a whole bunch of Babel extensions which are encompassed into a preset collection called `babel-preset.react`.  We need to tell Babel to use that preset by modifying our [`.babelrc` file](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-2/.babelrc#L2):

```json
{
  "presets": ["es2015", "react"]
}
```

Babel assumes the `babel-preset-` prefix to the names listed in the `presets` entry.

We are also loading a new ESLint plugin to handle React, which uses JSX extensively and a rules configuration file `eslint-config-airbnb`, which is the standard set of routes used by the [Airbnb](https://www.airbnb.com/) development team.   We are making use of a nice feature of ESLint which is that we can use different preset configurations in different folders.  We will be still using the `eslint-config-standard` presets for the server-side code, as we've been doing so far, but will use the Airbnb ones for our client side code.  To do that we simply add a [`.eslintrc.json`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-2/client/.eslintrc.json) file in the `/client` folder:

```json
{
  "extends": "airbnb"
}
```

The rules are extensively explained and, when not purely stylistic, thoroughly justified in their [GitHub repository](https://github.com/airbnb/javascript).  For the purpose of this book, it is just interesting to note that two teams, working in different environments, one in the server using native NodeJS with no transpiling, the other on the client with Babel, can use different styles and rules suited to their environment.

We can use JSX far more extensively.  All [our routes](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-2/client/glue.js#L12-L21) can be expressed in JSX:

```js
render((
  <Router history={createBrowserHistory()}>
    <Route path="/" component={App}>
      <IndexRoute component={Index} />
      <Route path="index" component={Index}/>
      <Route path="project/:pid" component={Project}/>
      <Route path="*" component={NotFound}/>
    </Route>
  </Router>
), document.getElementById('contents'));
```

We have already seen that to embed JSX we just need to start an expression with a `<`.  We can also embed plain JavaScript into JSX by enclosing any expression in curly brackets.  We do that with `{App}`, `{Index}`, `{Project}` and `{NotFound}`, which are `const`ants declared in JavaScript or `createBrowserHistory()` which is the result of executing a function.  Any sort of expression can thus be embedded, very much like we do in ES6 template strings by enclosing variable parts in `${ }`.

The React plugin for Babel creates plain JavaScript for all that JSX, it turns them into calls to `React.createElement`.  Some of these elements are plain HTML some are React components.  To tell them apart, HTML elements should be all lowercase, `<h1>` or `<div>` while React components should start with uppercase `<Router>` or `<IndexRoute>`.  That is why we changed our `index` and `project` references into `Index` and `Project`.

This is how our previous [`index.js`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-2/client/index.js) looks now using JSX for React:

```js
import React from 'react';
import { Link } from 'react-router';
const data = require('./data.js');

export default () => (
  <div className="index">
    <h1>Projects:</h1>
    <ul>{
      Object.keys(data).map(pid =>
        (<li key={pid}>
          <Link to={`project/${pid}`}>
            {data[pid].name}
          </Link>
        </li>)
      )
    }</ul>
  </div>
);
```

This is called a *stateless* component in React.  It is simply a function that returns whatever needs to be displayed.  Our earlier `App` and `NotFound` components were simple stateless components.  There are *stateful* components as well, which we will see later.

Besides plain HTML elements, we are using the `<Link>` component from `react-router`.  This component renders as a plain `<a>` element but is tied internally to the router so the link will not be actually followed but caught by the router and processed to the corresponding component.

There is also a `key` attribute added to each `<li>` element.  This is an optimization for React.  Whenever there is a repeated element such as the list elements within a `<ul>` it helps if we provide React with a unique id to tell them apart.  It helps it optimize the screen refresh specially when items are added or removed.

We can improve on this component by separating it into the list and the items:

```js
const PrjItem = ({ pid, name }) => (
  <li>
    <Link to={`project/${pid}`}>
      {name}
    </Link>
  </li>
);

export default () => (
  <div className="index">
    <h1>Projects:</h1>
    <ul>{
      Object.keys(data).map(pid =>
        (<PrjItem key={pid} pid={pid} name={data[pid].name}/>)
      )
    }</ul>
  </div>
);
```

The `PrjItem` component displays a single project item in the list.  We use it within the loop in the project list by using it as a JSX component `<PrjItem>` and providing it with what look like HTML attributes, `pid` and `name`.

The `PrjItem` component receives a *properties* argument, usually referred to as `props` which is an object containing all pseudo-HTML-attributes used when invoked.  Here we are using ES6 [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) to explicitly assign the relevant properties within the `props` object into variables that might well be considered function arguments.  The following segments of code are equivalent:

```js
const PrjItem = ({ pid, name }) => (
// --------------------
const PrjItem = props => {
  let {pid, name} = props;
}
// -----------------
const PrjItem = props => {
  let pid = props.pid;
  let name = props.name;
}
```

Destructuring is new to JavaScript in ES6, it is not JSX nor React. We have already used *destructuring* in the `import` statements.

The Router component uses properties to send information to the components.  We use that in [`project.js`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-2/client/project.js#L29-L36
) which should read the `pid` from the route. Just as Express does on the server-side, Router also provides a `params` object with the decoded parameters which we can then retrieve from the `props` argument using, once again, *destructuring*:

```js
const Project = ({ params: { pid } }) => {
  const prj = data[pid];
  return (<div className="project">
    <h1>{prj.name}</h1>
    <p>{prj.descr}</p>
    <TaskList tasks={prj.tasks} />
  </div>);
};
```

### PropTypes

React provides us with a mechanism to validate the nature of properties passed to components.  We can declare the data types of those properties by adding a  `propTypes` static object to our components.  React has two modes of operation, production and development.  In development mode, the default, it will check a good number of things and issue warnings to help us pinpoint any problems ahead of time.  It will skip on this checks when running in production mode. Thus, we can add property validation at no cost to us.

For the above `PrjItem` component we can add the following [property validation](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-2/client/index.js#L13-L16):

```js
PrjItem.propTypes = {
  pid: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
};
```

React provides a good number of [PropTypes](https://facebook.github.io/react/docs/reusable-components.html#prop-validation) to check the properties of any component.  We have used `string` as the data type for `pid` because object property names are always converted to strings even when they originally were numbers.  The optional `isRequired` can be added to any other data type to make it mandatory.  

### Production version

To create the *production* version to be deployed in a real life installation we need to create a new configuration file [`webpack.production.config.js`]() for WebPack.

```js
const webpack = require('webpack');

module.exports = Object.assign(require('./webpack.config.js'), {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
});
```

We are using the original configuration file [`webpack.config.js`]() as the basis and adding one of WebPack's built-in plugins that allows us to add environment variables to the task.  To run it we add another command to our [`package.json` file]():

```
"production": "webpack -p --config webpack.production.config.js"
```

So, if we do `npm run production` we will run WebPack with the new configuration file and also with the `-p` or *production* option which produces a minimized version with all comments and formatting stripped off.

When we run this NPM script, we will get hundreds of warning messages mostly produced by [Uglify](https://www.npmjs.com/package/uglify-js) saying `Condition always false` or `Dropping unreachable code` in many locations.  This is because React has those pieces of code enclosed in a conditional such as:

```js
if (process.env.NODE_ENV !== 'production') {
```

Since we have set `NODE_ENV` to `production` all those pieces of code will not be included in the output.

Our code not only runs faster but after being minified and stripped of all unnecessary code, our `bundle.js` file has gone down from about 840kB to about 180kB, about a fifth in size.

WebPack also has a `-d` option for development, which produces a *SourceMap* which cross-references the output code in the bundle to the original code and helps in debugging.

### Watch for changes

While doing all these changes, we start getting bored of typing the `npm run build` command after every single change.  We can simplify this by using WebPack's *watch* feature with the following extra NPM script command:

```json
"watch": "webpack --watch &",
```

Running WebPack with the `--watch` option tells it to keep an eye on all the dependencies that make up the bundle.  If any of them change, WebPack will automatically rebuild the bundle.  By adding the `&` at the end, we leave it to run in the brackground, freeing us to do `npm start` to start the web server. We do this only for the development version since that is the one we will be changing continuously.  
