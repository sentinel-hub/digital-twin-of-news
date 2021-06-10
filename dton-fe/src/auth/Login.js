import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import store, { authSlice } from '../store';
import { saveApiKeyToLocalStorage, removeApiKeyFromLocalStorage } from './auth.utils';

import './Login.scss';

function Login(props) {
  const { currentApiKey } = props;
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const history = useHistory();

  function onSetApiKey() {
    store.dispatch(authSlice.actions.setApiKey(apiKey));
    saveApiKeyToLocalStorage(apiKey);
    history.push('/');
  }

  function onClearApiKey() {
    store.dispatch(authSlice.actions.setApiKey(null));
    removeApiKeyFromLocalStorage(apiKey);
    history.push('/');
  }

  return (
    <div className="login-api-key">
      <label htmlFor="api-key">API key: </label>
      <input type="text" id="api-key" value={apiKey} onChange={(ev) => setApiKey(ev.target.value)} required />
      <button onClick={onSetApiKey}>Set API key and use edit panel</button>
      {currentApiKey && <button onClick={onClearApiKey}>Remove edit panel</button>}
    </div>
  );
}

const mapStoreToProps = (store) => ({
  currentApiKey: store.auth.apiKey,
});

export default connect(mapStoreToProps, null)(Login);
