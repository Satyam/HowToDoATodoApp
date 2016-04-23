const expect = require('chai').expect;

import { TaskList } from 'client/components/taskList.js';
import { Task } from 'client/components/task.js';
import { EditTask } from 'client/components/editTask.js';
import { EDIT_TID } from 'client/store/actions';

import { loadJSDOM, dropJSDOM, fullRender, data, mockStore } from '../../utils';
import messages from 'client/messages/en-US.js';

describe('Component: taskList', () => {
  before(loadJSDOM);
  after(dropJSDOM);
  it('With no editTid it should produce 3 Tasks', () => {
    const taskList = fullRender(
      TaskList,
      {
        tasks: data[25].tasks,
        pid: '25',
      }
    );
    expect(taskList.find(Task)).to.have.lengthOf(3);
    const editTask = taskList.find(EditTask);
    expect(editTask).to.have.lengthOf(1);
    expect(editTask.prop('tid')).to.be.undefined;
  });
  it('With editTid it should produce 2 Tasks and 1 EditTask', () => {
    const taskList = fullRender(
      TaskList,
      {
        tasks: data[25].tasks,
        pid: '25',
        editTid: '2',
      }
    );
    expect(taskList.find(Task)).to.have.lengthOf(2);
    const editTask = taskList.find(EditTask);
    expect(editTask).to.have.lengthOf(1);
    expect(editTask.prop('tid')).to.equal('2');
  });
  it('With no tasks it should show sign of no tasks plus one EditTask', () => {
    const taskList = fullRender(
      TaskList,
      {
        pid: '99',
      }
    );
    const editTask = taskList.find(EditTask);
    expect(editTask).to.have.lengthOf(1);
    expect(editTask.prop('tid')).to.be.undefined;
    expect(taskList.text()).to.have.string(messages['taskList.noTasks'].replace('{pid}', 99));
  });
  it('Click on a task edit button', () => {
    const store = mockStore({
      projects: data,
    });
    const taskList = fullRender(
      TaskList,
      {
        tasks: data[25].tasks,
        pid: '25',
      },
      store
    );
    const task = taskList.find('Task').first();
    const tid = task.prop('tid');
    task.find('.glyphicon-pencil').simulate('click');
    const actionsList = store.getActions();
    expect(actionsList).to.have.lengthOf(1);
    const action = actionsList[0];
    expect(action.type).to.equal(EDIT_TID);
    expect(action.tid).to.equal(tid);
  });
});
