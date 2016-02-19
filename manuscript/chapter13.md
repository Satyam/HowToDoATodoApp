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
    this._handler = this.handler.bind(this);
  }
  handler({ tid }) {
    const task = this.props.tasks[tid];
    task.complete = !task.complete;
    this.forceUpdate();
  }
  render() {
    const tasks = this.props.tasks;
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

Our earlier `TaskList` function is now a JavaScript class extending `React.Component`.  It has a `render` method which is basically the same as the whole of the original `TaskList` function, the main difference is that instead of receiving the `tasks` object as an argument, it reads it from `this.props`.

The `props` property contains the pseudo-attributes of the component when it was created.  It is the same as the single argument the earlier stateless component received. In a stateful component, it is the `constructor` the one that receives the properties.

We are doing something funny with `handler` in the constructor [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-2/client/project.js#L30) and we will come back to that in a moment.  The `handler` method, just like in the stateless version, receives the event object from which we extract the `tid`.  We retrieve the `task` from the tasks stored in the `props` object using that `tid` and change the `complete` status.  Then we call `forceUpdate` to tell React that this component has changed and should be re-rendered.  It is `React.Component` which provides these extras such as `forceUpdate` that lets us control rendering. It also allows React to identify what needs to be updated.  With a stateless component, React has nothing to put the tag on to signal it needs updating.  With an object instance, it has something it can reference.

As with DOM event handlers, the ones for our components lose track of their context, that is, their `this`.  That is why we need to apply `.bind(this)` to it.  We could do it in the `render` method when we assign it to the `onClick` property [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-2/client/project.js#L46) but that is not a good idea since the `render` method might be called multiple times and each time a new bound copy would be generated. Thus, it is better to create a bound version in the constructor [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-2/client/project.js#L30) and use that as the listener.  

We might have done it in this way:

```js
class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.tasks;
    this._handler = ({ tid }) => {
      const task = this.props.tasks[tid];
      task.complete = !task.complete;
      this.forceUpdate();
    };
  }
}
```

The body of a *fat arrow* function is automatically bound to the enclosing `this` so there is no need to apply `bind` to it.  I prefer the first solution because if at any future time we want to create a new component which inherits from this `TaskList` we would be able to redefine `handler` cleanly.

It would be fair to ask where is the state in a stateful component.  There is, indeed, a `this.state` property that can store the component state as an object containing multiple properties.  The component can read freely from this `this.state` object but, to change it, it must use the `this.setState` method which takes an object with the properties and values to be changed.  This method will also mark the component for re-rendering if anything has changed.  The use of `this.state` is being discouraged as state machines are harder to test and debug than plain functional components, ones that simply depend on their input, for components, `this.props` rather than internally stored state.

We have also made a minor change, in our DOM event handler in `Task` we commented out `ev.preventDefault()` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-2/client/project.js#L7-L9) due to [this](https://facebook.github.io/react/docs/forms.html#potential-issues-with-checkboxes-and-radio-buttons) issue.

## Putting some order into our files

Our project has grown a little wild, some components are not where they should.  It is the standard that components should be each in its own file, except for stateless components when they are totally subordinate to the main component in the file.

Though our earlier `glue.js` file was meant as a means to glue together `project.js` and `index.js` it deserves a better name so it is now `main.js` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-3/client/main.js). Since this is the entry point of the application, it had to be reflected in `webpack.config.js` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-3/webpack.config.js#L2).

The `App` and `NotFound` stateless components which were within `glue.js` now have their own separate files `app.js` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-3/client/app.js) and `notFound.js` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-3/client/notFound.js).

The `NotFound` component now informs which path is the one that has not been found.  It gets this information from the Router which provides the component with plenty of information about how it got there.

The `App` component is now a true frame providing some real options, well... at the moment, just one, listing the available projects.  At this point we are using a plain `<Link>` component which renders as a plain anchor `<a>`.  In a real project, it might be a menu or a tabbed interface.  What it still has is a placeholder for the children it will contain: `{props.children}` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-3/client/app.js#L8).  This is important.  Whenever there is a `<Route>` which contains nested `<Route>` elements, the parent component should have a `{props.children}` placeholder to put the contents of the components in the nested routes.  Failing to provide such a placeholder will not issue an error nor warning, the children will not be rendered, plain and simple.

Our earlier `index.js` file is now `projectList.js` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-3/client/projectList.js) because it actually contains a list of the available projects. Likewise, the `Index` component is now `ProjectList`. Early on, `index.js` was the entry point of our pre-React application and that is why it received the default name for an entry-point. That is no longer the case.

The `project.js` file [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-3/client/project.js) contained too many components, even an stateful one.  Thus, the `TaskList` and `Task` components have been moved into their own file, `taskList.js` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-3/client/taskList.js).  The `Task` component is a stateless component totally subordinated to `TaskList` so it doesn't deserve its own separate file.

We have also changed the routes:

```js
render((
  <Router history={createBrowserHistory()}>
    <Route path="/" component={App}>
      <Route path="project" component={ProjectList}>
        <Route path=":pid" component={Project}/>
      </Route>
      <Route path="*" component={NotFound}/>
    </Route>
  </Router>
), document.getElementById('contents'));
```

We have `App` as an overall container.  It has the main menu, though at this point it has only one option, listing the projects.  This `App` menu will show if its own path or any of the subordinated paths are matched.  Since one of those paths is `'*'` which shows the `NotFound` component, `App` will always have a match, even if it is `NotFound`.

If the route is `/project` or `/project/:pid`, the `ProjectList` will show.  Once again, it will show with either its own path `/project` or upon matching any subordinate route `/project/:pid`.  Notice how the nested paths get concatenated in the actual URL.

In our earlier version, we either had the projects list or the information about a single project.   In this version we have a hierarchy of information starting at the main menu, followed by the projects list and then, if a project is selected, information about it. The nesting of the routes reflect this.

We have a problem.  Once a project is selected and its details shown in the bottom panel, the projects lists still shows as a link, even though that project has already been selected.  It would be good to highlight the selected project and drop the link around it. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-4/client/projectList.js#L22-L37)

```js
const ProjectList = ({ children, params: { pid: activePid } }) => (
  <div className="project-list">
    <h1>Projects:</h1>
    <ul>{
      Object.keys(data).map(pid =>
        (<PrjItem key={pid}
          active={activePid === pid}
          pid={pid}
          name={data[pid].name}
        />)
      )
    }</ul>
  <hr/>
  {children}
  </div>
);
```

We can easily do this by using the `params` property that the Router provides our components.  Via destructuring we extract the `pid` from the `params` object and call it `activePid`.  `activePid` can be the actual `pid` of the selected project or `undefined` if no project has been selected yet.

We then add a `active` property to the `PrjItem` component.  We set it by comparing the `activePid` to the `pid` of the project being rendered.  If they are the same, then we are rendering the active project. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-4/client/projectList.js#L5-L15)

```js
const PrjItem = ({ pid, name, active }) => (
  <li className={active ? 'selected' : ''}>
    {
      active
      ? name
      : (<Link to={`/project/${pid}`}>
          {name}
        </Link>)
    }
  </li>
);
```

We use that extra `active` property in two conditional expressions within `PrjItem`.  One of them adds a `className` to the list item and the other decides whether to show the plain name for the active project or a link to navigate to it.

We do something very similar in `App` since, once we have clicked on our single menu item, there is no point in keeping it as a link. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-4/client/app.js#L4-L14)

By the way, in JSX, since we are mixing HTML and JavaScript, we can't use the `class` HTML attribute because it is a reserved word in JavaScript.  Likewise with `for`.  Instead we use `className` and `htmlFor` respectively.

Lets go a little further.  Why don't we add a count of pending tasks along the list of projects?  We will provide an extra numeric `pending` property to `PrjItem` so we can show it along each of the project names. We calculate it in `ProjectList` like this:

```js
pending={
  Object.keys(data[pid].tasks).reduce(
    (count, tid) => data[pid].tasks[tid].complete ? count : count + 1,
    0
  )
}
);
```

We use `Array.reduce` over each of the projects to add 1 into `count` for each task that is not yet complete.  It is not a good piece of code, it won't last long.  It is there just to show one issue.

As we click on the tasks for a particular project, though the marks on the checkboxes change indicating their completion status, the counts of *pendings* on the projects list don't change at all.  However, if we click on a different project, then the pending counts suddenly get updated to their correct values.

The problem is that though we are updating the data and we are telling `TaskList` to re-render itself by calling `this.forceUpdate`, this does not apply to components higher in the hierarchy.  Clicking on any of the project links re-renders them and then the counts are updated.

We will fix this in the next chapter.

## Lodash

After seeing all those `Object.keys` calls, it is time to wonder if there is anything better.  The problem is that though Arrays have `.map`, `.reduce` and `.filter` methods, Objects don't. Fortunately there are libraries of utilities to solve this.  One of the best is [Lodash](https://lodash.com/) an improved version of [Underscore](http://underscorejs.org/) which was named like that because it was usually named with the underscore `_` symbol.

To use Lodash, we first need to download the package:

```
npm i --save lodash
```

We may load the whole package in the scripts we need it:

```js
const _ = require('lodash');
```

The examples shown in the documentation assume we've loaded it in this way, which makes all of the dozens of functions available at once.  However, this would make WebPack include the whole library in the bundle. A better option for us is to include only the parts we need: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-6/client/projectList.js#L4-L5)

```js
const map = require('lodash/map');
const reduce = require('lodash/reduce');
```

We can clearly see the benefits of Lodash with this side by side comparison [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-5/client/projectList.js#L28-L40) vs. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-6/client/projectList.js#L31-L43)

<table><tr><th>Before</th><th>After</th></tr>
<tr><td><pre>`
Object.keys(data).map(pid =>
  (<PrjItem key={pid}
    active={activePid === pid}
    pid={pid}
    name={data[pid].name}
    pending={
      Object.keys(data[pid].tasks).reduce(
        (count, tid) =>
          data[pid].tasks[tid].complete ? count : count + 1,
        0
      )
    }
  />)
)
`</pre></td>
<td><pre>`
map(data, (prj, pid) =>
  (<PrjItem key={pid}
    active={activePid === pid}
    pid={pid}
    name={prj.name}
    pending={
      reduce(prj.tasks,
        (count, task) =>
          task.complete ? count : count + 1,
        0
      )
    }
  />)
)
`</pre></td></tr></table>

It is worth noting that both [`map`](https://lodash.com/docs#map) and [`reduce`](https://lodash.com/docs#reduce) work in Array or Objects or as they are called in Lodash *Collections*.
