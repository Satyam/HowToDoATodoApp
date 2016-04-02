import * as fs from 'fs';
import {sync as globSync} from 'glob';
import localesSupported from '../client/messages/localesSupported.js';
import forEach from 'lodash/each';
import reduce from 'lodash/reduce';

const BASE_LOCALE = 'en-US';
const translations = {};
const changes = {};

const msgFileName = locale => `./client/messages/${locale}.js`;

forEach(localesSupported, locale => {
  const fileName = msgFileName(locale);
  changes[locale] = 0;
  try {
    fs.accessSync(fileName, fs.R_OK | fs.W_OK);
  } catch (err) {
    console.warn(err, fileName);
    return;
  }
  let msgFile = fs.readFileSync(fileName, 'utf8');
  msgFile = msgFile
   .substr(msgFile.indexOf('{')) // trim whatever is before the first curly brace
   .replace(/^\s*\/\/.+$/gm, '') // drop the comments
   .replace(/,\s*\}/g, '}'); // drop the last comma before the closing brace
  translations[locale] = reduce(JSON.parse(msgFile), (t, defaultMessage, id) => {
    t[id] = { defaultMessage };
    return t;
  }, {});
});

const currentMessages = translations[BASE_LOCALE];

const newMessages = globSync('./client/extracted/**/*.json')
  .map(filename => fs.readFileSync(filename, 'utf8'))
  .map(file => JSON.parse(file))
  .reduce((collection, descriptors) => {
    descriptors.forEach(({id, defaultMessage, description}) => {
      if (collection.hasOwnProperty(id)) {
        throw new Error(`Duplicate message id: ${id}`);
      }
      collection[id] = { defaultMessage, description };
    });
    return collection;
  }, {});

forEach(newMessages, ({ defaultMessage, description }, id) => {
  forEach(localesSupported, locale => {
    const ts = translations[locale];
    const t = ts[id];
    if (t) {
      t.status = currentMessages[id].defaultMessage === defaultMessage ? 'Ok' : 'Changed';
      t.description = description;
    } else {
      ts[id] = {
        status: 'New',
        defaultMessage,
        description
      };
    }
    if (t.status !== 'Ok') changes[locale] += 1;
  });
});

const esc = JSON.stringify;

forEach(localesSupported, locale => {
  const output = fs.createWriteStream(msgFileName(locale));
  const write = new console.Console(output).log;
  write('/* eslint-disable */');
  write('module.exports = {');
  forEach(translations[locale], ({ defaultMessage, description, status }, id) => {
    write('');
    write(`// ${description}`);
    switch (status) {
      case 'Ok':
        write(`${esc(id)}: ${esc(defaultMessage)},`);
        break;
      case 'New':
        if (locale === BASE_LOCALE) {
          write(`${esc(id)}: ${esc(defaultMessage)},`);
        } else {
          write('// ***');
          write(`// Original in ${BASE_LOCALE}: ${esc(defaultMessage)}`);
          write(`${esc(id)}: "",`);
        }
        break;
      case 'Changed':
        write('// ***');
        write(`// Previous in ${BASE_LOCALE}: ${esc(currentMessages[id].defaultMessage)}`);
        write(`// Previous in ${locale}: ${esc(defaultMessage)}`);
        if (locale === BASE_LOCALE) {
          write(`${esc(id)}: ${esc(newMessages[id].defaultMessage)},`);
        } else {
          write(`// new in ${BASE_LOCALE}:      ${esc(newMessages[id].defaultMessage)}`);
          write(`${esc(id)}: "",`);
        }
        break;
      default:
        write('// ***');
        write(`// Deleted: ${esc(id)}: ${esc(defaultMessage)},`);
        break;
    }
  });
  write('}');
});

console.log('Translations changed:');
let any = 0;
forEach(changes, (count, locale) => {
  if (count) {
    any += 1;
    console.log(locale, count);
  }
});
if (!any) console.log('none');
