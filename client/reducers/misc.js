import { EDIT_TID } from '../actions';
import update from 'react-addons-update';

export default (state = { editTid: null }, action) => {
  switch (action.type) {
    case EDIT_TID:
      return update(state, { editTid: { $set: action.tid } });
    default:
      return state;
  }
};
