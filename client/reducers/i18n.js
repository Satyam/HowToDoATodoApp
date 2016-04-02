import omit from 'lodash/omit';

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
