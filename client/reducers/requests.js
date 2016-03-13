import update from 'react-addons-update';
import { CLEAR_HTTP_ERRORS } from '../actions';

const operationRegExp = /^\[([A-Z_]+)\].*/;

export default (state = { pending: 0, errors: [] }, action) => {
  switch (action.type) {
    case CLEAR_HTTP_ERRORS:
      return update(state, { errors: { $set: [] } });
    default:
      switch (action.type.replace(operationRegExp, '$1')) {
        case 'REQUEST':
          return update(state, { pending: { $apply: x => x + 1 } });
        case 'SUCCESS':
          return update(state, { pending: { $apply: x => x - 1 } });
        case 'FAILURE':
          return update(
            state,
            {
              pending: { $apply: x => x - 1 },
              errors: { $push: [
                `${action.type.replace('[FAILURE] ', '')}:
                ${action.url}: (${action.status}) - ${action.msg}`,
              ] },
            });
        default:
          return state;
      }
  }
};
