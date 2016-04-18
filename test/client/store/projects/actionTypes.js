
// const expect = require('chai').expect;

const constants = require('client/store/projects/actionTypes.js').default;
const testUtils = require('../../../utils/testUtils.js');

describe('projects/constants', () => {
  it('constants', testUtils.constants(constants, 'projects'));
});
