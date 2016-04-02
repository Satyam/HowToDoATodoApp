export default dispatchAsync => Connector => class extends Connector {
  componentWillMount() {
    // super.componentDidMount();
    const d = dispatchAsync(this.store.dispatch, this.props, null, this.state.storeState);
    this.noNeedToUpdate = d === false;
    if (d instanceof Promise) {
      this.noNeedToUpdate = true;
      d.then(() => {
        this.noNeedToUpdate = false;
      });
      this.store.pendingPromises.push(d);
    }
  }
  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(nextProps);
    const d = dispatchAsync(this.store.dispatch, nextProps, this.props, this.state.storeState);
    this.noNeedToUpdate = d === false;
    if (d instanceof Promise) {
      this.noNeedToUpdate = true;
      d.then(() => {
        this.noNeedToUpdate = false;
      });
    }
  }
  shouldComponentUpdate() {
    const noNeed = this.noNeedToUpdate;
    this.noNeedToUpdate = false;
    return !noNeed && super.shouldComponentUpdate();
  }
};
