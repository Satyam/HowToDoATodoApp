const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const i18n = require(path.join(process.cwd(), 'client/actions/i18n.js'));

describe('i18n', function () {
  it('constants', function () {
    expect(i18n.SET_LOCALE_REQUEST).to.equal('[REQUEST] Set locale');
    expect(i18n.SET_LOCALE_SUCCESS).to.equal('[SUCCESS] Set locale');
    expect(i18n.SET_LOCALE_FAILURE).to.equal('[FAILURE] Set locale');
  });
  describe('setLocale', function () {
    console.warn(`
The test at ${__filename}.
only tests server-side rendering.
The client-side code relies on features provided by WebPack.
`);
    it('should load es-ES', function () {
      const action = i18n.setLocale('es-ES');
      expect(action).to.be.object;
      expect(action).to.have.all.keys('type', 'locale', 'messages');
      expect(action.type).to.equal(i18n.SET_LOCALE_SUCCESS);
      expect(action.locale).to.equal('es-ES');
      expect(action.messages['app.projects']).to.equal('Proyectos');
    });
    it('should load en-GB', function () {
      const action = i18n.setLocale('en-GB');
      expect(action).to.be.object;
      expect(action).to.have.all.keys('type', 'locale', 'messages');
      expect(action.type).to.equal(i18n.SET_LOCALE_SUCCESS);
      expect(action.locale).to.equal('en-GB');
      expect(action.messages['app.projects']).to.equal('Projects');
    });
    it('should fail on non-existing', function () {
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
