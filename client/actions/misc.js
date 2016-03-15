export const EDIT_TID = 'Set tid of task to be edited';

export function setEditTid(tid) {
  return {
    type: EDIT_TID,
    tid,
  };
}

export const CLEAR_HTTP_ERRORS = 'Clear HTTP errors';

export function clearErrors() {
  return { type: CLEAR_HTTP_ERRORS };
}
