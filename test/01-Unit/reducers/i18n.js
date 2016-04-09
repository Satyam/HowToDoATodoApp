const chai = require('chai');
const expect = chai.expect;
const path = require('path');

const i18n = require(path.join(process.cwd(), 'client/reducers/i18n.js'));
const SET_LOCALE_SUCCESS = require(path.join(process.cwd(), 'client/actions/i18n.js')).SET_LOCALE_SUCCESS;
/*
import { SET_LOCALE_SUCCESS } from '../actions';

export default (
  state = {
    locale: 'en-US',
    messages: {},
  },
  action
) => {
  switch (action.type) {
    case SET_LOCALE_SUCCESS:
      return omit(action, 'type');
    default:
      return state;
  }
};
 */

describe('i18n', function () {
  console.log(SET_LOCALE_SUCCESS);
});
