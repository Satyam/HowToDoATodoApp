const expect = require('chai').expect;
const misc = require('client/store/misc/index.js');
const { testConstants } = require('../../../utils');

describe('Store: misc', () => {
  describe('actions', () => {
    it('constants', testConstants(misc, 'misc'));
    describe('action creators', () => {
      it('setEditTid', () => {
        const action = misc.setEditTid(2345);
        expect(action).to.be.object;
        expect(action).to.have.all.keys('type', 'tid');
        expect(action.type).to.equal(misc.EDIT_TID);
        expect(action.tid).to.equal(2345);
      });
    });
  });
});
