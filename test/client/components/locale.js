
const expect = require('chai').expect;

const component = require('client/components/locale.js');
const Locale = component.Locale;
const actions = require('client/store/actions');

import React from 'react';
import TestUtils from 'react-addons-test-utils';

describe('Component: Locale', () => {
  it('with invalid locale it should render all flags', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Locale locale="xx-YY" />);
    const output = renderer.getRenderOutput();
    expect(output.type).to.equal('div');
    expect(output.props.className).to.equal('row locales flags');
    expect(output.props.children).to.have.lengthOf(3);
    output.props.children.forEach(flag => {
      expect(flag.type).to.equal('img');
      expect(flag.props.src).to.have.string(flag.key);
    });
  });
  it('with valid locale it should render all flags except requested', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Locale locale="en-GB" />);
    const output = renderer.getRenderOutput();
    expect(output.type).to.equal('div');
    expect(output.props.className).to.equal('row locales flags');
    expect(output.props.children).to.have.lengthOf(3);
    output.props.children.forEach(flag => {
      expect(flag.type).to.equal('img');
      expect(flag.props.src).to.have.string(flag.key);
      expect(flag.props.className).to.equal(
        flag.key === 'en-GB' ? 'hidden' : '');
    });
  });
  it('should respond to plain left-button click', () => {
    let newLocale;
    const renderer = TestUtils.createRenderer();
    renderer.render(<Locale
      locale="en-GB"
      onLocaleClick={locale => (newLocale = locale)}
    />);
    const output = renderer.getRenderOutput();
    output.props.children.forEach(flag => {
      let wasPrevented = false;
      flag.props.onClick({
        button: 0,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        ctrlKey: false,
        preventDefault: () => (wasPrevented = true),
      });
      expect(newLocale).to.equal(flag.key);
      expect(wasPrevented).to.be.true;
    });
  });
  it('should not respond to qualified clicks', () => {
    let newLocale;
    const renderer = TestUtils.createRenderer();
    renderer.render(<Locale
      locale="en-GB"
      onLocaleClick={locale => (newLocale = locale)}
    />);
    const output = renderer.getRenderOutput();
    output.props.children.forEach(flag => {
      let wasPrevented = false;
      flag.props.onClick({
        button: 0,
        shiftKey: true,
        altKey: false,
        metaKey: false,
        ctrlKey: false,
        preventDefault: () => (wasPrevented = true),
      });
      expect(newLocale).to.be.undefined;
      expect(wasPrevented).to.be.false;
    });
  });
  it('mapStateToProps', () => {
    const mapStateToProps = component.mapStateToProps;
    const locale = { locale: 'xx-YY' };
    expect(mapStateToProps({
      i18n: locale,
    })).to.eql(locale);
  });
  describe('mapDispatchToProps', () => {
    it('with valid locale', () => {
      const mapDispatchToProps = component.mapDispatchToProps;
      const dispatch = action => action;
      const dispatches = mapDispatchToProps(dispatch);
      expect(dispatches).to.have.all.keys('onLocaleClick');
      expect(dispatches.onLocaleClick).to.be.a('function');

      const action = dispatches.onLocaleClick('es-ES');
      expect(action.type).to.equal(actions.SET_LOCALE_SUCCESS);
      expect(action.locale).to.equal('es-ES');
      expect(action.messages).to.be.an('object');
      expect(action.messages).not.to.be.empty;
    });
    it('with bad locale', () => {
      const mapDispatchToProps = component.mapDispatchToProps;
      const dispatch = action => action;
      const dispatches = mapDispatchToProps(dispatch);
      expect(dispatches).to.have.all.keys('onLocaleClick');
      expect(dispatches.onLocaleClick).to.be.a('function');
      const action = dispatches.onLocaleClick('xx-YY');
      expect(action.type).to.equal(actions.SET_LOCALE_FAILURE);
      expect(action.url).to.equal('xx-YY');
      expect(action.status).to.equal('404');
      expect(action.msg).to.equal('Locale not available');
    });
  });
});
