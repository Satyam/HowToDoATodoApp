import update from 'react-addons-update';

const EDIT_TID = 'misc/setEditTid';

export function setEditTid(tid) {
  return {
    type: EDIT_TID,
    tid,
  };
}

export default (state = { editTid: null }, action) => {
  switch (action.type) {
    case EDIT_TID:
      return update(state, { editTid: { $set: action.tid } });
    default:
      return state;
  }
};
