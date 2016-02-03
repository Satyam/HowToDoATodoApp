const index = require('./index.js');
const project = require('./project.js');

if (/^\/(index\.html)?$/i.test(location.pathname)) {
  index();
} else if (/^\/project\.html$/i.test(location.pathname)) {
  project();
} else {
  document.getElementById('contents').innerHTML =
    `Page ${location.pathname} is not available`;
}
