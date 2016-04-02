import localesSupported from '../messages/localesSupported.js';

import { addLocaleData } from 'react-intl';

export const SET_LOCALE_REQUEST = '[REQUEST] Set locale';
export const SET_LOCALE_SUCCESS = '[SUCCESS] Set locale';
export const SET_LOCALE_FAILURE = '[FAILURE] Set locale';

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
              '../messages/en-US.js',
              'react-intl/locale-data/en',
            ], require => {
              messages = require('../messages/en-US.js');
              addLocaleData(require('react-intl/locale-data/en'));
              resolve();
            });
            break;
          case 'en-GB':
            require.ensure([
              '../messages/en-GB.js',
              'react-intl/locale-data/en',
            ], require => {
              messages = require('../messages/en-GB.js');
              addLocaleData(require('react-intl/locale-data/en'));
              resolve();
            });
            break;
          case 'es-ES':
            require.ensure([
              '../messages/es-ES.js',
              'react-intl/locale-data/es',
            ], require => {
              messages = require('../messages/es-ES.js');
              addLocaleData(require('react-intl/locale-data/es'));
              resolve();
            });
            break;
          default:
            reject(dispatch({
              type: SET_LOCALE_FAILURE,
              url: locale,
              status: '404',
              msg: 'Translation not available',
            }));
        }
      });

      return loadTranslation()
        .then(() => {
          dispatch({
            type: SET_LOCALE_SUCCESS,
            locale,
            messages,
          });
        });
    };
  }
  // #if server-side
  messages = require(`../messages/${locale}.js`);
  return {
    type: SET_LOCALE_SUCCESS,
    locale,
    messages,
  };
  // #end
}
