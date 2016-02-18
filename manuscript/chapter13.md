# Events

Our simple App shows existing information but does not allow us to change it in any way.  To do that we have to respond to events from the UI.

Regular DOM events provide us with information about the DOM element involved and hardware elements such as which mouse button was used, which key was pressed with which modifiers, the cursor coordinates and much more.  However, when we develop our own components we should define what information might be of interest to the developer using that component and provide that.  

Take our [Task](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-2/client/project.js#L4-L8) component.  Could anyone possibly care the precise [x,y] coordinates of the cursor within that component when the button was clicked?  It would be far more important to provide the `tid` of the task.  Thus, we might define our `onClick` having a single property, `tid`. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-1/client/project.js#L4-L16)

```js
const Task = ({ descr, complete, tid, onClick }) => {
  const handler = (typeof onClick === 'function') && (ev => {
    if (ev.button || ev.shiftKey || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    ev.preventDefault();
    onClick({ tid });
  });

  return (
    <li onClick={handler}>
      <input type="checkbox" defaultChecked={complete} /> &nbsp; {descr}
    </li>
  );
};
```

We change the argument list of our `Task` component to receive extra properties, `tid` and `onClick`.  Actually, `Task` is still receiving a single argument, an object, we are adding to the list of names of properties we are destructuring out of that single object.

We define a `handler` for the DOM onClick event which we only define if the component does receive a function as the `onClick` argument.  If the `onClick` argument is not a function, `handler` will be `false`.  The `handler` function will receive the `ev` DOM Event object. First we check if the event was triggered with any mouse button except the primary one, or modified with the shift, alt, meta or control keys.  If any of those conditions is true, we simply return and do nothing.  Otherwise, we call `ev.preventDefault` to signal the DOM that we are taking care of that event and that the default action does not need to be invoked.  Finally, we call the `onClick` callback we received as an argument providing it with an object with a single property, the `tid` of the task clicked.

Finally, we return the actual elements to be rendered much as we did before, except that we are adding an `onClick` DOM event handler to the `<li>` element.

To see it working, we have to modify the `TaskList` component to provide `Task` with the new arguments. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-1/client/project.js#L25-L39)

```js
const TaskList = ({ tasks }) => {
  const handler = ev => console.log('click', ev);
  return (
    <ul className="task-list">{
      Object.keys(tasks).map(tid => (
        <Task key={tid}
          descr={tasks[tid].descr}
          complete={tasks[tid].complete}
          tid={tid}
          onClick={handler}
        />
      ))
    }</ul>
  );
};
```

We define a trivial handler that simply sends to the console the argument it receives.  We also provide the `<Task>` component with the new `tid` and `onClick` properties.  It is important to notice that the way we use the `onClick` property of the `<Task>` component looks very much like the one on the  `<li>` element, we just assign a callback function that will be called when the expected event happens. Both callbacks will receive an object which will contain suitable properties.

As we click on the tasks within the project, we will be able to see in the browser console the messages from our `console.log` handler.  They won't show if we press any of the modifier keys or use any button but the primary one.

To further check that the code doesn't break when the `Task` component does not get an `onClick` handler we may drop the `onClick` property assignment on the `TaskList` component or simply misspell it.  If we have the `npm run watch` command active, WebPack will transpile and repackage everything almost instantaneously.  Now, if we click on the task list items, no message will be shown and, instead, if we click on the checkboxes, they will change their check-marks which they didn't before because of the call to `preventDefault`.

Incidentally, we added an `index.css` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-1/public/index.css) file to change the cursor to a regular pointer on the text portion of the task and referenced it on the `index.html` file [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-1/public/index.html#L6).

We have responded to the UI event signaling the intent of the user to change the completion status of the task but we haven't done that yet.  It should be pretty easy just by changing the event handler in `TaskList`:

```js
const handler = ({ tid }) => {
  const task = tasks[tid];
  task.complete = ! task.complete;
};
```

We are once again using destructuring to take the `tid` property out of the event object.  It is easy to flip the completion status since `TaskList` has a reference to all the tasks in the project.  Now, the problem is to refresh this new state in the UI.

One way to do it would be to call `render` again as we did in `glue.js` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-1/client/glue.js#L12).  It will work but it is a little too extreme!  It would be fast for a small application such as ours but it makes no sense for anything larger.

React uses a *virtual DOM*. It keeps an in-memory and very succinct version of the DOM as it rendered it the last time. Lets call this the *existing* copy.  When it does a refresh, React produces a new copy, the *expected*.  It then compares the *expected* against the *existing* version.   When it finds a difference, it only sends the minimum of commands to change the DOM.

Changes to the DOM are expensive, specially if they involve a re-flow of the whole page.  Producing the *expected* version and comparing it against the *existing* is relatively cheap, however, it is not free, it does take some effort, less than re-rendering the full DOM but it still takes time.

If we can tell React what has actually been changed, React can do much less work.  To do that, we need our components to remember their previous state and know when that state has changed.  So far, we have used *stateless* components, we need to go to *stateful* ones.

## Stateful components

Stateless components are simple functions that receive a series of properties and return whatever should be rendered.   Stateful components are classes derived from `React.Component`.  Lets convert our `TaskList`  stateless component into a stateful one.  [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-2/client/project.js#L27-L52)

```js
class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.tasks;
    this._handler = this.handler.bind(this);
  }
  handler({ tid }) {
    const task = this.state[tid];
    this.setState({ [tid]: Object.assign(task, { complete: !task.complete }) });
  }
  render() {
    const tasks = this.state;
    return (
      <ul className="task-list">{
        Object.keys(tasks).map(tid => (
          <Task key={tid}
            descr={tasks[tid].descr}
            complete={tasks[tid].complete}
            tid={tid}
            onClick={this._handler}
          />
        ))
      }</ul>
    );
  }
}
```

Our earlier `TaskList` function is now a class extending `React.Component`.  It has a `render` method which is basically the same as the whole of the original `TaskList` function, the main difference is that instead of receiving the `tasks` object as an argument, it reads it from `this.state`.

The `state` property, which is inherited from `React.Component` is where React keeps the state of its components. That is what makes them *stateful*.  It should be an object containing whatever information the component needs to render itself. Whenever we change the `state`, React re-renders that component. We can freely read from `this.state` but to change it we must use `this.setState` which merges the properties of the object it receives with the existing state.  Most important, calling `setState` also triggers the re-render.

In a stateful component, it is the `constructor` the one that receives the properties. We set the initial state of the component from those properties.  In this case, we save `props.tasks` into `state` so that the `render` method has them available.  This is the only place where we can set `this.state` directly, elsewhere, we must use `this.setState`.

We are doing something funny with `handler` in the constructor [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-2/client/project.js#L31) and we will come back to that in a moment.  The `handler` method, just like in the stateless version, receives the event object from which we extract the `tid`.  We retrieve the `task` from the tasks stored in the `state` object using that `tid` and then we call `setState` to save back into `state` a new version of that same task with the `complete` property flipped.  The `tid` enclosed in square brackets used as a property name ( i.e.: `{ [tid]:`) is the new ES6 [computer property name](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Computed_property_names) feature.

We are creating a new `task` object instead of just changing the existing one.  That is because `setState` does a shallow merge of the given properties into the existing state.  If we just modified the existing state, `setState` would not know it has been changed because the object, though changed, is still the same.  If we create a new object, `setState` notices the change and triggers the re-rendering.

As with DOM event handlers, the ones for our components lose track of their context, that is, their `this`.  That is why we need to apply `.bind(this)` to it.  We could do it in the `render` method when we assign it to the `onClick` property [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-2/client/project.js#L46) but that is not a good idea since the `render` method might be called multiple times and each time a new bound copy would be generated. Thus, it is better to create a bound version in the constructor [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-2/client/project.js#L31) and use that as the listener.  

We might have done it in this way:

```js
class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.tasks;
    this._handler = ({ tid }) => {
      const task = this.state[tid];
      this.setState({ [tid]: Object.assign(task, { complete: !task.complete }) });
    };
  }
}
```

The body of a *fat arrow* function is automatically bound to the enclosing `this` so there is no need to apply `bind` to it.  I prefer the first solution because if at any time we want to create a new component which inherits from this `TaskList` we would be able to redefine `handler` cleanly.

We have also made a minor change, in our DOM event handler in `Task` we commented out `ev.preventDefault()` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-2/client/project.js#L7-L9) due to [this](https://facebook.github.io/react/docs/forms.html#potential-issues-with-checkboxes-and-radio-buttons) issue.
