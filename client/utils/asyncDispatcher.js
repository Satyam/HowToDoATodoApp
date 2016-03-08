export default (dispatchAsync, Connector) => class extends Connector {
  componentDidMount() {
    super.componentDidMount();
    this.noNeedToUpdate =
      dispatchAsync(this.store.dispatch, this.props, null, this.state.storeState) === false;
  }
  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(nextProps);
    this.noNeedToUpdate =
      dispatchAsync(this.store.dispatch, nextProps, this.props, this.state.storeState) === false;
  }
  shouldComponentUpdate() {
    const noNeed = this.noNeedToUpdate;
    this.noNeedToUpdate = false;
    return !noNeed && super.shouldComponentUpdate();
  }
};
