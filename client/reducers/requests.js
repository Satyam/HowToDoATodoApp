import update from 'react-addons-update';

const operationRegExp = /^\[([A-Z_]+)\].*/;

export default (state = { pending: 0, errors: [] }, action) => {
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
          errors: { $push: [`${action.url}: (${action.status}) - ${action.msg}`] },
        });
    default:
      return state;
  }
};
