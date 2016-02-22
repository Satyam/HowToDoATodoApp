# Actions, Stores, Flux and Redux

Allowing each React component to deal directly with its own data turns out to be impractical except in the simplest cases.  As we have seen in the previous chapter, when two different components show the same data, there is the problem of how to notify each other of changes.  If the data resides in a remote server, as is often the case, sharing responsibility on those remote operations further complicates the matter.

A possible solution to these issues comes in the form of *actions*, *stores* and a consistent direction in the flow of information.  These ideas were presented by Facebook as the [Flux](https://facebook.github.io/flux/) architecture.

Basically, the idea is that all data should reside in a *store*. Components will always show information from this store. Any external event that might affect the data should trigger an *action*, a sort of custom event which broadcasts the request for any change along with the information to be changed.   Stores received these actions and change the data accordingly and then notify components of the changes.

Lets go back to our example of projects and tasks lists.  In the `Task` component, when we got a click on the list item we fired our own custom `onClick` event. The parent `TaskList` component subscribed to this custom event and when it received the event, it changed the data. Why would `TaskList` do it instead of `Task` itself or why wouldn't it `TaskList` propagate it upwards in the hierarchy of components?  If it did so, the event might have eventually reached `ProjectList` and made it aware that the pending count had changed so it updated itself.  However, this would have implied propagating the event through too many components, making them all too dependent on one another. There is not really a single good answer to that.

In the Flux architecture, the mechanism is for `Task`, on receiving the `onClick` DOM event, to *dispath* an *action* indicating the `type` of action (usually a constant equated to a descriptive string) and the `tid` of the task affected.

All actions are received and acted upon by the store or stores which hold the data.  Components will subscribe to receive notification of changes in the data they are interested in.  When they get such notification, they refresh themselves reading the newly updated information from the store.

The DOM might not be the only source of *actions*. Receiving new data from the server is also a valid source of actions, be it in response to an earlier HTTP request or through a [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) `message` event.

Whichever way it might be triggered, the mechanism is simple and predictable, any sort of external event dispatches an action that goes to the store which then updates the data and notifies the interested components that there have been changes so they refresh themselves.

All this also makes it easier to test. A test suite is also a good source of actions.

Though Facebook has implemented a [Flux library](https://www.npmjs.com/package/flux), Flux is basically a concept, an architecture, and as such, there are many implementations.  Probably the most popular of them is [Redux](http://redux.js.org/) which is what we will use.

## Redux

To use it we first have to load it:

```
npm i --save redux
```

We need to define the constants that represent the action types.  We add an `actions.js` file which will just contain action constants.  It is good to concentrate all action constants in a single file because they should be unique and it is easier to ensure they are unique if they are all in just one file.

We might use the new [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) object which will always produce unique symbols, but the problem with those is that they are completely local to each client. If we ever plan to send actions from remote sources via WebSockets or any other mechanism, Symbols cannot be serialized into a message.

We only have one action to deal with, toggling the completion state of a task.  We define a constant to represent that action type, which we export. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-14-1/client/actions.js)

```js
export const TOGGLE_COMPLETED = 'Toggle task completed';
```

Next we create our store.  We will do it from the `data.js` using Redux's [`createStore`](http://redux.js.org/docs/api/createStore.html) method. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-14-1/client/store.js)

```js
import { createStore } from 'redux';
import data from './data.js';

// ....
export default createStore(reducer, data);
```

We immediately export the store that `createStore` returns.  That will be our single store for all the application.  We initialize the store with `data` which we read from `data.js`.

The first argument to `createStore` is a *reducer*.  In Redux parlance, a *reducer* is a function that receives the current state of the store and an action and returns the new state of the store.

Our store handles just two cases, one is the `TOGGLE_COMPLETED` action, the other is *anything else*.  Redux requires that when a reducer does not recognize an action, it should return the state unmodified. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-14-1/client/store.js#L4-L18)

```js
import { TOGGLE_COMPLETED } from './actions.js';

const reducer = (state, action) => {
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

Our simple reducer switches on `action.type`.  As mentioned, on the `default`, we simply return the state.  For `TOGGLE_COMPLETED`, we read the `pid` and `tid` that will go along the `type` within the action object.

An important design consideration in Redux is that the state object should never be modified, the reducer should always return a new state object, based on the original one suitably modified. So, we first make a copy of the original state object via `Object.assign` and in that copy, we set the value of the property we want to have changed.  

It might seem that all this copying of potentially large stores might slow things down but, as it turns out, it allows for some optimizations elsewhere that somehow compensate for this.  Besides, it allows for certain features either impossible or hard to manage in other ways such as [infinite undo/redo](http://redux.js.org/docs/recipes/ImplementingUndoHistory.html) since, after all, it is just a matter of keeping track of all those immutable states.

To get everything started, the component needs to dispatch the action: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-14-1/client/taskList.js#L40-L46)

```js
handler({ tid }) {
  store.dispatch({
    type: TOGGLE_COMPLETED,
    pid: this.props.pid,
    tid,
  });
}
```

The new `handler` no longer changes the data directly, it simply dispatches the action to the store with all the necessary information.

Any component that needs to be aware of changes in the store needs to subscribe to it. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-14-1/client/taskList.js#L34-L39)

```js
componentDidMount() {
  this._unsubscriber = store.subscribe(this.forceUpdate.bind(this));
}
componentWillUnmount() {
  this._unsubscriber();
}
```

The `componentDidMount` and `componentWillUnmount` methods of `React.Component` are a good place to subscribe/unsusbscribe since they are complementary to one another. The `store.subscribe` method returns a function that, when called, unsubscribes the listener so we save it into a property.  The callback simply calls `forceUpdate` to get the component re-rendered.

Finally, while initially the component got the list of tasks to enumerate from `this.props.tasks` now it takes them from the store via `getState`: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-14-1/client/taskList.js#L47-L63)

```js
render() {
  const projects = store.getState();
  const tasks = projects[this.props.pid].tasks;
```

We also have to change `ProjectList` so it can subscribe to the changes in the count of pending tasks.  Our original `ProjectList` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-6/client/projectList.js#L27-L48) was a stateless component so we first have to change it to a statefull component so it gets all the extra methods inherited from `React.Component such as `forceUpdate`, `componentDidMount` and `componentWillUnmount`. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-14-1/client/projectList.js#L27-L59)

Subscribing and unsubscribing is just the same as in `TaskList` and now instead of reading the data from `data.js` it reads it from the store via `store.getState()`. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-14-1/client/projectList.js#L40)

This example has been mainly focused on the basics of Redux, however, it is rarely used like this. Instead of providing all the functionality that every developer might need, Redux has concentrated in doing extremely well the minimal set of core functionality, delegating all bells and whistles to the very many extras available from NPM.

## Redux principles

Redux is based on a few very basic principles.

### Single source of truth

All data and state information is stored in just one place, the *store*.  No more wondering where should this or that be stored, who is responsible, how to notify the interested parties.  All data goes into the store.

Our store only contains information about projects.  Should we need to store other information, we simply nest the project information under some property within the single store.  For example, instead of creating our store via

```js
const store = createStore(reducer, data);
```

We might do:

```js
const store = createStore(reducer, { projects: data, otherInfo: otherData });
```

### Components don't modify the store

As far as components are concerned, the store is read-only.  Components don't write into the store, they just read from it via `getState`.  Whenever a change is needed, they `dispatch` an action with all required information.

### All actions are handled by *reducers*

Reducers are functions that receive the current state and an action and return the new state. Though we have just one reducer in our example which receives the whole of the store as its state, in practice, we will write reducers to handle each a little part of the store, and then combine them via the aptly named `combineReducers`.  Each set of reducers would receive only the part of the store it is prepared to handle.  For example, if we nested the store as shown earlier, we might have:

```js
const reducer = combineReducers({
  projects: projectReducers,
  otherInfo: otherInfoReducers,
});
```

Redux will use the keys to extract that part of the hierarchy of data within the store and call the corresponding reducer with only that part.

### Reducers return a new state object

Reducers should never modify the state received.  They should always return a new state object with the relevant information changed.

### Reducers must return the unmodified state on unknown actions.

All reducers receive all the actions whether they matter to them or not.  Thus, if a reducer doesn't know about a certain action type, it should return the same state it has received instead of `null` or `undefined` because some other reducer might deal with that action.

### Reducers must return the default initial state if state is undefined.

This is usually handled via the new ES6 default argument value feature.

```js
const reducer = function(state = someInitialState, action) {/*...*/};
```

### All reducers are pure functions

Reducers should only depend on the arguments it receives, the `state` and the `action`.  It should never rely on other possible sources of state information.  These are called *pure* functions.  They are extremely easy to test since they don't have any memory of previous states which can affect their outcome.
