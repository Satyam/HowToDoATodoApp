const expect = require('chai').expect;

const i18n = require('client/store/i18n/index.js');
const testUtils = require('../../../utils/testUtils.js');

describe('i18n', () => {
  describe('actions', () => {
    it('constants', testUtils.constants(i18n, 'i18n'));
    describe('setLocale', () => {
      console.warn(`
  The test at ${__filename}.
  only tests server-side rendering.
  The client-side code relies on features provided by WebPack.
  `);
      it('should load es-ES', () => {
        const action = i18n.setLocale('es-ES');
        expect(action).to.be.object;
        expect(action).to.have.all.keys('type', 'locale', 'messages');
        expect(action.type).to.equal(i18n.SET_LOCALE_SUCCESS);
        expect(action.locale).to.equal('es-ES');
        expect(action.messages['app.projects']).to.equal('Proyectos');
      });
      it('should load en-GB', () => {
        const action = i18n.setLocale('en-GB');
        expect(action).to.be.object;
        expect(action).to.have.all.keys('type', 'locale', 'messages');
        expect(action.type).to.equal(i18n.SET_LOCALE_SUCCESS);
        expect(action.locale).to.equal('en-GB');
        expect(action.messages['app.projects']).to.equal('Projects');
      });
      it('should fail on non-existing', () => {
        const action = i18n.setLocale('xx-XX');
        expect(action).to.be.object;
        expect(action).to.have.all.keys('type', 'url', 'status', 'msg');
        expect(action.type).to.equal(i18n.SET_LOCALE_FAILURE);
        expect(action.url).to.equal('xx-XX');
        expect(action.status).to.equal('404');
        expect(action.msg).to.equal('Locale not available');
      });
    });
  });
  describe('reducer', () => {
    const reducer = i18n.default;
    it('should return the initial state', () => {
      expect(
        reducer(undefined, {})
      ).to.eql({
        locale: 'en-US',
        messages: {},
      });
    });
    it('should add new locale', () => {
      const payload = {
        locale: 'xx-YY',
        messages: {
          a: 1,
          b: 2,
        },
      };
      expect(
        reducer({}, Object.assign(
          { type: i18n.SET_LOCALE_SUCCESS },
          payload
        ))
      ).to.eql(payload);
    });
    it('should replace existing locale', () => {
      const payload = {
        locale: 'xx-YY',
        messages: {
          a: 1,
          b: 2,
        },
      };
      expect(
        reducer({
          locale: 'zz-QQ',
          messages: {
            a: 3,
            b: 4,
          },
        }, Object.assign(
          { type: i18n.SET_LOCALE_SUCCESS },
          payload
        ))
      ).to.eql(payload);
    });
  });
});
