const chai = require('chai');
const expect = chai.expect;
const path = require('path');

const i18n = require(path.join(process.cwd(), 'client/reducers/i18n.js')).default;
const SET_LOCALE_SUCCESS = require(path.join(process.cwd(), 'client/actions/i18n.js')).SET_LOCALE_SUCCESS;

describe('i18n', function () {
  it('should return the initial state', () => {
    expect(
      i18n(undefined, {})
    ).to.eql({
      locale: 'en-US',
      messages: {}
    });
  });
  it('should add new locale', () => {
    const payload = {
      locale: 'xx-YY',
      messages: {
        a: 1,
        b: 2
      }
    };
    expect(
      i18n({}, Object.assign(
        { type: SET_LOCALE_SUCCESS },
        payload
      ))
    ).to.eql(payload);
  });
  it('should replace existing locale', () => {
    const payload = {
      locale: 'xx-YY',
      messages: {
        a: 1,
        b: 2
      }
    };
    expect(
      i18n({
        locale: 'zz-QQ',
        messages: {
          a: 3,
          b: 4
        }
      }, Object.assign(
        { type: SET_LOCALE_SUCCESS },
        payload
      ))
    ).to.eql(payload);
  });
});
