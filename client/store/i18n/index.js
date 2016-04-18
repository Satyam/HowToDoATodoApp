import localesSupported from 'client/messages/localesSupported.js';
import restAPI from 'client/utils/restAPI.js';
import omit from 'lodash/omit';

const api = restAPI('data/v1/i18n');

import { addLocaleData } from 'react-intl';

const NAME = 'i18n/setLocale';

export const SET_LOCALE_REQUEST = `${NAME}/REQUEST`;
export const SET_LOCALE_SUCCESS = `${NAME}/SUCCESS`;
export const SET_LOCALE_FAILURE = `${NAME}/FAILURE`;

export function setLocale(locale) {
  let messages = {};
  if (localesSupported.indexOf(locale) === -1) {
    return {
      type: SET_LOCALE_FAILURE,
      url: locale,
      status: '404',
      msg: 'Locale not available',
    };
  }
  if (typeof window !== 'undefined') {
    return dispatch => {
      dispatch({
        type: SET_LOCALE_REQUEST,
        locale,
      });

      const loadTranslation = () => new Promise((resolve, reject) => {
        switch (locale) {
          case 'en-US':
            require.ensure([
              'client/messages/en-US.js',
              'react-intl/locale-data/en',
            ], require => {
              messages = require('client/messages/en-US.js');
              addLocaleData(require('react-intl/locale-data/en'));
              resolve();
            });
            break;
          case 'en-GB':
            require.ensure([
              'client/messages/en-GB.js',
              'react-intl/locale-data/en',
            ], require => {
              messages = require('client/messages/en-GB.js');
              addLocaleData(require('react-intl/locale-data/en'));
              resolve();
            });
            break;
          case 'es-ES':
            require.ensure([
              'client/messages/es-ES.js',
              'react-intl/locale-data/es',
            ], require => {
              messages = require('client/messages/es-ES.js');
              addLocaleData(require('react-intl/locale-data/es'));
              resolve();
            });
            break;
          default:
            reject('Translation not available');
        }
      });

      return Promise.all([
        loadTranslation(),
        api.read(`/locale/${locale}`),
      ])
        .then(
          () => dispatch({
            type: SET_LOCALE_SUCCESS,
            locale,
            messages,
          }),
          reason => dispatch({
            type: SET_LOCALE_FAILURE,
            url: locale,
            status: '404',
            msg: reason,
          })
        );
    };
  }
  // #if server-side
  messages = require(`client/messages/${locale}.js`);
  return {
    type: SET_LOCALE_SUCCESS,
    locale,
    messages,
  };
  // #end
}

export default function reducer(
  state = {
    locale: 'en-US',
    messages: {},
  },
  action
) {
  switch (action.type) {
    case SET_LOCALE_SUCCESS:
      return omit(action, 'type');
    default:
      return state;
  }
}
