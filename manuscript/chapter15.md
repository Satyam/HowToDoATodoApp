# React and Redux

We have used Redux in our React application but in a very primitive way.  Actually, Redux is not a part of React at all and it might very well be used with other application frameworks.  It would be good if we could integrate them in a better way.

From our small application, we can see that there are certain parts that are repeated over and over.  We've seen that both `ProjectList` and `TaskList` which were originally simple stateless components had to be turned into stateful ones and, in both cases, to make use of three methods provided by `React.Component`, namely `forceUpdate`, `componentDidMount` and `componentWillUnmount` and in both cases in exactly the same way:

```js
componentDidMount() {
  this._unsubscriber = store.subscribe(this.forceUpdate.bind(this));
}
componentWillUnmount() {
  this._unsubscriber();
}
```

In both of them we read the state via `store.getStatus()`.

It would be great if we could go back to our original stateless components and let some other *something* deal with the data.  Enter [React-Redux](https://github.com/reactjs/react-redux#react-redux)

## React-Redux

From React-Router we know that not all React components need to be visible. Routes in React-Router can be defined using JSX, i.e.: `<Route path=... component=... />`, just as if we were using any other sort of component.

What if we could split those stateful components we had to write into a simple stateless component as we had before, which deals with showing the data and another one that feeds it with the properties we need, taken from the store.

In Redux parlance, these two types of components are called *presentational* components and *container* components.  

Presentational components are usually simple functions, not classes, that do the rendering from the data they receive in their `props`. They don't even know Redux exists.  

Container components extract the data from the store and provide the contained presentational component with the props it needs.  They don't display anything. Since they are relatively predictable in what they do, just as we've seen with our project and task lists, they just need a few configuration objects.

Conversely, presentational components (since they don't know about Redux) do not dispatch actions.  They fire custom events, as our `Task` component already does.  The container components are the ones that provide the presentational components with the listeners to those events and then dispatch the actions to the store.

There are also several improvements we can do to our basic code.  But first, it is best to arrange these files into separate folders by type of function they perform. We made three folders:

* `actions`: collects all the action constants and helpers
* `reducers`: contains all the reducers for the store
* `components`: for all the components

As a first tentative step, [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/tree/chapter-15-1/client) we simply moved the files around and changed the location to import them from.  All React components went into `components` except for `main.js`.  Actions and reducers (the single one of each we had) were also moved into separate files.   

### Actions

In the `actions` folder we have `projects.js` which contains all the action constants and helpers for projects. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-1/client/actions/projects.js)

```js
export const TOGGLE_COMPLETED = 'Toggle task completed';

export function toggleCompleted(pid, tid) {
  return {
    type: TOGGLE_COMPLETED,
    pid,
    tid,
  };
}
```

Besides the constant we had before, we added a `toggleCompleted` helper function that receives the `pid` and `tid` values and puts them into the action object.  This type of helper function is called an *action creator* because it assembles the action object for us.

The `actions/index.js` file consolidates the actions of all the separate actions files. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-1/client/actions/index.js)

```js
export * from './projects.js';
```

Right now, it simply re-exports the exports of a single file but in the future it might contain several such re-export statements one for each of the separate action files.

### Reducers

In the `reducers` folder we have the reducers for each part of our app, in this case just one, `projects.js`. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-1/client/reducers/projects.js)

```js
import { TOGGLE_COMPLETED } from '../actions';
import data from '../data.js';

export default (state = data, action) => {
  switch (action.type) {
    case TOGGLE_COMPLETED: {
      const pid = action.pid;
      const tid = action.tid;
      const copy = Object.assign({}, state);
      copy[pid].tasks[tid].complete = !state[pid].tasks[tid].complete;
      return copy;
    }
    default:
      return state;
  }
};
```

We import the single action constant from `./actions`.  We don't need to explicitly ask for `./actions/index.js` since WebPack, following NodeJS module system behavior, will default to `index.js` if no file is specified.  As a matter of fact, even the `.js` extensions we've been using so far are redundant since WebPack also tries for files with that extension.

We export a single reducer which handles a single action `TOGGLE_COMPLETED` just as we had earlier.  It also handles two default conditions.

* If it doesn't recognize the action type, it returns the `state` unmodified.  
* If `state` is `undefined` as it will happen the first time it is used, it should return the initial state.  In this case we are using the new [default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters) feature in ES6 to return the initial data from `data.js`.

The `reducers/index.js` serves to *combine* the reducers.  Unlike action constants and action creators which can simply be aggregated, reducers must be combined into a single one.  A single store can only have one reducer so we must use Redux's `combineReducers` function to do that. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-1/client/reducers/index.js)

```js
import { combineReducers } from 'redux';

import projects from './projects.js';

export default combineReducers({
  projects,
  // other reducers ....
});
```

The `combineReducers` method takes an object which lists the various reducers and the part of the store they deal with.  As it is often the case, we name the reducer after the section it handles.  

Originally we loaded the contents of `data.js` straight into the root of the store.  In practice an application will have several sources of data and status information thus it makes sense to put each piece of data in its own branch within the hierarchy of the store.

```js
{
  projects: { /* contents of data.js */ },
  otherbranch: { /* data for that other branch */ }
}
```

Reducers can be combined several levels deep. The result of combining reducers is a reducer, which can be combined with other reducers which can themselves be the result of combining other reducers.  Thus a store can contain information for various sources in different branches in a hierarchy of any depth.

### Store

Now we can create our store. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-2/client/index.js#L6-L9)

```js
import { createStore } from 'redux';
import reducers from './reducers';

const store = createStore(reducers);
```

We create the store via `createStore` using the `reducers` we import from `./reducers/index.js`.

To make it easier for us to write the data containers, we will use [React-Redux](https://github.com/reactjs/react-redux#react-redux) so we first have to load it.

```
npm i --save react-redux
```

To make the store available to all data containers, we use the `<Provider>` component from React-Redux: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-2/client/index.js#L11-L20)

```js
import { Provider } from 'react-redux';

render((
  <Provider store={store}>
    <Router history={createBrowserHistory()}>
      <Route path="/" component={App}>
        {/* ..... */}
      </Route>
    </Router>
  </Provider>
), document.getElementById('contents'));

```

We wrap all our application in this `<Provider>` component which takes the `store` as its single property.  In this case, we are wrapping the `<Router>` component which was our outermost component for the whole application.  If we didn't use Router, we would have done the same with whichever React component that was the outermost one.

Though components communicate with each other via the component properties that they pass to each other down through the hierarchy, sometimes it is good to have some information shared all across the application. That is when React's [context](https://facebook.github.io/react/docs/context.html) feature comes handy. Information set as *context* by one component will be available under `this.context` to all its children.  This is what `<Provider>` does, it makes the `store` available to any possible data container component anywhere in the hierarchy as `this.context.store`.

### Data containers

A quick search for `store` through the files in the `components` folder gives us a list of files that need data containers in the `containers` folder, namely `project.js`, `projectList.js` and `taskList.js`.  Presentational components should not even be aware of Redux or its store so those that currently do import `store.js` in the `components` folder must be changed.

We will use React-Redux `connect` method to wrap our presentational components with the Redux-aware data-container. It will help us with extracting the information the component needs and turning them into properties. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-2/client/components/project.js#L23-L35)

```js
import { connect } from 'react-redux';

const mapStateToProps = (store, props) => {
  const pid = props.params.pid;
  return {
    project: store.projects[pid],
    pid,
  };
};

export default connect(
  mapStateToProps
)(Project);
```

The `mapStateToProps` function produces this mapping. It receives the `store` and the `props` just like any other React component.  

The function should return an object whose keys are the names of the properties to be set on the wrapped component and the values should be taken from the store or the props.  Here, we are producing the `pid` property from the `pid` read from the Router as `props.params.pid` and the `project` property from `store.projects[pid]`.

The `connect` method produces a wrapper function.  We need to tell that wrapper function what to wrap, in this case the presentational `Project` component.

The new purely presentational `Project` component is now much simpler: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-2/client/components/project.js#L5-L13)

```js
const Project = ({ pid, project }) => (
  project
  ? (<div className="project">
      <h1>{project.name}</h1>
      <p>{project.descr}</p>
      <TaskList pid={pid}/>
    </div>)
  : (<p>Project {pid} not found</p>)
);
```

It does no longer care at all about the `store`, it gets the `pid` and `project` as properties and, if there is one returns the JSX for it.

Instead of exporting the `Project` component as we did before, we are exporting the wrapped version so none of our dependencies should change.

It is worth mentioning that the `connect` function does actually return a React component.  If you install a tool such as [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) in Chrome and look at the component hierarchy, you would see:

```
<Component(Project) .... properties .... >
   <Project .... properties .... >
```

Actually, the component wrapper that `connect` produces passes on all the properties it receives, such as the properties set by the Router so in Project we could have read the `pid` from `props.params.pid` as we had before since the wrapper will let it through.

Naming the function `mapStateToProps` is purely conventional, it doesn't even need to be a separate named function, the following would have worked just as well:

```js
import { connect } from 'react-redux';

export default connect(
  (store, props) => {
    const pid = props.params.pid;
    return {
      project: store.projects[pid],
      pid,
    };
  }
)(Project);
```

We have placed the data container wrapper within the same file because it is very tightly related to it. Some developers prefer to put them in separate files, however, we are following the usual convention of having only one component per file except for closely related purely stateless components, and now `Project` is such stateless component.

### Dispatching actions

`Project` had no actions to dispatch.  Since actions are dispatched on the store, our data container should also deal with them. We just need another mapping function: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-2/client/components/taskList.js#L55-L63)

```js
const mapStateToProps = (store, props) => ({
  tasks: store.projects[props.pid].tasks,
});

import { toggleCompleted } from '../actions';

const mapDispatchToProps = (dispatch) => ({
  onTaskItemClick: ({ pid, tid }) => dispatch(toggleCompleted(pid, tid)),
});
```

Besides the store to properties mapper, we map the dispatches to properties.  Our React components can have pseudo-event listeners, just like regular HTML elements have.  In this case, we expect our `TaskList` component to have an `onTaskItemClick` property which we must supply with an event listener function.  Following the convention, we use the `on` prefix for its name and we also expect to receive an event object with the arguments though this is not strictly needed, might have passed the `pid` and `tid` arguments as separate value arguments.

The mapping function receives the `dispatch` argument already bound to the `store` so we can immediately use it to dispatch the action.

We will use both mapping functions in our `connect` wrapper: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-2/client/components/taskList.js#L65-L72)

```js
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskList);
```

The `TaskList` component is no longer a sub-class of `React.Component` but a simple stateless function. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-2/client/components/taskList.js#L26-L42)

```js
function TaskList({ tasks, pid, onTaskItemClick }) {
  const onTaskItemClickHandler = ({ tid }) => {
    onTaskItemClick({ pid, tid });
  };
  return (
    <ul className="task-list">{
      map(tasks, (task, tid) => (
        <Task key={tid}
          descr={task.descr}
          complete={task.complete}
          tid={tid}
          onTaskClick={onTaskItemClickHandler}
        />
      ))
    }</ul>
  );
}
```

`TaskList` receives `tasks` from the store mapping function, `pid` from `Project` because the wrapper passes through all the properties it receives and `onTaskItemClick` from the dispatches mapping function.  

`TaskList` relays the custom `onTaskClick` event it receives from the `Task` component as `onTaskItemClick` with the addition of the `pid` property.


Good as it sounds, unfortunately, this doesn't work quite as expected.  When we click on any task item, we will see the *pending* count on `ProjectList` change but the checkbox in the task item itself does not change.

The problem is that React-Redux optimizes the re-rendering by avoiding it when the values of the properties it would pass to the wrapped component are the same as they were before.  Here, the `tasks` object is always the same, its contents might change, but the reference to `tasks` remains the same thus, doing a shallow compare, the properties always look the same.  We can change this behavior with the `options` argument of `connect`: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-2/client/components/taskList.js#L65-L72)

```js
export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  {
    pure: false,
  }
)(TaskList);
```

We skip the third argument and then provide an `options` argument which is an object with several options. We set `pure` to false.  This means that the wrapped function is not pure in that it doesn't depend purely on the property values themselves but on something else.  The wrapper will then make no assumptions and won't prevent the re-rendering.

This fix is not good.  It is a symptom of something wrong.  A better solution is to separate the `Task` component, currently a stateless function within `taskList.js` and turn it into a Redux-wrapped component.

The `TaskList` component [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-3/client/components/taskList.js) is much simpler than it was before as it doesn't have to deal with providing `Task` with its properties nor of handling its events. Looking at the differences in between versions [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/commit/90c0a7626a8b549b54e7f3e9fc67b3e7c3307e5f#diff-e00bd86cff7cf70308f0b55dcd1f7913R3), we can see in red how much code has gone away.  Much of it has gone to Task but a lot has simply disappeared.  

Much of what is missing in TaskList has been moved to `Task` and its wrapper [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-3/client/components/task.js).

Worth mentioning is `mapStateToProps`: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-3/client/components/task.js#L28)

```js
const mapStateToProps = (state, { pid, tid }) =>
  Object.assign({}, state.projects[pid].tasks[tid]);
```

The mapper simply needs to return an object with `descr` and `complete` properties, which is precisely what a task has so by returning `state.projects[pid].tasks[tid]` that should serve as the map.  However, when deciding when to re-render, the wrapper would once again compare the previous object to the current one and they would be exactly the same object, though the  contents might have changed.  That is why we make a copy of it so it is not the same object, then it goes on to compare the values on the first level. At that point it would decide whether to redraw or not, which is what we wanted.

All this unnecessary cloning of objects is not good for performance, not the one in our single reducer.  In the next chapter, we will see how to improve this.
