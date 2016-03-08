# Async operations

Since we started with React and reverted to our `data.js` file loaded in memory all our operations have been synchronous, whenever we did something, it happened everywhere all at once.  This is hardly the case in real life.  The client will deal with information that is stored in a remote server and reaching it will always require asynchronous operations.

We have already dealt with this transition once at the server side when we did a similar transition from using very much the same `data.js` file loaded on the server to using SQLite.  Our server still uses SQLite and offers us a data API which we haven't been using since our first client-side scripts [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/tree/chapter-10-3/client).

Currently, our client-side application loads `data.js` as the initial value for the store in our single reducer [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-16-1/client/reducers/projects.js). From then on, all the information is permanently available in the client. We need to request the data from the server on demand.

Remote requests have two phases, the request itself and the response which might be successful or not.  This changes must be reflected in our application, for example, by showing a spinner while the data is being fetched, an error message if it failed or, hopefully, the requested data. For the components to show any of that, those states must be in the store somehow and the only way to modify the store is via actions.

That is why for every remote operation we will define three actions with three different suffixes, `_REQUEST`, `_SUCCESS` and `_FAILURE`.  Thus, to produce our projects list, we will have `PROJECT_LIST_REQUEST` which will initiate the request for data, and `PROJECT_LIST_SUCCESS` when the reply arrives.  Occasionally we might receive a `PROJECT_LIST_FAILURE` so we must plan for it as well.

It is easy to envision where to dispatch the request action, the data container component could do that as with any other action.  However, where can we dispatch the rest of the actions?  Most http request packages will either expect a callback to be called when the reply arrives, or will return a Promise to be resolved with the reply.  The problem is, how can we provide these callbacks with a reference to the store `dispatch` function to dispatch the reply actions?

It would be great to have some means to tell Redux when an action will be resolved in the future and tell it what to do at that point.  Redux on its own has no ability to do this, whenever it receives an action, it acts upon it straight away.  But we can expand Redux's abilities via middleware.

Redux Middleware

We have already used middleware in the server-side code.  Generically, middleware is a piece of code that stands in the middle. In Express, the middleware is able to intercept requests, possibly do something about them, and then let them pass on to its final destination or not.  We even wrote some middleware ourselves [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-9-2/server/routes.js#L16-L65) to validate the request parameters before they get into the function that actually processes the request.

In Redux, middleware stands in between the actions dispatched and the reducers that process them.  Just as Express middleware receives the http request, Redux middleware receives the action dispatches and can do something with it before it gets processed by the reducers.

In this case, we need middleware that is able to process asynchronous actions, that is, actions that will have effects in the future.

There is a package [redux-thunk](https://www.npmjs.com/package/redux-thunk) by the same author of Redux that helps us deal with this.  We install it just like a regular dependency:

```
npm i --save redux-thunk
```

As with all middleware, we somehow need to register the middleware.  In Express, we used `app.use`, like with `bodyParser`, `express.static` and some others.  With Redux we use `applyMiddleware` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-17-1/client/index.js#L13-L21)

```js
const store = createStore(
  reducers,
  compose(
    applyMiddleware(reduxThunk),
    process.env.NODE_ENV !== 'production' && window.devToolsExtension
    ? window.devToolsExtension()
    : undefined
  )
);
```

The `createStore` method requires the combined `reducers` as its first argument, then an optional initial state for the store, usually an object and then an *enhancer*, a function that adds capabilities.  If the second argument is not an object but a function, `createStore` assumes it to be the *enhancer*.  We were already using one such enhancer, the Redux developer tools.  We use another enhancer, `applyMiddleware` that is part of Redux.  The `compose` function, also part of Redux is simply a generic utility function that when called, calls each of the functions passed as its arguments in sequence.  Since we have a single slot for enhancers and we have two of them we need to call both of them in sequence, that is all `compose` does.

When we dispatch an action, this is a simple object with at least a `type` property.  To tell Redux that an action will have secondary effects in the future, instead of a simple object we dispatch a function, `redux-thunk` gets all the actions and, if any of them is a function instead of an object, it will call it with a reference to the `dispatch` function  bound to the store.

So, from the developer point of view, it is quite simple.

* If we dispatch an object, it is a regular synchronous action that will be taken care of immediately.
* If we dispatch a function, it is an asynchronous action, `redux-thunk` will intercept it and call it with a reference to the `dispatch` method.  The function is then responsible to dispatch further actions at its convenience.   

To dispatch actions, we usually use *action creators*. For example, we have a simple synchronous action creator to toggle task completion status [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-17-1/client/actions/projects.js):

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

An asynchronous action creator looks like this [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-17-1/client/actions/requests.js#L8-L31) :

```js
export const ALL_PROJECTS_REQUEST = '[REQUEST] Project list';
export const ALL_PROJECTS_SUCCESS = '[SUCCESS] Project list received';
export const ALL_PROJECTS_FAILURE = '[FAILURE] Project list request failed';

export function getAllProjects() {
  return dispatch => {
    dispatch({
      type: ALL_PROJECTS_REQUEST,
    });
    return http.get('/projects')
      .then(
        response => dispatch({
          type: ALL_PROJECTS_SUCCESS,
          data: response.data,
        }),
        response => dispatch({
          type: ALL_PROJECTS_FAILURE,
          status: response.status,
          msg: response.statusText,
          url: response.config.url.replace(response.config.baseURL, ''),
        })
      );
  };
}
```

We already have our three action type constants following our convention of a common base name plus the suffixes `_REQUEST`, `_SUCCESS` and `_FAILURE`. As a further convention, we will always start their descriptions with `[REQUEST]`, `[SUCCESS]` and `[FAILURE]` respectively.  We will see why in a moment.

The `getAllProjects` action creator returns a function, a *fat arrow* function, that expects `dispatch` as its argument. This is the key for `redux-thunk` to know this is an asynchronous action. The first thing it does is call `dispatch` to dispatch the REQUEST action to notify all interested parties that a request is going out.  Then it sends the actual HTTP request using Axios as we already did in our server tests [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/master/test/server.js#L74-L100)

Axios returns a Promise so, when it is resolved, we dispatch either a SUCCESS action or a FAILURE action, each with its associated data.  These two actions will happen some time after the original request is sent.  All actions dispatched from the asynchronous action are synchronous themselves, they are all plain objects but they could also be further asynchronous actions, Redux doesn't mind at all.

We return the Promise that Axios returns.  This is not mandatory, `redux-thunk` doesn't care about the return value, it will simply pass it on as the return of the action creator function, just in case it cares about it.  In our case, we don't, but it is good to know it is available to us.

Now we need the reducers to process these actions.  Originally, we simply had our store initialized from `data.js` and we handled a single action, `TOGGLE_COMPLETED`: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-16-1/client/reducers/projects.js#L1-L15):

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

Now, our initial state will be an empty object, since we won't have `data.js` and we have to handle one more action [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-17-1/client/reducers/projects.js)

```js
import update from 'react-addons-update';

import {
  TOGGLE_COMPLETED,
  ALL_PROJECTS_SUCCESS,
} from '../actions';

export default (state = {}, action) => {
  switch (action.type) {
    case TOGGLE_COMPLETED:
      return update(
        state,
        { [action.pid]: { tasks: { [action.tid]: { complete: { $apply: x => !x } } } } }
      );
    case ALL_PROJECTS_SUCCESS:
      return action.data.reduce(
        (prjs, prj) => update(prjs, { $merge: { [prj.pid]: prj } }),
        state
      );
    default:
      return state;
  }
};
```

We initialize the `state` of the store with an empty object and wait for the `ALL_PROJECTS_SUCCESS` for it to be loaded.  Since the data in the response is an array, we use Array [reduce] method to return the new state using the current state as the initial state for `reduce`.  For each item, we use `update` to merge the new values into the original state. The resulting state will have one item more than required, the `pid` as a value in the object, not just as the key, and will lack the `tasks` list which the server API call doesn't provide and the project list does not require.

The `projects` reducer does not care about the REQUEST or FAILURE actions, only the SUCCESS one.  Actions, like DOM events, are notifications of things happening, whether anything else is interested in doing something about them or not is another matter.  However, we may use those notifications to show a loading spinner while the request is being processed and we do need to show error messages, if they happen.

To do that, we need to change the shape of the store.  We do that by adding a new reducer on a separate branch [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-17-1/client/reducers/index.js):


```js
import { combineReducers } from 'redux';

import projects from './projects.js';
import requests from './requests.js';

export default combineReducers({
  projects,
  requests,
});
```

We add a `requests` reducer to the list of reducers we combine to build the store so that we now have two branches in the store, `projects` and `requests`.  The `requests` reducer will deal with the HTTP API [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-17-1/client/reducers/requests.js)


```js
import update from 'react-addons-update';

const operationRegExp = /^\[([A-Z_]+)\].*/;

export default (state = { pending: 0, errors: [] }, action) => {
  switch (action.type.replace(operationRegExp, '$1')) {
    case 'REQUEST':
      return update(state, { pending: { $apply: x => x + 1 } });
    case 'SUCCESS':
      return update(state, { pending: { $apply: x => x - 1 } });
    case 'FAILURE':
      return update(
        state,
        {
          pending: { $apply: x => x - 1 },
          errors: { $push: [`${action.url}: (${action.status}) - ${action.msg}`] },
        });
    default:
      return state;
  }
};
```

The `requests` branch of the store will only have two items, `pending` which is a count of how many requests are pending a reply and `errors`, an array of error messages returned by failed requests.

For each request, we increment `pending` in one, for each reply, whether successful or not, we decrement it.  For each failed reply, we add an error message to the `errors` array built from the information in the action.

Notice that the switch is not based on the actual action type constants but on the string for each one.  That is why when we created those action type constants we used a standard format for the string [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-17-1/client/actions/requests.js#L8-L10)


```js
export const PROJECT_BY_ID_REQUEST = '[REQUEST] Project info';
export const PROJECT_BY_ID_SUCCESS = '[SUCCESS] Project info received';
export const PROJECT_BY_ID_FAILURE = '[FAILURE] Project info request failed';
```

The `switch` branches based on the bracketed text in the string.  That means that as far as the `requests` reducer is concerned, we don't need to keep adding named constants for each extra HTTP API operation we add as long as it can match the operation type.

It is not unusual for organizations to establish standards for the strings corresponding to action types.  Unlike `Symbol()` which will always provide a unique symbol even if the descriptions match, strings can repeat and confuse the reducers.  The named constants they are represented will cause an error from the transpiler if they are repeated but the contents of the string can be the same and no one would know, that is why large organizations might establish standards on the contents of the action type strings to ensure uniqueness.  Safer, however, might be to export a single object with the action types as properties:

```js
export default {
  PROJECT_BY_ID_REQUEST: '[REQUEST] Project info',
  PROJECT_BY_ID_SUCCESS: '[SUCCESS] Project info received',
  PROJECT_BY_ID_FAILURE: '[FAILURE] Project info request failed',
}
```

For our small application, we don't need to trouble ourselves with this.

## Dispatching initial loading actions

We have seen how to create asynchronous actions and how to handle them, but we have not fired any yet.  Where should we do that?

Stateful React components have [several methods](https://facebook.github.io/react/docs/component-specs.html#lifecycle-methods) that are called during the lifecycle of a component (stateless components are a simple function used for rendering, nothing more).  Three of them are of particular interest to us.  

The [`componentDidMount`](https://facebook.github.io/react/docs/component-specs.html#mounting-componentdidmount) method is called when the component is loaded for the first time. As the documentation says, this is a perfect place to send AJAX requests or, in our case, dispatch an action to initiate such a request.

The [`componentWillReceiveProps`](https://facebook.github.io/react/docs/component-specs.html#updating-componentwillreceiveprops) will be called on any further update of the component presumably because the properties might have changed. The properties might not have actually changed, doing a thorough check on all the values, specially on deeply nested objects, is too expensive so React calls this method more often than what is actually required and lets us decide.  

The [`shouldComponentUpdate`](https://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate) is the place when we make that decision. Usually this method is not written until after we do some performance analysis and detect too much [time wasted](https://facebook.github.io/react/docs/perf.html#perf.printwastedmeasurements) in some specific components.

We could rewrite some of our components and turn them from stateless to stateful to make use of these lifecycle methods, but that would be a pity. Stateless components are new but are expected to benefit from huge performance improvements in the future since they are so lightweight.  It would be a bad idea to weight them down with extra code.

However, each of the stateless components that need data from the store are wrapped with a stateful component which is the one that actually deals with the store through the `mapStateToProps` and `mapDispatchToProps` methods.  Wouldn't it make sense to have the data containers be the ones responsible to dispatch the data loading actions?

Stateless components are really new in React so, up to until now there was no motivation to keep stateless components lightweight, all components were stateful.  I am sure that solutions to this issue will come, in the meantime, I use mine.

The [`connect`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) method of `react-redux` actually returns a stateful component.  Though we often call it a *wrapper* it is, indeed, a fully featured React component.  React components are not instances but classes which we can extend and have their methods redefined.  That is what I've done in `utils/asyncDispatcher.js` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-17-1/client/utils/asyncDispatcher.js).


```js
export default (dispatchAsync, Connector) => class extends Connector {
  componentDidMount() {
    super.componentDidMount();
    this.noNeedToUpdate =
      dispatchAsync(this.store.dispatch, this.props, null, this.state.storeState) === false;
  }
  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(nextProps);
    this.noNeedToUpdate =
      dispatchAsync(this.store.dispatch, nextProps, this.props, this.state.storeState) === false;
  }
  shouldComponentUpdate() {
    const noNeed = this.noNeedToUpdate;
    this.noNeedToUpdate = false;
    return !noNeed && super.shouldComponentUpdate();
  }
};
```

Without going into too much detail what this module does is to `extend` the class `Connect` which it receives as an argument and redefines its `componentDidMount` and `componentWillReceiveProps` methods.  In each of them, it first calls the original `super` version and then calls a `dispatchAsync` method which it also has received as an argument.  It provides that function with a reference to the `dispatch` method, the new updated properties, the current old properties (none on componentDidMount since it is the first time) and the state of the store.

This is how it is used [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-17-1/client/components/projectList.js#L63-L76)


```js
import asyncDispatcher from '../utils/asyncDispatcher.js';
import { getAllProjects } from '../actions';

const dispatchAsync = (dispatch, nextProps, currentProps, state) => {
  if (isEmpty(state.projects)) {
    dispatch(getAllProjects());
    return false;
  }
};

export default asyncDispatcher(dispatchAsync, connect(
  mapStateToProps
)(ProjectList));
```

In this case, taken from the `ProjectList`, if `state.projects` is empty `dispatchAsync` dispatches the action created by `getAllProjects`.  Additionally, since we know the data is not there yet, we `return false` to tell the component that there is no need to update the screen. The `asyncDispatcher` uses this return value to set a `noNeedToUpdate` property that it then uses in `shouldComponentUpdate` to tell React it is not worth updating.

To apply `asyncDispatcher` to our data container we simply call it using the `dispatchAsync` function and the data container that wraps `ProjectList`.  We can export the returned class immediately as it is still a valid data container.

So far we have modified `ProjectList` and the related actions and reducer.  We must do the same with the `Project` component and its actions.

It should be noted that there is not way to ensure which reply will come first that is why the reducers must be able to handle the SUCCESS responses in any order [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-17-1/client/reducers/projects.js#L16-L25), preserving the state of the store as it might have parts already filled in by other replies.

It is also important to provide the render methods in our components with an alternative when the data is not there yet. Originally, all our data was there from the very start, we were safe to assume that to be so.  With remote data, that is no longer true.  For example, the `TaskList` component must now check whether `tasks` is not null before attempting rendering [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-17-1/client/components/taskList.js#L6-L17).

Finally, since our store now has a count of pending HTTP requests and communication errors, if any, we should show them. We can do that in the `App` component [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-17-1/client/components/app.js#L11-L14)

```html
<p className="loading" style={ { display: busy ? 'block' : 'none' } }>Busy</p>
<pre className="errors" style={ { display: errors.length ? 'block' : 'none' } }>
  {errors.join('\n')}
</pre>
```

With the addition of a data container via the `connect` method, we show a `busy` sign whenever `pending` is not zero and show the errors, if any.
