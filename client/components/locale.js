import React, { PropTypes } from 'react';
import isPlainClick from 'client/utils/isPlainClick.js';
import { injectIntl } from 'react-intl';

import localesSupported from 'client/messages/localesSupported.js';

export const Locale = ({ onLocaleClick, locale }) => {
  const onFlagClickHandler = newLocale => ev => {
    if (isPlainClick(ev)) onLocaleClick(newLocale);
  };
  return (
    <div className="row locales flags">
      {localesSupported.map(loc => (
        <img
          key={loc}
          className={loc === locale ? 'hidden' : ''}
          src={`/img/${loc}.png`}
          alt={loc}
          onClick={onFlagClickHandler(loc)}
        />
      ))}
    </div>
  );
};

Locale.propTypes = {
  onLocaleClick: PropTypes.func,
  locale: PropTypes.string,
};

import { connect } from 'react-redux';

export const mapStateToProps = state => ({ locale: state.i18n.locale });

import { setLocale } from 'client/actions';

export const mapDispatchToProps = (dispatch) => ({
  onLocaleClick: locale => dispatch(setLocale(locale)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Locale));
