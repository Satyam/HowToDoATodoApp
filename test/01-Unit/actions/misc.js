const chai = require('chai');
const expect = chai.expect;
const path = require('path');

const misc = require(path.join(process.cwd(), 'client/actions/misc.js'));

describe('misc', function () {
  it('constants', function () {
    expect(misc.EDIT_TID).to.equal('Set tid of task to be edited');
    expect(misc.CLEAR_HTTP_ERRORS).to.equal('Clear HTTP errors');
  });
  describe('action creators', function () {
    it('setEditTid', function () {
      const action = misc.setEditTid(2345);
      expect(action).to.be.object;
      expect(action).to.have.all.keys('type', 'tid');
      expect(action.type).to.equal(misc.EDIT_TID);
      expect(action.tid).to.equal(2345);
    });
    it('clearErrors', function () {
      const action = misc.clearErrors();
      expect(action).to.be.object;
      expect(action).to.have.all.keys('type');
      expect(action.type).to.equal(misc.CLEAR_HTTP_ERRORS);
    });
  });
});
