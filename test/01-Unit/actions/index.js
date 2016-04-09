const chai = require('chai');
const expect = chai.expect;
const _ = require('lodash');
const path = require('path');

const actionModuleNames = [
  'i18n',
  'misc',
  'projects'
];

const actionModules = {};
actionModuleNames.forEach(name => (
  actionModules[name] = require(path.join(process.cwd(), `client/actions/${name}.js`))
));
const actionNames = _.map(actionModules, Object.keys);

describe('checking for duplicate names', function () {
  it('in between them', function () {
    expect(
      _.flattenDeep(actionNames)
    ).to.eql(
      _.union(...actionNames)
    );
  });
  it('against react-router-redux', function () {
    expect(
      _.intersection(
        _.flattenDeep(actionNames),
        ['push', 'replace', 'go', 'goBack', 'goForward']
      )
    ).to.have.lengthOf(0);
  });
});
describe('Checking for duplicate string constants', function () {
  it('should all be different', function () {
    const map = {};
    _.each(actionModules, (mod, moduleName) => _.each(mod, (value, name) => {
      if (typeof value === 'string' && name === name.toUpperCase()) {
        if (value in map) {
          expect(
            value,
            `${name} in ${moduleName}.js duplicates ${map[value].name} in ${map[value].moduleName}.js`
          ).to.satisfy(value => !(value in map));
        }
        map[value] = { name, moduleName };
      }
    }));
  });
});
