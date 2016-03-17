import React from 'react';
import { Route } from 'react-router';
import App from './components/app.js';
import ProjectList from './components/projectList.js';
import Project from './components/project.js';
import NotFound from './components/notFound.js';
import EditProject from './components/editProject.js';

export default (<Route path="/" component={App}>
  <Route path="project" component={ProjectList}>
    <Route path="newProject" component={EditProject} />
    <Route path="editProject/:pid" component={EditProject} />
    <Route path=":pid" component={Project} />
  </Route>
  <Route path="*" component={NotFound} />
</Route>
);
