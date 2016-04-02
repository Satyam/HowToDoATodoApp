import React, { PropTypes } from 'react';
import isPlainClick from '../utils/isPlainClick.js';
import { injectIntl, intlShape } from 'react-intl';

import localesSupported from '../messages/localesSupported.js';

const Locale = ({ onLocaleClick, locale }) => {
  const onFlagClickHandler = newLocale => ev => {
    if (isPlainClick(ev)) onLocaleClick(newLocale);
  };
  return (
    <div className="row locales flags">
      {localesSupported.map(loc => (
        loc === locale
        ? null
        : (<img
          key={loc}
          src={`/img/${loc}.png`}
          alt={loc}
          onClick={onFlagClickHandler(loc)}
        />)
      ))}
    </div>
  );
};

Locale.propTypes = {
  onLocaleClick: PropTypes.func,
  locale: PropTypes.string,
};

import { connect } from 'react-redux';

const mapStateToProps = state => ({ locale: state.i18n.locale });

import { setLocale } from '../actions';

const mapDispatchToProps = (dispatch) => ({
  onLocaleClick: locale => dispatch(setLocale(locale)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Locale));
