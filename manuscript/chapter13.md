# Events

Our simple App shows existing information but does not allow us to change it in any way.  To do that we have to respond to events from the UI.

Regular DOM events provide us with information about the DOM element involved and hardware elements such as which mouse button was used, which key was pressed with which modifiers, the cursor coordinates and much more.  However, when we develop our own components we should define what information might be of interest to the developer using that component and provide that.  

Take our [Task](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-12-2/client/project.js#L4-L8) component.  Could anyone possibly care the precise [x,y] coordinates of the cursor within that component when the button was clicked?  It would be far more important to provide the `tid` of the task.  Thus, we might define our `onClick` having a single property, `tid`. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-1/client/project.js#L4-L16)

```js
const Task = ({ task, tid, onClick }) => {
  const handler = (typeof onClick === 'function') && (ev => {
    if (ev.button || ev.shiftKey || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    ev.preventDefault();
    onClick({ tid });
  });

  return (
    <li onClick={handler}>
      <input type="checkbox" defaultChecked={task.complete} /> &nbsp; {task.descr}
    </li>
  );
};
```

We change the argument list of our `Task` component to receive extra properties, `tid` and `onClick`.  Actually, `Task` is still receiving a single argument, an object, we are adding to the list of names of properties we are destructuring out of that single object.

We define a `handler` for the DOM onClick event which we only define if the component does receive a function as the `onClick` argument.  If the `onClick` argument is not a function, `handler` will be `false`.  The `handler` function will receive the `ev` DOM Event object. First we check if the event was triggered with any mouse button except the primary one, or modified with the shift, alt, meta or control keys.  If any of those conditions is true, we simply return and do nothing.  Otherwise, we call `ev.preventDefault` to signal the DOM that we are taking care of that event and that the default action does not need to be invoked.  Finally, we call the `onClick` callback we received as an argument providing it with an object with a single property, the `tid` of the task clicked.

Finally, we return the actual elements to be rendered much as we did before, except that we are adding an `onClick` DOM event handler to the `<li>` element.

To see it working, we have to modify the `TaskList` component to provide `Task` with the new arguments. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-1/client/project.js#L27-L36)

```js
const TaskList = ({ tasks }) => {
  const handler = ev => console.log('click', ev);
  return (
    <ul className="task-list">{
      Object.keys(tasks).map(tid => (
        <Task key={tid} task={tasks[tid]} tid={tid} onClick={handler}/>
      ))
    }</ul>
  );
};
```

We define a trivial handler that simply sends to the console the argument it receives.  We also provide the `<Task>` component with the new `tid` and `onClick` properties.  It is important to notice that the way we use the `onClick` property of the `<Task>` component looks very much like the one on the  `<li>` element, we just assign a callback function that will be called when the expected event happens. Both callbacks will receive an object which will contain suitable properties.

As we click on the tasks within the project, we will be able to see in the browser console the messages from our `console.log` handler.  They won't show if we press any of the modifier keys or use any button but the primary one.

To further check that the code doesn't break when the `Task` component does not get an `onClick` handler we may drop the `onClick` property assignment on the `TaskList` component or simply misspell it.  If we have the `npm run watch` command active, WebPack will transpile and repackage everything almost instantaneously.  Now, if we click on the task list items, no message will be shown and, instead, if we click on the checkboxes, they will change their check-marks which they didn't before because of the call to `preventDefault`.

Incidentally, we added an `index.css` [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-1/public/index.css) file to change the cursor to a regular pointer on the text portion of the task and referenced it on the `index.html` file [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-13-1/public/index.html#L6).
