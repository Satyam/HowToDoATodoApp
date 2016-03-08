# Tools and helpers

With abstractions such as React and Redux, it gets hard to figure out what is actually happening when something goes wrong.  That is when we most need debugging tools.  There are developer tools available for both.

## React Developer Tools

Available for [Google Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) and [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/) it adds a `React` tab to our debugging pane which allows us to see the rendered components, the properties for all of them and the state of stateful components. If a component has references to DOM elements, the [red](https://facebook.github.io/react/docs/more-about-refs.html) pseudo-attribute, it will also list those.

For the components that has declared their intent to access the context it will show it. Redux data containers access the store via the context so it will show it, however, it will not show the state, since it is not public, only the public methods, which are not helpful at all.  For that, you need the following:

## Redux Dev Tools

We can load [redux-devtools](https://www.npmjs.com/package/redux-devtools) from NPM along other optional utility packages and with a few changes to our code we can see everything that happens in our store.  However, life is much simpler if we use the add-on for [Google Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) which will simply add another tab to our debugging pane and requires just a very small change to our code.  When creating the store, instead of

```js
const store = createStore(reducers);
```

we must do [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-16-1/client/index.js#L13-L18):

```js
const store = createStore(
  reducers,
  process.env.NODE_ENV !== 'production' && window.devToolsExtension
  ? window.devToolsExtension()
  : undefined
);
```

In our WebPack `webpack.production.config.js` configuration file we have used the [webpack.DefinePlugin](http://webpack.github.io/docs/list-of-plugins.html#defineplugin) to add a global `process.env` variable with a property `NODE_ENV` set to `production` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-16-1/webpack.production.config.js#L5-L8) to simulate the NodeJS environment [process.env](https://nodejs.org/docs/latest/api/process.html#process_process_env).  Thus, we load the extension only when we are not creating the *production* version.  This is the same convention that React itself uses.

The Redux tab will show each action as it happens along its payload and the state of the store as it changes.  It also lets us reset the store to its initial state or step back.

The NPM versions requires a more involved setup but it has various loggers that offer various alternatives, such as logging just actions of a certain type or dispatching actions at will.  Here we have further reasons **not** to use `Symbol()` for action types.  Though Redux allows it and we would be able to see them logged, we wouldn't be able to set a filter on them or dispatch such types.

## React Performance tools

It is never a good idea to start thinking about performance until we have a solid application up and running, however, since we are listing debugging tools, we should mention React's own performance tool  [react-addons-perf](https://facebook.github.io/react/docs/perf.html).

As with all packages, it has to be loaded:

```
npm i --save-dev react-addons-perf
```

React add-ons are still part of the main React package thus all the `react-addon-xxxx` modules are just stubs to reach the already existing module and it still possible to do so, however this is discouraged since it will not be so in the future.  However, you might still see articles mentioning the *old* style.  The following two are still equivalent:

```js
if (process.env.NODE_ENV !== 'production') {
  window.Perf = require('react-addons-perf');
  // Old style, deprecated:
  window.Perf = require('react/lib/ReactDefaultPerf');
}
```

 Once again we check the *environment* to ensure the performance add-on will never be added in the production version.

We save the `Perf` object globally in order to make it available everywhere in the application, even right from the browser's debugging console.

When we want to check the performance of a part of our application, we call `Perf.start()`. We can type that command right into the debugger console.  When we reach the end of the section we wanted to test, we call `Perf.end()`.

At that point, we have several commands available, all of which print right into the browser console.  The most useful of those is [`Perf.printWasted()`](https://facebook.github.io/react/docs/perf.html#perf.printwastedmeasurements).  With luck, it will print an empty Array, otherwise, it will show a listing of those components that were called to render, but produced no changes in the DOM so they were a waste of time.

All times shown in all the print commands are relative values. When in development mode, React is much slower than in production mode.  If a generic performance measurement tool is used, we would see that validating the component's `props` via the `propTypes` object takes an inordinate amount of time.  This nor the collection of performance information happens in production mode where the times are much lower.

## Update add-on

In the previous chapter we have a couple of calls to `Object.assign`, one in the reducer [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-3/client/reducers/projects.js#L9) and another in the `Task` component [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-3/client/components/task.js#L28).  All this copying is not good for the performance of our application.

The one in the reducer is particularly inefficient. For a change in a single value deep in the hierarchy, we are copying over the whole section of the store our reducer deals with which, in this case, is basically all of it.

Immutability of the store is one of Redux principles so on a first approach, it would seem that making a copy to freely change seems the only possible solution.  However, if we are changing something in the branch for `pid='34'` why cloning all the other branches?  If they have not changed, it is far more efficient to copy the reference to that branch rather than cloning all the properties and values in it.

Likewise, why cloning all of the branch for `pid='34'` if we only want to modify the `complete` value for `tid='5'`?  We might simply copy the references for all the other branches other than that for `tid='5'` and only create a new object for that particular `tid`.

This would be very hard to do manually. The following is a simple, far from optimized version of our single reducer, just to give an idea of what it would imply.

```js
case TOGGLE_COMPLETED:
  return mapValues(state, (project, pid) =>
    (
      pid !== action.pid
      ? project
      : {
        name: project.name,
        descr: project.descr,
        tasks: mapValues(project.tasks, (task, tid) =>
          tid !== action.tid
          ? task
          : {
            descr: task.descr,
            complete: !task.complete,
          }
        ),
      }
    )
  );
```

Using Lodash [mapValues](http://devdocs.io/lodash~4/index#mapValues) method we loop over the projects in the store and for all projects with a `pid` different from the one we are looking for, we simply copy the reference to the current `project`, not a clone of it (no `Object.assign`) but the very same one.  When the `pid` matches, then we return a new object made of parts of the previous plus all the `task`s whose `tid` is different from the one we are looking for and a new object for the matching one.

We can simplify this using Facebook [react-addons-update](https://facebook.github.io/react/docs/update.html) package.  As usual, we first have to install it:

```
npm i --save react-addons-update
```

Then we can change our reducer in `project.js` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-16-1/client/reducers/projects.js#L8-L11)

```js
import { TOGGLE_COMPLETED } from '../actions';
import data from '../data.js';
import update from 'react-addons-update';

export default (state = data, action) => {
  switch (action.type) {
    case TOGGLE_COMPLETED:
      return update(
        state,
        { [action.pid]: { tasks: { [action.tid]: { complete: { $apply: x => !x } } } } }
      );
    default:
      return state;
  }
};
```

The `update` method returns a new object made in part from the object given as the first argument and changed according to the instructions given in the second argument, an object, which describes the branch we mean to change by providing its property names.  Some of the property names, the ones enclosed in square brackets are *computed property names* and is plain ES6 JavaScript.  The ones starting with `$` are commands, in our case, `$apply` applies the given function to the current value to return the new value.

The `react-addons-update` plugin offers [several methods](https://facebook.github.io/react/docs/update.html#available-commands) to modify the store.

Using this tool we now have dropped the two `Object.assign` calls and made our reducer smaller and much faster.

Incidentally, I took the liberty of changing the checkbox in the task items to  the description stroke-through for completed tasks.  [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-16-1/client/components/task.js#L10-L15) [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-16-1/public/index.css#L17-L20)

## WebPack warnings

When generating the production version via `npm run production`, WebPack will produce pages and pages of warnings.  This might be interesting so we can actually see how much of React validation code is dropped in the production version. We can also see how our own load of `react-addons-perf` gets dropped in production mode.  However, it really isn't very helpful so we might want to drop it.  To do that, we need to turn warnings off by adding the following to the configuration file [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-16-1/webpack.production.config.js#L10-L14):

```js
new webpack.optimize.UglifyJsPlugin({
  compressor: {
    warnings: false
  }
})
```

The Uglify plugin is automatically added when WebPack is run with the `-p` option but to change the default options for the uglifier (that is, the minifier, which produces a small but *ugly* version of our script), we need to load it explicitly.

## UI components

We don't really need to start the graphic design of our pages from scratch, there are a good number of UI components available. Some libraries offer single individual components, but others offer comprehensive sets of the most often used components with a consistent look and feel derived from well known UI libraries, such as Twitter's [Bootstrap](http://react-bootstrap.github.io/), Google's [Material Design](http://www.material-ui.com/#/) or Thinkmill's [Elemental](http://elemental-ui.com/), all ported to React.

All these libraries contain not only simple stateless components to produce nicely styled UI elements (though that makes a large part of it) but also complex stateful components such as dropdown menus.  We will not use any of those libraries in the example in this book to avoid confusion in between what our code does and what the imported style library does.  

## Flux Standard Actions

Actions must have a `type` property but the rest is left for us to determine. We have created our actions much like standard DOM event objects, where all the information is flat at the top of the object.  However, the action object is clearly split in between the mandatory `type` and a payload, which is what the resolver acts upon.  

It makes sense to formalize this split and also standardize some other possible contents. That is what the [Flux Standard Action](https://github.com/acdlite/flux-standard-action) does.  The FSA action object will always contain the mandatory `type` property and usually will contain a `payload` property which is an object with the associated data.  It may also contain `error` and `meta` properties. There are several [libraries](https://github.com/acdlite/flux-standard-action#libraries) that help in handling FSA actions.

This is particularly useful when dealing with remote servers.  It is often the case that the data associated with the action must be sent to the server. It is easier if all this data is under a single property `payload` that can be passed on verbatim rather than having to filter `type` out of the action object.  Also, by having all our data under `payload` we are free to have a piece of data called `type` without conflicting with the action `type`.

Since remote operations are also subject to all sorts of potential exceptional conditions, it is also good to have a standard place to put any error information within the action object, hence the optional `error` property.

## Routes in Redux

A big part of the state of an application is the URL.  Shouldn't it be stored in the single Redux store just like everything else?  That is what the popular and tested [react-router-redux](https://www.npmjs.com/package/react-router-redux) and the new [redux-router](https://www.npmjs.com/package/redux-router) try to do.

As we have seen in our data containers [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/master/client/components/project.js#L26), they do have access to the routing properties when they are children of a `Route` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/master/client/index.js#L30).  If the resulting mapped properties send to the contained component are different from the previous ones, the component will be re-rendered, regardless of whether the changed properties came from the store or other properties such as the routing information.

The Router also places a reference to itself in the context, just as Redux's `<Provider>` wrapper does for its store, so that every component will have access to it as `this.context.router`.  To access it, any component must declare a validation for it, for example, the container for `Task`, which has no access to the router, could change from: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-16-1/client/components/task.js#L37-L40)

```js
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Task);
```

To the following:

```js
const ConnectedTask = connect(
  mapStateToProps,
  mapDispatchToProps
)(Task);

Object.assign(ConnectedTask.contextTypes, {
  router: React.PropTypes.object.isRequired,
});

export default ConnectedTask;
```

Instead of exporting our wrapper right away, we assign it to a constant so we can have a reference to it.  Using `Object.assign` we merge into the `contextTypes` object of the wrapper (which already contains a validation for the store) a validation for the `router` instance.  This is the way to let React know that we are interested in `router`.  We then export the data container.

With that validation, either mapping function can use `this.context.router` to reach any of its [methods](https://github.com/reactjs/react-router/blob/latest/docs/API.md#contextrouter).
