import React from 'react';
import { connect } from 'react-redux';
import { setAuthToken } from '@sentinel-hub/sentinelhub-js';

import AnonymousAuth from './AnonymousAuth';
import store, { authSlice } from '../store';
import { getApiKeyFromLocalStorage } from './auth.utils';

class AuthProvider extends React.Component {
  componentDidMount() {
    const apiKey = getApiKeyFromLocalStorage();
    if (!apiKey) {
      return;
    }
    store.dispatch(authSlice.actions.setApiKey(apiKey));
  }

  setAnonToken = (token) => {
    store.dispatch(authSlice.actions.setAnonToken(token));
    setAuthToken(token);
  };

  render() {
    const { anonToken } = this.props;
    return (
      <>
        <AnonymousAuth setAnonToken={this.setAnonToken} />
        {anonToken ? (
          this.props.children
        ) : (
          <div className="initial-loader">
            <i className="fa fa-cog fa-spin fa-3x fa-fw" />
          </div>
        )}
      </>
    );
  }
}

const mapStoreToProps = (store) => ({
  anonToken: store.auth.anonToken,
});
export default connect(mapStoreToProps)(AuthProvider);
